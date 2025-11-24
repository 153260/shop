import { auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// Login with Google
export const loginWithGoogle = async () => {
    try {
        // Try popup first (desktop)
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log("User logged in:", user);
        return user;
    } catch (error) {
        console.error("Login failed (popup):", error);
        // If popup blocked or not supported (common on mobile), fallback to redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported') {
            try {
                await signInWithRedirect(auth, googleProvider);
                // After redirect, onAuthStateChanged will handle the user
                return null;
            } catch (redirError) {
                console.error("Login failed (redirect):", redirError);
                throw redirError;
            }
        }
        throw error;
    }
};

// Logout
export const logout = async () => {
    try {
        await signOut(auth);
        console.log("User logged out");
    } catch (error) {
        console.error("Logout failed:", error);
        throw error;
    }
};

// Monitor Auth State
export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};
