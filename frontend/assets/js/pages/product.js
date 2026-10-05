// Detalhe do produto: buybox + abas + JSON-LD + relacionados.
import { loadProducts, getProduct } from '../api.js';
import { addToCart, cartCount, brl } from '../store.js';
import { productJsonLd, initTabs } from '../ui.js';

const $ = (s) => document.querySelector(s);
$('#cart-count').textContent = cartCount();

const id = new URLSearchParams(location.search).get('id');
let all = [], p;
try {
  ({ items: all } = await loadProducts());
  p = all.find((x) => x.id === id);
  if (!p) ({ item: p } = await getProduct(id));
} catch (e) {
  $('#detalhe').innerHTML = `<p>${e.message}</p>`;
}

if (!p) {
  $('#detalhe').innerHTML = '<p>Produto não encontrado. <a href="index.html">voltar</a></p>';
} else {
  document.title = `${p.name} — Loja Fatec Demo`;
  const esgotado = p.stock === 0;
  const icon = p.category === 'caixas' ? '🔊' : '🎧';
  const old = p.price * 1.2;

  document.getElementById('jsonld-product').textContent = JSON.stringify(productJsonLd(p));
  document.querySelector('meta[property="og:title"]')?.setAttribute(
    'content', `${p.name} — R$ ${p.price.toFixed(2)}${esgotado ? ' (esgotado)' : ' em estoque'}`
  );

  $('#detalhe').innerHTML = `
    <div class="crumbs"><a href="index.html">Início</a> / ${p.category} / ${p.name}</div>
    <div class="detail">
      <div>
        <div class="gallery">${icon}</div>
        <div class="thumbs"><div class="active">${icon}</div><div>📦</div><div>🔋</div></div>
      </div>
      <div class="buy">
        <h2>${p.name}</h2>
        <div class="rating">★ ${p.rating} · ${p.reviews} avaliações · ${p.battery} bateria</div>
        <p class="muted">${p.short}</p>
        <div class="price-old">R$ ${old.toFixed(2)}</div>
        <div class="price">${brl(p.price)}</div>
        <div class="install">em até 10x de ${brl(p.price / 10)} sem juros</div>
        <p class="${esgotado ? 'stock-out' : 'stock-ok'}">${esgotado ? 'ESGOTADO' : `${p.stock} em estoque — envio imediato (mock)`}</p>
        <div class="buybox">
          <div class="row">
            <input id="qtd" type="number" value="1" min="1" max="${Math.max(p.stock, 1)}" ${esgotado ? 'disabled' : ''}>
            <button class="btn" id="add" ${esgotado ? 'disabled' : ''}>${esgotado ? 'Esgotado' : 'Adicionar ao carrinho'}</button>
            <a class="btn btn-ghost" href="carrinho.html">Ver carrinho</a>
          </div>
          <div id="msg"></div>
          <div class="row"><input id="cep" placeholder="calcular frete — CEP" size="20"><button class="btn-ghost btn" id="frete">Calcular</button></div>
          <div id="frete-msg" class="muted"></div>
        </div>
        <div class="secure"><span>🔒 compra mock segura</span><span>↩️ troca em 7 dias (mock)</span><span>📦 nota fiscal mock</span></div>
      </div>
    </div>
    <div class="tabs">
      <div class="tabbar" role="tablist">
        <button class="active" data-tab="desc">Descrição</button>
        <button data-tab="spec">Especificações</button>
        <button data-tab="aval">Avaliações (${p.reviews})</button>
        <button data-tab="entrega">Entrega e trocas</button>
      </div>
      <div class="tabpane active" id="tab-desc"><p>${p.description}</p><p class="muted">Ideal para: ${p.short}</p></div>
      <div class="tabpane" id="tab-spec">
        <table class="specs">
          <tr><th>Categoria</th><td>${p.category}</td></tr>
          <tr><th>Bateria</th><td>${p.battery}</td></tr>
          <tr><th>Avaliação</th><td>★ ${p.rating} (${p.reviews} avaliações)</td></tr>
          <tr><th>Estoque</th><td>${p.stock}</td></tr>
          <tr><th>SKU</th><td>${p.id}</td></tr>
        </table>
      </div>
      <div class="tabpane" id="tab-aval"><p>★ ${p.rating} — baseado em ${p.reviews} avaliações (mock).</p></div>
      <div class="tabpane" id="tab-entrega"><p>Envio mock em 24h. Troca grátis em 7 dias (mock).</p></div>
    </div>`;

  initTabs(document);
  $('#frete')?.addEventListener('click', () => {
    const cep = $('#cep').value.replace(/\D/g, '');
    $('#frete-msg').textContent = cep.length < 8
      ? 'Digite um CEP com 8 dígitos (mock).'
      : 'Frete grátis para este CEP (mock). Chega em 2-4 dias.';
  });
  $('#add')?.addEventListener('click', () => {
    const qtd = Math.max(1, parseInt($('#qtd').value || '1', 10));
    if (qtd > p.stock) { $('#msg').textContent = 'Qtd acima do estoque.'; return; }
    addToCart(p.id, qtd);
    $('#cart-count').textContent = cartCount();
    $('#msg').innerHTML = 'Adicionado! <a href="carrinho.html">ver carrinho</a>';
  });

  const others = all.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);
  if (others.length) {
    $('#rel').innerHTML = '<h3>Quem viu, viu também</h3><div class="grid">' + others.map((o) =>
      `<div class="card"><div class="card-body"><h3><a href="produto.html?id=${o.id}">${o.name}</a></h3><div class="price">R$ ${o.price.toFixed(2)}</div><div class="muted">★ ${o.rating}</div></div></div>`
    ).join('') + '</div>';
  }
}
