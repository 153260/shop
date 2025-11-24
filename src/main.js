import './style.css';
import { initSilk } from './silk';
// import { loginWithGoogle, logout, subscribeToAuthChanges } from './auth';
// import { getProducts, addProduct as addDbProduct, addToCart as addToDbCart, getUserCart } from './db';

// Placeholder for missing Firebase config (Hybrid Mode)
const loginWithGoogle = null; // Will use mock login
const logout = null;
const subscribeToAuthChanges = null;
const getProducts = null;
const addDbProduct = null;
const addToDbCart = null;
const getUserCart = null;

// --- State Management ---
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('local_cart')) || [];
let products = [];

// --- DOM Elements ---
document.addEventListener('DOMContentLoaded', async () => {
  const app = document.getElementById('app');
  const themeToggle = document.getElementById('theme-toggle');
  const loginBtn = document.getElementById('login-btn');
  const userProfile = document.getElementById('user-profile');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.getElementById('cart-count');
  const cartDrawer = document.getElementById('cart-drawer');
  const closeCartBtn = document.getElementById('close-cart');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const productsGrid = document.getElementById('products-grid');
  const adminDashboardBtn = document.getElementById('admin-dashboard-btn');
  const adminModal = document.getElementById('admin-modal');
  const closeAdminModal = document.getElementById('close-admin-modal');
  const addProductForm = document.getElementById('add-product-form');

  // --- Theme Toggle ---
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Initialize Silk Background
  const silk = initSilk('silk-container', {
    color: savedTheme === 'light' ? '#e2e8f0' : '#1e293b',
    speed: 0.5,
    scale: 2,
    noiseIntensity: 0.5
  });
  window.silkInstance = silk;

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);

      // Update Silk Color
      if (window.silkInstance) {
        window.silkInstance.updateColor(newTheme === 'light' ? '#e2e8f0' : '#1e293b');
      }
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (icon) icon.className = theme === 'dark' ? 'ph-fill ph-moon' : 'ph-fill ph-sun';
  }

  // --- Auth Logic (Hybrid: Firebase + Mock) ---
  // Try to subscribe to Firebase Auth
  if (subscribeToAuthChanges) {
    subscribeToAuthChanges(async (user) => {
      handleUserAuth(user);
    });
  } else {
    // Check for mock user in localStorage
    const mockUser = JSON.parse(localStorage.getItem('mock_user'));
    if (mockUser) handleUserAuth(mockUser);
  }

  async function handleUserAuth(user) {
    currentUser = user;
    if (user) {
      if (loginBtn) loginBtn.classList.add('hidden');
      if (userProfile) userProfile.classList.remove('hidden');
      if (userAvatar) userAvatar.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.displayName || 'User');
      if (userName) userName.textContent = user.displayName || 'کاربر عزیز';

      // Admin Check (Replace with real admin email later)
      // For now, allow anyone to see admin button if they are logged in (for demo) 
      if (user.email && adminDashboardBtn) {
        // adminDashboardBtn.classList.remove('hidden'); // Uncomment to enable for all logged in users
      }

      // Load Cart
      if (getUserCart) {
        try {
          const dbCart = await getUserCart(user.uid);
          if (dbCart) cart = dbCart;
        } catch (e) { console.log('Using local cart'); }
      }
    } else {
      if (loginBtn) loginBtn.classList.remove('hidden');
      if (userProfile) userProfile.classList.add('hidden');
      cart = JSON.parse(localStorage.getItem('local_cart')) || [];
    }
    updateCartUI();
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      if (loginWithGoogle) {
        try {
          await loginWithGoogle();
        } catch (error) {
          console.error("Firebase Login Failed:", error);
          mockLogin();
        }
      } else {
        mockLogin();
      }
    });
  }

  function mockLogin() {
    const mockUser = {
      uid: 'mock_' + Date.now(),
      displayName: 'کاربر تستی',
      email: 'user@example.com',
      photoURL: 'https://ui-avatars.com/api/?name=Test+User&background=random'
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    handleUserAuth(mockUser);
    alert('لاگین آزمایشی انجام شد (Firebase تنظیم نشده است)');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (logout) await logout();
      localStorage.removeItem('mock_user');
      currentUser = null;
      window.location.reload();
    });
  }

  // --- Products Logic ---
  // Initial Mock Products
  const initialProducts = [
    { id: 1, title: 'Spotify Premium', price: '۱۲۰,۰۰۰ تومان', icon: 'ph-spotify-logo', desc: 'اشتراک ۱ ماهه پرمیوم اسپاتیفای', color: '#1db954' },
    { id: 2, title: 'Netflix 4K', price: '۳۵۰,۰۰۰ تومان', icon: 'ph-film-strip', desc: 'اشتراک ۱ ماهه نتفلیکس اولترا', color: '#e50914' },
    { id: 3, title: 'Apple Music', price: '۱۵۰,۰۰۰ تومان', icon: 'ph-music-notes', desc: 'اشتراک ۱ ماهه اپل موزیک', color: '#fa2d48' },
    { id: 4, title: 'YouTube Premium', price: '۹۰,۰۰۰ تومان', icon: 'ph-youtube-logo', desc: 'اشتراک ۱ ماهه یوتیوب بدون تبلیغ', color: '#ff0000' },
    { id: 5, title: 'Telegram Premium', price: '۲۰۰,۰۰۰ تومان', icon: 'ph-telegram-logo', desc: 'اشتراک ۳ ماهه تلگرام پرمیوم', color: '#229ED9' },
    { id: 6, title: 'PlayStation Plus', price: '۴۵۰,۰۰۰ تومان', icon: 'ph-game-controller', desc: 'گیفت کارت ۱۰ دلاری پلی‌استیشن', color: '#00439c' },
    { id: 7, title: 'Xbox Game Pass', price: '۳۸۰,۰۰۰ تومان', icon: 'ph-xbox-logo', desc: 'اشتراک ۱ ماهه گیم پس آلتیمیت', color: '#107C10' },
    { id: 8, title: 'Discord Nitro', price: '۲۵۰,۰۰۰ تومان', icon: 'ph-discord-logo', desc: 'اشتراک ۱ ماهه دیسکورد نیترو', color: '#5865F2' },
    { id: 9, title: 'ChatGPT Plus', price: '۹۵۰,۰۰۰ تومان', icon: 'ph-robot', desc: 'اشتراک ۱ ماهه چت جی‌پی‌تی پلاس', color: '#10a37f' },
    { id: 10, title: 'Steam Wallet', price: '۵۰۰,۰۰۰ تومان', icon: 'ph-game-controller', desc: 'گیفت کارت ۱۰ دلاری استیم', color: '#1b2838' },
  ];

  async function fetchProducts() {
    products = initialProducts;
    if (getProducts) {
      try {
        const dbProducts = await getProducts();
        if (dbProducts && dbProducts.length > 0) {
          products = [...initialProducts, ...dbProducts];
        }
      } catch (e) { console.log('Fetching local products only'); }
    }
    renderProducts();
  }

  function renderProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = products.map(product => `
      <div class="product-card reveal">
        <div class="product-icon" style="color: ${product.color}; box-shadow: 0 10px 30px -10px ${product.color}66;">
          <i class="ph-fill ${product.icon}"></i>
        </div>
        <h3 class="product-title">${product.title}</h3>
        <p class="product-desc">${product.desc}</p>
        <div class="product-footer">
          <span class="product-price">${product.price}</span>
          <button class="btn-primary small" onclick="window.addToCart(${product.id})">
            افزودن به سبد خرید
          </button>
        </div>
      </div>
    `).join('');

    // Re-observe for animations
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // --- Cart Logic ---
  window.addToCart = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    openCart();

    // Persist
    if (currentUser && addToDbCart) {
      try { await addToDbCart(currentUser.uid, cart); } catch (e) { }
    }
    localStorage.setItem('local_cart', JSON.stringify(cart));
  };

  function updateCartUI() {
    if (!cartCount || !cartItemsContainer || !cartTotal) return;

    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.classList.toggle('hidden', cart.length === 0);

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">سبد خرید خالی است</p>';
      cartTotal.textContent = '0 تومان';
      return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="item-info">
          <h4>${item.title}</h4>
          <span class="item-price">${item.price} x ${item.quantity}</span>
        </div>
        <button class="remove-btn" onclick="window.removeFromCart(${item.id})">
          <i class="ph-fill ph-trash"></i>
        </button>
      </div>
    `).join('');

    // Simple total calculation (parsing string price)
    const total = cart.reduce((sum, item) => {
      const price = parseInt(item.price.replace(/[^0-9]/g, ''));
      return sum + (price * item.quantity);
    }, 0);
    cartTotal.textContent = total.toLocaleString() + ' تومان';
  }

  window.removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    localStorage.setItem('local_cart', JSON.stringify(cart));
    if (currentUser && addToDbCart) {
      addToDbCart(currentUser.uid, cart).catch(() => { });
    }
  };

  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // --- Admin Logic ---
  // Enable Admin Button via Console for now: window.enableAdmin()
  window.enableAdmin = () => {
    if (adminDashboardBtn) adminDashboardBtn.classList.remove('hidden');
    alert('پنل ادمین فعال شد');
  };

  if (adminDashboardBtn) {
    adminDashboardBtn.addEventListener('click', () => {
      if (adminModal) adminModal.classList.remove('hidden');
    });
  }

  if (closeAdminModal) {
    closeAdminModal.addEventListener('click', () => {
      if (adminModal) adminModal.classList.add('hidden');
    });
  }

  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newProduct = {
        id: Date.now(),
        title: document.getElementById('p-title').value,
        desc: document.getElementById('p-desc').value,
        price: document.getElementById('p-price').value,
        icon: document.getElementById('p-icon').value,
        color: document.getElementById('p-color').value
      };

      products.push(newProduct);
      renderProducts();

      if (addDbProduct) {
        try { await addDbProduct(newProduct); } catch (e) { }
      }

      if (adminModal) adminModal.classList.add('hidden');
      addProductForm.reset();
      alert('محصول اضافه شد!');
    });
  }

  // --- Support Button ---
  const supportBtn = document.getElementById('support-btn');
  if (supportBtn) {
    supportBtn.addEventListener('click', () => {
      if (typeof Goftino !== 'undefined' && Goftino.open) {
        Goftino.open();
      } else {
        const goftinoBtn = document.querySelector('.goftino-widget-button, #goftino-widget-button');
        if (goftinoBtn) goftinoBtn.click();
        else alert('پشتیبانی در حال بارگذاری...');
      }
    });
  }

  // --- Scroll Animation ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active'); // Hide when scrolling up/out
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Initialize
  fetchProducts();
});
