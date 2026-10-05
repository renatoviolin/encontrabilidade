// API do back — fonte única de dados (sem fallback local).
// Back: GET /api/products, GET /api/products/:id, POST /api/checkout, GET /api/feed
// Ordem de resolução da base:
//   1. ?api=<url> na querystring (ex. ?api=https://sua-api.onrender.com) — também salva no localStorage
//   2. window.__API_BASE__ (definido em config.js no deploy)
//   3. localStorage 'api_base'
//   4. http://localhost:3111 (desenvolvimento)
const _qs = new URLSearchParams(location.search).get('api');
if (_qs) localStorage.setItem('api_base', _qs.replace(/\/$/, ''));
export const API_BASE = (
  window.__API_BASE__ || localStorage.getItem('api_base') || 'http://localhost:3111'
).replace(/\/$/, '');

async function apiFetch(path, opts) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, opts);
  } catch {
    throw new Error(`back offline em ${API_BASE} — suba com npm start em src/backend/`);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API ${res.status} em ${path}`);
  }
  return res.json();
}

export async function loadProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const items = await apiFetch(`/api/products${qs ? '?' + qs : ''}`);
  return { items, source: 'api' };
}

export async function getProduct(id) {
  const item = await apiFetch(`/api/products/${encodeURIComponent(id)}`);
  return { item, source: 'api' };
}

// items: {id: qty} -> {order_id, total} ou {error}
export async function checkout(items) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  } catch {
    throw new Error(`back offline em ${API_BASE} — suba com npm start em src/backend/`);
  }
  const data = await res.json().catch(() => ({}));
  return { ...data, source: 'api', http: res.status };
}

export async function loadFeed() {
  return apiFetch('/api/feed');
}
