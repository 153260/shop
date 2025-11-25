// src/product.js
import { initSilk } from './silk.js';
import { addToDbCart } from './db.js';
import { auth } from './firebase-config.js';

// Initialize Silk background on product page
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
const silk = initSilk('silk-container', {
    color: savedTheme === 'light' ? '#e2e8f0' : '#1e293b',
    speed: 0.5,
    scale: 2,
    noiseIntensity: 0.5,
});
window.silkInstance = silk;

// Get selected product from localStorage (fallback to URL param if needed)
let product = null;
const stored = localStorage.getItem('selectedProduct');
if (stored) {
    try {
        product = JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse selectedProduct', e);
    }
}
// If not found, try to read id from URL and fetch placeholder
if (!product) {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    if (id) {
        product = { id, title: 'محصول نامشخص', price: '-', desc: '-', duration: '-' };
    }
}

if (product) {
    const titleEl = document.getElementById('detail-title');
    const descEl = document.getElementById('detail-desc');
    const priceEl = document.getElementById('detail-price');
    const durationEl = document.getElementById('detail-duration');
    if (titleEl) titleEl.textContent = product.title;
    if (descEl) descEl.textContent = product.desc;
    if (priceEl) priceEl.textContent = product.price;
    if (durationEl) durationEl.textContent = product.duration || 'ماهانه';
}

// Add to cart button handling
const addBtn = document.getElementById('add-to-cart-detail');
if (addBtn && product) {
    addBtn.addEventListener('click', async () => {
        let cart = JSON.parse(localStorage.getItem('local_cart')) || [];
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('local_cart', JSON.stringify(cart));
        if (auth.currentUser) {
            try {
                await addToDbCart(auth.currentUser.uid, cart);
            } catch (e) {
                console.error('Failed to sync cart', e);
            }
        }
        alert('محصول به سبد خرید اضافه شد!');
    });
}
