# Encontrabilidade — mcp (fatec·shop)

MCP stdio da loja modelo **fatec·shop** (disciplina Projetos de Encontrabilidade, Fatec/SI):
5 tools sobre o back para agentes compradores.

- **Front:** [`encontrabilidade-frontend`](https://github.com/renatoviolin/encontrabilidade-frontend) → https://renatoviolin.github.io/encontrabilidade-frontend/
- **Back:** [`encontrabilidade-backend`](https://github.com/renatoviolin/encontrabilidade-backend) → Render

## Tools

| Tool | Lê de onde |
|---|---|
| `search_products` | `GET /api/products` (back) |
| `get_product` | `GET /api/products/:id` (back) |
| `compare_products` | back (tabela markdown) |
| `checkout` | `POST /api/checkout` (back, valida estoque) |
| `audit_store` | back × `feed.json`/`llms.txt`/`robots.txt` publicados |

## Rodar local

```bash
cd mcp && npm install
BACK_URL=http://localhost:3111 npx @modelcontextprotocol/inspector node mcp-server.js
```

Contra o back publicado: `BACK_URL=https://sua-api.onrender.com ...`
