const CART_KEY = 'shopvault_cart';
let cartItems = loadCartFromStorage();

function loadCartFromStorage() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCartToStorage() {
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

function addToCart(product, quantity = 1) {
  const existing = cartItems.find(item => item.id === product.id);
  if (existing) { existing.quantity += quantity; }
  else { cartItems.push({ ...product, quantity }); }
  saveCartToStorage();
  renderCart();
  updateCartBadge();
  showCartDrawer();
}

function removeFromCart(productId) {
  cartItems = cartItems.filter(item => item.id !== productId);
  saveCartToStorage();
  renderCart();
  updateCartBadge();
}

function updateCartQuantity(productId, delta) {
  const item = cartItems.find(i => i.id === productId);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCartToStorage();
  renderCart();
  updateCartBadge();
}

function getCartTotal() {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getTotalItemCount() {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

function clearCart() {
  cartItems = [];
  saveCartToStorage();
  renderCart();
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = getTotalItemCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function renderCart() {
  const cartItemsEl = document.getElementById('cart-items');
  const cartFooter = document.getElementById('cart-footer');
  const cartEmpty = document.getElementById('cart-empty');
  const subtotalEl = document.getElementById('cart-subtotal');

  if (cartItems.length === 0) {
    cartItemsEl.innerHTML = '';
    cartFooter.style.display = 'none';
    cartEmpty.style.display = 'flex';
    return;
  }

  cartEmpty.style.display = 'none';
  cartFooter.style.display = 'block';
  subtotalEl.textContent = `$${getCartTotal().toFixed(2)}`;
  cartItemsEl.innerHTML = cartItems.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item-img" src="${item.image}" alt="${escapeHTML(item.title)}"
           onerror="this.src='https://via.placeholder.com/70?text=?'" />
      <div class="cart-item-info">
        <p class="cart-item-title">${escapeHTML(item.title)}</p>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        <div class="cart-item-controls">
          <button class="cart-qty-btn cart-minus" data-id="${item.id}"><i class="fa fa-minus"></i></button>
          <span class="cart-qty-num">${item.quantity}</span>
          <button class="cart-qty-btn cart-plus" data-id="${item.id}"><i class="fa fa-plus"></i></button>
          <button class="cart-remove-btn" data-id="${item.id}"><i class="fa fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.cart-minus').forEach(btn => {
    btn.addEventListener('click', () => updateCartQuantity(Number(btn.dataset.id), -1));
  });
  document.querySelectorAll('.cart-plus').forEach(btn => {
    btn.addEventListener('click', () => updateCartQuantity(Number(btn.dataset.id), 1));
  });
  document.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.id)));
  });
}

function showCartDrawer() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('active');
}

function hideCartDrawer() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('active');
}

function showCheckoutModal() {
  if (cartItems.length === 0) return;
  document.getElementById('checkout-items').innerHTML = cartItems.map(item => `
    <div class="checkout-item">
      <span>${escapeHTML(item.title.substring(0, 40))}${item.title.length > 40 ? '…' : ''}</span>
      <span>×${item.quantity} — $${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');
  document.getElementById('checkout-total-amount').textContent = `$${getCartTotal().toFixed(2)}`;
  document.getElementById('checkout-overlay').style.display = 'flex';
}

function escapeHTML(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}