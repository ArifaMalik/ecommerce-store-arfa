const THEME_KEY = 'shopvault_theme';

function initDarkMode() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') document.body.classList.add('dark');
  updateThemeIcon();
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  const icon = document.querySelector('#theme-toggle i');
  icon.className = document.body.classList.contains('dark') ? 'fa fa-sun' : 'fa fa-moon';
}

function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
    hamburger.querySelector('i').className = nav.classList.contains('open') ? 'fa fa-times' : 'fa fa-bars';
  });
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.querySelector('i').className = 'fa fa-bars';
    });
  });
}

let modalQty = 1;

function openProductModal(product) {
  modalQty = 1;
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-img-col">
      <img src="${product.image}" alt="${escapeHTML(product.title)}"
           onerror="this.src='https://via.placeholder.com/280?text=No+Image'" />
    </div>
    <div class="modal-info-col">
      <span class="category-badge">${escapeHTML(product.category)}</span>
      <h2 class="modal-title">${escapeHTML(product.title)}</h2>
      <p class="modal-description">${escapeHTML(product.description)}</p>
      <div class="modal-rating">
        <div class="stars">${buildStarsHTML(product.rating.rate)}</div>
        <span class="modal-rating-text">${product.rating.rate} stars · ${product.rating.count} reviews</span>
      </div>
      <p class="modal-price">$${product.price.toFixed(2)}</p>
      <div class="qty-control">
        <button class="qty-btn" id="modal-qty-minus"><i class="fa fa-minus"></i></button>
        <span class="qty-num" id="modal-qty-num">1</span>
        <button class="qty-btn" id="modal-qty-plus"><i class="fa fa-plus"></i></button>
      </div>
      <button class="modal-add-btn" id="modal-add-to-cart">
        <i class="fa fa-bag-shopping"></i> Add to Cart
      </button>
    </div>
  `;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  document.getElementById('modal-qty-minus').addEventListener('click', () => {
    if (modalQty > 1) { modalQty--; document.getElementById('modal-qty-num').textContent = modalQty; }
  });
  document.getElementById('modal-qty-plus').addEventListener('click', () => {
    modalQty++; document.getElementById('modal-qty-num').textContent = modalQty;
  });
  document.getElementById('modal-add-to-cart').addEventListener('click', () => {
    addToCart(product, modalQty);
    closeProductModal();
  });
}

function closeProductModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

function initModalListeners() {
  document.getElementById('modal-close').addEventListener('click', closeProductModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeProductModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeProductModal();
      document.getElementById('checkout-overlay').style.display = 'none';
      document.getElementById('compare-overlay').style.display = 'none';
    }
  });
}

function initCartDrawerListeners() {
  document.getElementById('cart-btn').addEventListener('click', showCartDrawer);
  document.getElementById('drawer-close').addEventListener('click', hideCartDrawer);
  document.getElementById('drawer-overlay').addEventListener('click', hideCartDrawer);
  document.getElementById('continue-shopping-btn').addEventListener('click', hideCartDrawer);
  document.getElementById('checkout-btn').addEventListener('click', () => {
    showCheckoutModal();
    hideCartDrawer();
  });
}

function initCheckoutListeners() {
  document.getElementById('checkout-close').addEventListener('click', () => {
    document.getElementById('checkout-overlay').style.display = 'none';
  });
  document.getElementById('checkout-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('checkout-overlay').style.display = 'none';
  });
  document.getElementById('checkout-done-btn').addEventListener('click', () => {
    clearCart();
    document.getElementById('checkout-overlay').style.display = 'none';
  });
}

// WISHLIST
const WISHLIST_KEY = 'shopvault_wishlist';
let wishlistItems = loadWishlistFromStorage();

function loadWishlistFromStorage() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
  catch { return []; }
}

function saveWishlistToStorage() {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistItems));
}

function toggleWishlist(product) {
  const idx = wishlistItems.findIndex(p => p.id === product.id);
  if (idx > -1) { wishlistItems.splice(idx, 1); }
  else { wishlistItems.push(product); }
  saveWishlistToStorage();
  renderWishlist();
  updateWishlistBadge();
  document.querySelectorAll(`.wishlist-btn[data-id="${product.id}"]`).forEach(btn => {
    btn.classList.toggle('active', isInWishlist(product.id));
  });
}

function isInWishlist(productId) {
  return wishlistItems.some(p => p.id === productId);
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-nav-badge');
  badge.textContent = wishlistItems.length;
  badge.style.display = wishlistItems.length > 0 ? 'flex' : 'none';
}

function renderWishlist() {
  const container = document.getElementById('wishlist-items');
  const empty = document.getElementById('wishlist-empty');
  if (wishlistItems.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';
  container.innerHTML = wishlistItems.map(item => `
    <div class="wishlist-item">
      <img class="wishlist-item-img" src="${item.image}" alt="${escapeHTML(item.title)}" />
      <div class="wishlist-item-info">
        <p class="wishlist-item-title">${escapeHTML(item.title)}</p>
        <p class="wishlist-item-price">$${item.price.toFixed(2)}</p>
      </div>
      <div class="wishlist-item-actions">
        <button class="wishlist-cart-btn" data-id="${item.id}"><i class="fa fa-bag-shopping"></i></button>
        <button class="wishlist-remove-btn" data-id="${item.id}"><i class="fa fa-times"></i></button>
      </div>
    </div>
  `).join('');
  container.querySelectorAll('.wishlist-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = wishlistItems.find(p => p.id === Number(btn.dataset.id));
      if (product) addToCart(product, 1);
    });
  });
  container.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = wishlistItems.find(p => p.id === Number(btn.dataset.id));
      if (product) toggleWishlist(product);
    });
  });
}

function initWishlistListeners() {
  document.getElementById('wishlist-nav-btn').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('wishlist-drawer').classList.add('open');
    document.getElementById('wishlist-overlay').classList.add('active');
  });
  document.getElementById('wishlist-close').addEventListener('click', () => {
    document.getElementById('wishlist-drawer').classList.remove('open');
    document.getElementById('wishlist-overlay').classList.remove('active');
  });
  document.getElementById('wishlist-overlay').addEventListener('click', () => {
    document.getElementById('wishlist-drawer').classList.remove('open');
    document.getElementById('wishlist-overlay').classList.remove('active');
  });
}

// COMPARE
const MAX_COMPARE = 3;
let compareList = [];

function toggleCompare(product) {
  const idx = compareList.findIndex(p => p.id === product.id);
  if (idx > -1) { compareList.splice(idx, 1); }
  else { if (compareList.length >= MAX_COMPARE) return; compareList.push(product); }
  updateCompareBar();
  document.querySelectorAll(`.compare-check-btn[data-id="${product.id}"]`).forEach(btn => {
    btn.classList.toggle('active', compareList.some(p => p.id === product.id));
  });
}

function updateCompareBar() {
  const bar = document.getElementById('compare-bar');
  const label = document.getElementById('compare-bar-label');
  const productsEl = document.getElementById('compare-bar-products');
  const goBtn = document.getElementById('compare-go-btn');
  if (compareList.length === 0) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  label.textContent = `${compareList.length} of ${MAX_COMPARE} selected`;
  productsEl.innerHTML = compareList.map(p => `
    <img class="compare-mini-img" src="${p.image}" alt="${escapeHTML(p.title)}" />
  `).join('');
  goBtn.disabled = compareList.length < 2;
}

function initCompareListeners() {
  document.getElementById('compare-go-btn').addEventListener('click', () => {
    document.getElementById('compare-grid').innerHTML = compareList.map(p => `
      <div class="compare-card">
        <img src="${p.image}" alt="${escapeHTML(p.title)}" />
        <span class="category-badge">${escapeHTML(p.category)}</span>
        <p class="compare-card-title">${escapeHTML(p.title)}</p>
        <p class="compare-card-price">$${p.price.toFixed(2)}</p>
        <p class="compare-card-desc">${escapeHTML(p.description.substring(0, 120))}…</p>
      </div>
    `).join('');
    document.getElementById('compare-overlay').style.display = 'flex';
  });
  document.getElementById('compare-close').addEventListener('click', () => {
    document.getElementById('compare-overlay').style.display = 'none';
  });
  document.getElementById('compare-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('compare-overlay').style.display = 'none';
  });
  document.getElementById('compare-clear-btn').addEventListener('click', () => {
    compareList = [];
    updateCompareBar();
    document.querySelectorAll('.compare-check-btn').forEach(btn => btn.classList.remove('active'));
  });
}

function buildStarsHTML(rating) {
  return [1,2,3,4,5].map(i => {
    if (rating >= i) return `<i class="fa fa-star"></i>`;
    if (rating >= i - 0.5) return `<i class="fa fa-star-half-stroke"></i>`;
    return `<i class="fa fa-star empty"></i>`;
  }).join('');
}

function escapeHTML(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}