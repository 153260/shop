import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDIxPxOPx65fta0iuFuLtyASVMX8MniN_8",
    authDomain: "frdrick-17f7d.firebaseapp.com",
    projectId: "frdrick-17f7d",
    storageBucket: "frdrick-17f7d.firebasestorage.app",
    messagingSenderId: "910362596354",
    appId: "1:910362596354:web:0b778efa5a71f42cd1031b",
    measurementId: "G-BX68HN01TS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
