const PAGE_SIZE = 8;
let currentPage = 1;
let displayedProducts = [];

function showSkeletons() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = Array.from({ length: 6 }, () => `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-badge"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-title-2"></div>
        <div class="skeleton skeleton-stars"></div>
        <div class="skeleton-footer">
          <div class="skeleton skeleton-price"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderFilteredProducts() {
  const filtered = applyFilters();
  displayedProducts = filtered;
  currentPage = 1;
  renderProductPage();
}

function renderProductPage() {
  const grid = document.getElementById('product-grid');
  const emptyState = document.getElementById('empty-state');
  const loadMoreWrap = document.getElementById('load-more-wrap');
  const countEl = document.getElementById('product-count');
  const total = displayedProducts.length;
  const slice = displayedProducts.slice(0, currentPage * PAGE_SIZE);

  if (total === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'flex';
    loadMoreWrap.style.display = 'none';
    countEl.textContent = 'No products found';
    return;
  }

  emptyState.style.display = 'none';
  countEl.textContent = `Showing ${slice.length} of ${total} product${total !== 1 ? 's' : ''}`;
  grid.innerHTML = slice.map((p, i) => `
    <article class="product-card" data-id="${p.id}" style="animation-delay:${Math.min(i * 0.05, 0.4)}s" role="button" tabindex="0">
      <div class="product-img-wrap">
        <button class="compare-check-btn${compareList.some(c => c.id === p.id) ? ' active' : ''}" data-id="${p.id}">
          <i class="fa fa-scale-balanced"></i>
        </button>
        <img class="product-img" src="${p.image}" alt="${escapeHTML(p.title)}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <div class="product-img-placeholder" style="display:none"><i class="fa fa-image"></i></div>
        <button class="wishlist-btn${isInWishlist(p.id) ? ' active' : ''}" data-id="${p.id}">
          <i class="fa fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <span class="category-badge">${escapeHTML(p.category)}</span>
        <h3 class="product-title">${escapeHTML(p.title)}</h3>
        <div class="star-rating">
          <div class="stars">${buildStarsHTML(p.rating.rate)}</div>
          <span class="rating-count">(${p.rating.count})</span>
        </div>
        <div class="product-footer">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <button class="add-to-cart-btn" data-id="${p.id}">
            <i class="fa fa-bag-shopping"></i> Add
          </button>
        </div>
      </div>
    </article>
  `).join('');

  loadMoreWrap.style.display = slice.length < total ? 'block' : 'none';

  // Card click → modal
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.add-to-cart-btn') || e.target.closest('.wishlist-btn') || e.target.closest('.compare-check-btn')) return;
      const product = allProducts.find(p => p.id === Number(card.dataset.id));
      if (product) openProductModal(product);
    });
  });

  // Add to cart
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const product = allProducts.find(p => p.id === Number(btn.dataset.id));
      if (product) addToCart(product, 1);
    });
  });

  // Wishlist
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const product = allProducts.find(p => p.id === Number(btn.dataset.id));
      if (product) toggleWishlist(product);
    });
  });

  // Compare
  document.querySelectorAll('.compare-check-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const product = allProducts.find(p => p.id === Number(btn.dataset.id));
      if (product) toggleCompare(product);
    });
  });
}

function initLoadMore() {
  document.getElementById('load-more-btn').addEventListener('click', () => {
    currentPage++;
    renderProductPage();
  });
}

function showErrorState() {
  document.getElementById('error-state').style.display = 'flex';
  document.getElementById('product-grid').innerHTML = '';
}

function hideErrorState() {
  document.getElementById('error-state').style.display = 'none';
}