let allProducts = [];
let activeCategory = 'all';
let currentSort = 'default';
let currentSearch = '';

function createDebounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function buildCategoryButtons(products) {
  const categories = ['all', ...new Set(products.map(p => p.category))];
  const container = document.getElementById('category-buttons');
  container.innerHTML = categories.map(cat => `
    <button class="cat-btn${cat === 'all' ? ' active' : ''}" data-cat="${cat}">
      ${cat === 'all' ? 'All' : capitalizeFirst(cat)}
    </button>
  `).join('');
  container.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      container.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
      renderFilteredProducts();
    });
  });
}

function applyFilters() {
  let results = [...allProducts];
  if (activeCategory !== 'all') {
    results = results.filter(p => p.category === activeCategory);
  }
  if (currentSearch.trim()) {
    const query = currentSearch.toLowerCase().trim();
    results = results.filter(p => p.title.toLowerCase().includes(query));
  }
  results = sortProducts(results, currentSort);
  return results;
}

function sortProducts(products, sortKey) {
  const sorted = [...products];
  const sorters = {
    'price-asc':   (a, b) => a.price - b.price,
    'price-desc':  (a, b) => b.price - a.price,
    'rating-desc': (a, b) => b.rating.rate - a.rating.rate,
    'name-asc':    (a, b) => a.title.localeCompare(b.title),
  };
  return sorters[sortKey] ? sorted.sort(sorters[sortKey]) : sorted;
}

function initFilterListeners() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const sortSelect = document.getElementById('sort-select');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const emptyClearBtn = document.getElementById('empty-clear-btn');

  const debouncedSearch = createDebounce((value) => {
    currentSearch = value;
    searchClear.style.display = value ? 'flex' : 'none';
    renderFilteredProducts();
  }, 300);

  searchInput.addEventListener('input', e => debouncedSearch(e.target.value));
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    currentSearch = '';
    searchClear.style.display = 'none';
    renderFilteredProducts();
  });
  sortSelect.addEventListener('change', e => {
    currentSort = e.target.value;
    renderFilteredProducts();
  });
  clearFiltersBtn.addEventListener('click', resetAllFilters);
  if (emptyClearBtn) emptyClearBtn.addEventListener('click', resetAllFilters);
}

function resetAllFilters() {
  currentSearch = '';
  activeCategory = 'all';
  currentSort = 'default';
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const searchClear = document.getElementById('search-clear');
  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'default';
  if (searchClear) searchClear.style.display = 'none';
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === 'all');
  });
  renderFilteredProducts();
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}