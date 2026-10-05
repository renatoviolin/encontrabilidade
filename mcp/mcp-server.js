// MCP da loja modelo — expõe o back (ACP/UCP fake) + auditoria do publicado (GEO).
// Roda: npm start em trabalho-pratico/src/mcp/ (stdio; back em :3111 no ar)
// Tools: search_products, get_product, compare_products, checkout, audit_store

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BACK_URL = process.env.BACK_URL || 'http://localhost:3111';
const FRONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'frontend');

const out = (obj) => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] });

async function backGet(p) {
  const res = await fetch(`${BACK_URL}${p}`);
  if (!res.ok) throw new Error(`back ${res.status} em ${p}`);
  return res.json();
}

async function backPost(p, body) {
  const res = await fetch(`${BACK_URL}${p}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

const server = new McpServer({ name: 'fatec-shop', version: '1.0.0' });

server.registerTool(
  'search_products',
  {
    description: 'Busca produtos no catálogo (texto, categoria, ordenação). Lê o back, não o HTML.',
    inputSchema: { q: z.string().optional(), category: z.string().optional(), sort: z.enum(['menor', 'maior', 'avaliacao']).optional() },
  },
  async ({ q = '', category = '', sort = '' }) => {
    const qs = new URLSearchParams({ ...(q && { q }), ...(category && { category }), ...(sort && { sort }) });
    const items = await backGet(`/api/products${qs.size ? '?' + qs : ''}`);
    return out(items.map((p) => ({ id: p.id, name: p.name, price: p.price, stock: p.stock, battery: p.battery, rating: p.rating })));
  }
);

server.registerTool(
  'get_product',
  {
    description: 'Detalhe de 1 produto (preço, estoque, specs, avaliação).',
    inputSchema: { id: z.string() },
  },
  async ({ id }) => out(await backGet(`/api/products/${encodeURIComponent(id)}`))
);

server.registerTool(
  'compare_products',
  {
    description: 'Tabela comparativa lado a lado (preço, estoque, bateria, avaliação).',
    inputSchema: { ids: z.array(z.string()).min(2) },
  },
  async ({ ids }) => {
    const items = await Promise.all(ids.map((id) => backGet(`/api/products/${encodeURIComponent(id)}`)));
    const md = ['| Produto | Preço | Estoque | Bateria | Nota |', '|---|---|---|---|---|',
      ...items.map((p) => `| ${p.name} | R$ ${p.price.toFixed(2)} | ${p.stock > 0 ? p.stock : 'ESGOTADO'} | ${p.battery} | ★ ${p.rating} |`)].join('\n');
    return out({ table: md, items });
  }
);

server.registerTool(
  'checkout',
  {
    description: 'Finaliza compra no back (valida estoque). Fone-b esgotado deve falhar com OUT_OF_STOCK.',
    inputSchema: { id: z.string(), qty: z.number().int().min(1).default(1) },
  },
  async ({ id, qty }) => {
    const { status, data } = await backPost('/api/checkout', { id, qty });
    return out({ http: status, ...data });
  }
);

server.registerTool(
  'audit_store',
  {
    description: 'Compara o back (verdade) com o publicado: feed.json, llms.txt, robots.txt. Sem baseUrl lê a pasta frontend/ local; com baseUrl busca a loja publicada.',
    inputSchema: { baseUrl: z.string().optional() },
  },
  async ({ baseUrl = '' }) => {
    const truth = await backGet('/api/feed');
    const byId = Object.fromEntries(truth.map((p) => [p.id, p]));
    const errors = [], warnings = [];

    let feed, llms, robots;
    if (baseUrl) {
      const get = async (f) => (await fetch(`${baseUrl.replace(/\/$/, '')}/${f}`).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`${f} HTTP ${r.status})`)))));
      feed = JSON.parse(await get('feed.json'));
      llms = await get('llms.txt');
      robots = await get('robots.txt');
    } else {
      feed = JSON.parse(fs.readFileSync(path.join(FRONT_DIR, 'feed.json'), 'utf8'));
      llms = fs.readFileSync(path.join(FRONT_DIR, 'llms.txt'), 'utf8');
      robots = fs.readFileSync(path.join(FRONT_DIR, 'robots.txt'), 'utf8');
    }

    for (const p of feed) {
      const t = byId[p.id];
      if (!t) { errors.push(`feed tem ${p.id} que não existe no back`); continue; }
      if (Number(t.price) !== Number(p.price)) errors.push(`${p.id}: feed R$${p.price} ≠ back R$${t.price}`);
      if (t.stock !== p.stock) errors.push(`${p.id}: feed estoque ${p.stock} ≠ back ${t.stock}`);
    }
    for (const t of truth) {
      if (!feed.find((p) => p.id === t.id)) errors.push(`back tem ${t.id} fora do feed`);
      if (!llms.includes(t.name)) errors.push(`llms.txt não menciona ${t.name}`);
    }
    if (!llms.includes('/feed.json')) warnings.push('llms.txt sem link para /feed.json');
    if (!robots.includes('Allow: /feed.json')) warnings.push('robots.txt não libera /feed.json');

    const ok = errors.length === 0;
    return out({ jsonld_hint: 'JSON-LD por produto: ver #jsonld-product em produto.html?id= (InStock/OutOfStock conforme estoque)', feed: { ok: !errors.some((e) => e.startsWith('feed') || e.includes('feed ')) }, llms: { ok: !errors.some((e) => e.startsWith('llms')) }, robots: { ok: warnings.length === 0 || !warnings.some((w) => w.startsWith('robots')) }, errors, warnings, verdict: ok ? 'PASS' : 'FAIL' });
  }
);

await server.connect(new StdioServerTransport());
