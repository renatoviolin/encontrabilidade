// Carrinho: catálogo e checkout sempre via API do back.
// Carrinho local (ids+qtd) fica no browser; preço/estoque e pedido vêm do back.
import { loadProducts, checkout } from '../api.js';
import { getCart, setQty, saveCart, brl } from '../store.js';

const $ = (s) => document.querySelector(s);
let all = [];
try {
  ({ items: all } = await loadProducts());
} catch (e) {
  $('#itens').textContent = e.message;
}

function render() {
  const cart = getCart();
  const ids = Object.keys(cart);
  if (!ids.length) {
    $('#itens').innerHTML = '<p>Carrinho vazio.</p>';
    $('#total-line').textContent = 'Total: R$ 0,00';
    return;
  }
  let total = 0;
  $('#itens').innerHTML = `<table class="cart"><tr><th>Produto</th><th>Qtd</th><th>Subtotal</th></tr>` +
    ids.map((id) => {
      const p = all.find((x) => x.id === id);
      if (!p) return '';
      total += p.price * cart[id];
      return `<tr><td>${p.name}<div class="muted">${brl(p.price)} un • ${p.stock} em estoque</div></td>
        <td><input data-id="${id}" class="qtd" type="number" value="${cart[id]}" min="0" max="${p.stock}"></td>
        <td>${brl(p.price * cart[id])}</td></tr>`;
    }).join('') + `</table>`;
  $('#total-line').innerHTML = `<b>Total: ${brl(total)}</b>`;
  document.querySelectorAll('.qtd').forEach((el) => {
    el.onchange = () => { setQty(el.dataset.id, parseInt(el.value || '0', 10)); render(); };
  });
}
render();

$('#limpar').onclick = () => { saveCart({}); render(); $('#pedido').textContent = ''; };

$('#finalizar').onclick = async () => {
  const cart = getCart();
  if (!Object.keys(cart).length) { $('#pedido').textContent = 'Carrinho vazio.'; return; }
  $('#pedido').textContent = 'Processando...';
  let out;
  try {
    out = await checkout(cart);
  } catch (e) {
    $('#pedido').textContent = e.message;
    return;
  }
  if (out.error) {
    $('#pedido').textContent = out.error === 'OUT_OF_STOCK'
      ? `Sem estoque: ${out.id} (tem ${out.stock}).`
      : `Falha: ${out.error}`;
    return;
  }
  $('#pedido').innerHTML = `Pedido <b>${out.order_id}</b> confirmado via back. Total ${brl(out.total)}.`;
  saveCart({});
  render();
};
