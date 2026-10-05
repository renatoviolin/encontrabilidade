// Carrinho em localStorage + formatação. Dados vêm de api.js (back via API).

const CART_KEY = 'loja_fatec_cart_v1';

export function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(id, qty = 1) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  saveCart(cart);
  return cart;
}

export function setQty(id, qty) {
  const cart = getCart();
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveCart(cart);
  return cart;
}

export function cartCount() {
  return Object.values(getCart()).reduce((a, b) => a + b, 0);
}

export function brl(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
