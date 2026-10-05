// Catálogo: busca + filtro + ordenação. Dados sempre via API do back.
import { loadProducts } from '../api.js';
import { cartCount } from '../store.js';
import { productCard } from '../ui.js';

const $ = (s) => document.querySelector(s);
$('#cart-count').textContent = cartCount();

const state = { items: [], source: '?' };
try {
  const { items, source } = await loadProducts();
  state.items = items;
  state.source = source;
} catch (e) {
  $('#lista').textContent = e.message;
}

const q = $('#q'), cat = $('#cat'), sort = $('#sort');

export function render() {
  const termo = q.value.toLowerCase();
  let items = state.items.filter((p) =>
    (!cat.value || p.category === cat.value) &&
    (!termo || (p.name + ' ' + p.short + ' ' + p.battery + ' ' + p.category).toLowerCase().includes(termo))
  );
  if (sort.value === 'menor') items = [...items].sort((a, b) => a.price - b.price);
  if (sort.value === 'maior') items = [...items].sort((a, b) => b.price - a.price);
  if (sort.value === 'avaliacao') items = [...items].sort((a, b) => b.rating - a.rating);
  $('#lista').innerHTML = items.map(productCard).join('') || '<p>Nada encontrado.</p>';
  const note = $('#src-note');
  if (note) note.textContent = `fonte: ${state.source} • ${state.items.length} produtos`;
}

q.oninput = render;
cat.onchange = render;
sort.onchange = render;
render();
