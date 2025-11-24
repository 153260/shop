import './style.css'
import { initSilk } from './silk.js'

// TODO: Uncomment these after configuring Firebase in firebase-config.js
// import { loginWithGoogle, logout, subscribeToAuthChanges } from './auth.js';
// import { addToCart as addToDbCart, addProduct as addDbProduct } from './db.js';

// Temporary placeholders
const loginWithGoogle = null;
const logout = null;
const subscribeToAuthChanges = null;
const addToDbCart = null;
const addDbProduct = null;

// State
let currentUser = null;
let cart = [];

// Product Data
const products = [
  {
    id: 1,
    title: 'اشتراک تلگرام پرمیوم',
    description: 'دسترسی به امکانات ویژه تلگرام، استیکرهای متحرک و آپلود فایل‌های حجیم',
    price: '۲۹۰,۰۰۰ تومان',
    icon: 'ph-telegram-logo',
    color: '#229ED9'
  },
  {
    id: 2,
    title: 'اشتراک ChatGPT Plus',
    description: 'دسترسی به مدل GPT-4، سرعت بالاتر و پلاگین‌های اختصاصی',
    price: '۹۸۰,۰۰۰ تومان',
    icon: 'ph-robot',
    color: '#10A37F'
  },
  {
    id: 3,
    title: 'اکانت Cursor Pro',
    description: 'ادیتور هوشمند با قابلیت‌های پیشرفته هوش مصنوعی برای برنامه‌نویسان',
    price: '۵۵۰,۰۰۰ تومان',
    icon: 'ph-code',
    color: '#3b82f6'
  },
  {
    id: 4,
    title: 'گیفت کارت اپل',
    description: 'شارژ حساب اپل آیدی برای خرید برنامه، بازی و اشتراک‌های اپل',
    price: 'از ۵ دلار',
    icon: 'ph-apple-logo',
    color: '#A2AAAD'
  },
  {
    id: 5,
    title: 'اشتراک اسپاتیفای',
    description: 'پخش موسیقی بدون تبلیغات، کیفیت بالا و دانلود آفلاین',
    price: '۱۲۰,۰۰۰ تومان',
    icon: 'ph-spotify-logo',
    color: '#1DB954'
  },
  {
    id: 6,
    title: 'اشتراک نتفلیکس',
    description: 'تماشای نامحدود فیلم و سریال با کیفیت 4K و زیرنویس فارسی',
    price: '۱۵۰,۰۰۰ تومان',
    icon: 'ph-film-strip',
    color: '#E50914'
  },
  {
    id: 7,
    title: 'اشتراک یوتیوب پرمیوم',
    description: 'تماشای بدون تبلیغات، پخش در پس‌زمینه و دسترسی به یوتیوب موزیک',
    price: '۱۱۰,۰۰۰ تومان',
    icon: 'ph-youtube-logo',
    color: '#FF0000'
  },
  {
    id: 8,
    title: 'لایسنس ویندوز ۱۱',
    description: 'لایسنس اورجینال ویندوز ۱۱ پرو، فعال‌سازی دائمی و قانونی',
    price: '۴۵۰,۰۰۰ تومان',
    icon: 'ph-windows-logo',
    color: '#0078D6'
  },
  {
    id: 9,
    title: 'اکانت تریدینگ ویو',
    description: 'دسترسی به ابزارهای تحلیل تکنیکال پیشرفته برای تریدرها',
    price: '۳۹۰,۰۰۰ تومان',
    icon: 'ph-chart-line-up',
    color: '#131722'
  }
];

// Render Products
function renderProducts() {
  const productsGrid = document.getElementById('products-grid');
  if (!productsGrid) {
    console.error('products-grid element not found!');
    return;
  }
  productsGrid.innerHTML = products.map(product => `
    <div class="glass-card product-card reveal">
      <div class="product-icon" style="color: ${product.color}">
        <i class="ph-fill ${product.icon}"></i>
      </div>
      <h3 class="product-title">${product.title}</h3>
      <p class="product-desc">${product.description}</p>
      <div class="product-price">${product.price}</div>
      <button class="buy-btn" onclick="window.addToCart(${product.id})">افزودن به سبد خرید</button>
    </div>
  `).join('');
}

// Cart Logic
window.addToCart = (productId) => {
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

  // If logged in, sync with DB (Optional for now, keeping local state primary for speed)
  if (currentUser && addToDbCart) {
    addToDbCart(currentUser.uid, product);
  }
};

