// Initialize Silk background on product page
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
import { initSilk } from './silk.js';
const silk = initSilk('silk-container', {
    color: savedTheme === 'light' ? '#e2e8f0' : '#1e293b',
    speed: 0.5,
    scale: 2,
    noiseIntensity: 0.5
});
window.silkInstance = silk;

import { addToDbCart, getUserCart } from './db.js';
import { auth } from './firebase-config.js';

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
// If not found, try to read id from URL and fetch from initialProducts (fallback)
if (!product) {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    if (id) {
        // We don't have access to the full product list here, but we can fetch from DB if needed.
        // For now, just set placeholder.
        product = { id, title: 'محصول نامشخص', price: '-', desc: '-', duration: '-' };
    }
}

if (product) {
    document.getElementById('detail-title').textContent = product.title;
    document.getElementById('detail-desc').textContent = product.desc;
    document.getElementById('detail-price').textContent = product.price;
    document.getElementById('detail-duration').textContent = product.duration || 'ماهانه';
}

// Add to cart button handling
const addBtn = document.getElementById('add-to-cart-detail');
if (addBtn && product) {
    addBtn.addEventListener('click', async () => {
        // Reuse the same cart logic from main.js via localStorage
        let cart = JSON.parse(localStorage.getItem('local_cart')) || [];
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('local_cart', JSON.stringify(cart));
        // If user is logged in, also sync to DB
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
