import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";

// Collection References
const productsCollection = collection(db, "products");
const cartCollection = collection(db, "cart"); // Note: In a real app, cart should be a subcollection of users

// Fetch All Products
export const getProducts = async () => {
    try {
        const data = await getDocs(productsCollection);
        return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

// Add Product (Admin)
export const addProduct = async (product) => {
    try {
        await addDoc(productsCollection, product);
    } catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
};

// Add to Cart
// Note: For simplicity, we are using a global 'cart' collection. 
// Ideally, this should be `users/{userId}/cart`.
export const addToCart = async (userId, product) => {
    if (!userId) return;
    try {
        // Check if item already exists in user's cart
        const q = query(cartCollection, where("userId", "==", userId), where("productId", "==", product.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Update quantity
            const cartItem = querySnapshot.docs[0];
            const currentQty = cartItem.data().quantity || 1;
            await updateDoc(doc(db, "cart", cartItem.id), {
                quantity: currentQty + 1
            });
        } else {
            // Add new item
            await addDoc(cartCollection, {
                userId,
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
};

// Get User Cart
export const getUserCart = async (userId) => {
    if (!userId) return [];
    try {
        const q = query(cartCollection, where("userId", "==", userId));
        const data = await getDocs(q);
        return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
        console.error("Error fetching cart:", error);
        return [];
    }
};