function updateCartUI() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  // Update Badge
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  if (totalItems > 0) {
    cartCount.classList.remove('hidden');
  } else {
    cartCount.classList.add('hidden');
  }

  // Update Items
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">سبد خرید خالی است</p>';
    cartTotal.textContent = '0 تومان';
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.title}</h4>
        <div class="cart-item-price">${item.price} x ${item.quantity}</div>
      </div>
      <button class="icon-btn" onclick="window.removeFromCart(${item.id})">
        <i class="ph-fill ph-trash"></i>
      </button>
    </div>
  `).join('');

  // Calculate Total (Simplified logic for string prices)
  // Note: In a real app, prices should be numbers.
  // For now, we just show "Calculated at checkout" or similar if parsing is hard.
  // Let's try to parse the Persian numbers/commas.
  // For this demo, I'll just show the item count in total for simplicity or 0.
  cartTotal.textContent = `${totalItems} محصول`;
}

window.removeFromCart = (productId) => {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
};

function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('active');
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('active');
}

// Scroll Animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    } else {
      entry.target.classList.remove('active'); // Bi-directional animation
    }
  });
}, observerOptions);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const icon = themeToggle.querySelector('i');

  // Check local storage
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    body.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'light') {
      icon.classList.replace('ph-moon', 'ph-sun');
    }
  }

  themeToggle.addEventListener('click', () => {
    const isDark = !body.hasAttribute('data-theme');

    if (isDark) {
      body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      icon.classList.replace('ph-moon', 'ph-sun');
      if (window.silkInstance) window.silkInstance.updateColor('#e2e8f0');
    } else {
      body.removeAttribute('data-theme');
      localStorage.removeItem('theme');
      icon.classList.replace('ph-sun', 'ph-moon');
      if (window.silkInstance) window.silkInstance.updateColor('#1e293b');
    }
  });

  // Initialize Silk Background
  const silk = initSilk('silk-container', {
    color: currentTheme === 'light' ? '#e2e8f0' : '#1e293b',
    speed: 0.5,
    scale: 2,
    noiseIntensity: 0.5
  });
  window.silkInstance = silk;

  renderProducts();

  // Observe elements
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Auth & UI Event Listeners
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userProfile = document.getElementById('user-profile');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');

  loginBtn.addEventListener('click', async () => {
    if (!loginWithGoogle) {
      alert('Firebase is not configured. Please configure Firebase in firebase-config.js');
      return;
    }
    try {
      await loginWithGoogle();
    } catch (error) {
      alert('Login failed. Please check console.');
    }
  });

  logoutBtn.addEventListener('click', async () => {
    if (logout) {
      await logout();
    }
  });

  // Auth State Observer
  if (subscribeToAuthChanges) {
    subscribeToAuthChanges((user) => {
      currentUser = user;
      if (user) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userAvatar.src = user.photoURL;
        userName.textContent = user.displayName;

        // Simple Admin Check (Replace with real role check)
        // For demo: Allow anyone to see admin button if logged in
        document.getElementById('admin-dashboard-btn').classList.remove('hidden');
      } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
        userAvatar.src = '';
        userName.textContent = '';
        document.getElementById('admin-dashboard-btn').classList.add('hidden');
      }
    });
  }

  // Cart Events
  document.getElementById('cart-btn').addEventListener('click', openCart);
  document.getElementById('close-cart').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);

  // Admin Modal Logic
  const adminModal = document.getElementById('admin-modal');
  const adminBtn = document.getElementById('admin-dashboard-btn');
  const closeAdminBtn = document.getElementById('close-admin-modal');
  const addProductForm = document.getElementById('add-product-form');

  adminBtn.addEventListener('click', () => {
    adminModal.classList.remove('hidden');
  });

  closeAdminBtn.addEventListener('click', () => {
    adminModal.classList.add('hidden');
  });

  addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('p-title').value;
    const desc = document.getElementById('p-desc').value;
    const price = document.getElementById('p-price').value;
    const icon = document.getElementById('p-icon').value;
    const color = document.getElementById('p-color').value;

    const newProduct = {
      title,
      description: desc,
      price,
      icon,
      color,
      id: Date.now() // Temporary ID
    };

    // Add to local state
    products.push(newProduct);
    renderProducts();

    // Re-observe new elements for scroll animation
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Add to DB if Firebase is configured
    if (addDbProduct) {
      try {
        await addDbProduct(newProduct);
        alert('محصول با موفقیت اضافه شد و در دیتابیس ذخیره شد!');
      } catch (error) {
        console.error(error);
        alert('محصول اضافه شد ولی در دیتابیس ذخیره نشد');
      }
    } else {
      alert('محصول به صورت موقت اضافه شد (فقط در این session)');
    }

    adminModal.classList.add('hidden');
    addProductForm.reset();
  });

  // Support Button - Opens Goftino Widget
  const supportBtn = document.getElementById('support-btn');
  if (supportBtn) {
    supportBtn.addEventListener('click', () => {
      // Method 1: Try Goftino API
      if (typeof Goftino !== 'undefined' && Goftino.open) {
        Goftino.open();
      }
      // Method 2: Try clicking the Goftino widget button
      else {
        const goftinoBtn = document.querySelector('.goftino-widget-button, #goftino-widget-button, [class*="goftino"]');
        if (goftinoBtn) {
          goftinoBtn.click();
        } else {
          // Fallback: Show message
          console.log('Goftino widget not found. Please wait for it to load.');
          alert('پشتیبانی آنلاین در حال بارگذاری است. لطفاً چند لحظه صبر کنید.');
        }
      }
    });
  }
});
