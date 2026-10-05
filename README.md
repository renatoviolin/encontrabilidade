# Encontrabilidade — fatec·shop

Mini e-commerce modelo da disciplina **Projetos de Encontrabilidade** (Fatec/SI):
catálogo citável por IA + API de comércio + MCP para agentes compradores.

- **Loja no ar:** https://renatoviolin.github.io/encontrabilidade/
- **Back (Render):** configure a URL em `frontend/assets/js/config.js` (ver § Deploy)

## Subprojetos

| Pasta | O quê | Deploy |
|---|---|---|
| `frontend/` | Loja estática (catálogo, produto, carrinho, JSON-LD, `llms.txt`, `feed.json`) | GitHub Pages (automático via Actions) |
| `mcp/` | MCP stdio — 5 tools sobre o back (`search_products`, `checkout`, `audit_store`…) | Local (cada máquina) |

> **Back em repo separado:** [`renatoviolin/encontrabilidade-backend`](https://github.com/renatoviolin/encontrabilidade-backend) → Render Web Service free.

## Desenvolvimento local

```bash
# back (:3111) — repo encontrabilidade-backend
cd ../encontrabilidade-backend && npm install && npm start

# front (outro terminal)
cd frontend && python3 -m http.server 8140
# abrir http://localhost:8140
```

## Deploy

**Front (automático):** push na `main` → Actions publica `frontend/` no Pages.

**Back (Render, 1ª vez):** repo [`encontrabilidade-backend`](https://github.com/renatoviolin/encontrabilidade-backend) →
Render Dashboard → New → Blueprint → `render.yaml` na raiz (free, sem cartão;
dorme após 15 min idle — aqueça com `GET /health` antes da demo).

**Ligar front → back:** defina a variável de repo `API_URL` (Settings → Variables →
Actions) com a URL do Render, ou edite `frontend/assets/js/config.js`, ou abra a
loja com `?api=https://sua-api.onrender.com` (salva no navegador).

**MCP local contra o back publicado:**
```bash
cd mcp && npm install
BACK_URL=https://sua-api.onrender.com npx @modelcontextprotocol/inspector node mcp-server.js
```
