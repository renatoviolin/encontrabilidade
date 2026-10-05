// Peças visuais compartilhadas (sem lógica de dados).
import { brl } from './store.js';

export function iconFor(p) {
  if (p.category === 'caixas') return '🔊';
  return '🎧';
}

export function badgeFor(p) {
  if (p.stock === 0) return '<span class="badge b-out">ESGOTADO</span>';
  if (p.rating >= 4.7) return '<span class="badge b-top">TOP AVALIADO</span>';
  if (p.price < 180) return '<span class="badge b-off">OFERTA</span>';
  return '';
}

export function productCard(p) {
  const out = p.stock === 0;
  return `
    <div class="card ${out ? 'out' : ''}">
      <div class="thumb">${iconFor(p)}</div>
      <div class="card-body">
        <div>${badgeFor(p)}</div>
        <h3><a href="produto.html?id=${p.id}">${p.name}</a></h3>
        <div class="price">R$ ${p.price.toFixed(2)}</div>
        <div class="${p.stock > 0 ? 'stock-ok' : 'stock-out'}">${p.stock > 0 ? p.stock + ' em estoque' : 'ESGOTADO'}</div>
        <div class="muted">${p.short} | ${p.battery} | ★ ${p.rating} (${p.reviews})</div>
        <a class="btn" ${out ? 'aria-disabled="true" style="pointer-events:none;opacity:.5"' : ''} href="produto.html?id=${p.id}">${out ? 'Ver detalhes' : 'Ver e adicionar'}</a>
      </div>
    </div>`;
}

export function productJsonLd(p) {
  const esgotado = p.stock === 0;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    sku: p.id,
    category: p.category,
    offers: {
      '@type': 'Offer',
      price: p.price.toFixed(2),
      priceCurrency: p.currency || 'BRL',
      availability: esgotado ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: String(p.rating), reviewCount: String(p.reviews) },
  };
}

export function initTabs(root = document) {
  root.querySelectorAll('.tabbar button').forEach((b) => {
    b.onclick = () => {
      root.querySelectorAll('.tabbar button').forEach((x) => x.classList.remove('active'));
      root.querySelectorAll('.tabpane').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      root.getElementById('tab-' + b.dataset.tab).classList.add('active');
    };
  });
}

export { brl };
