
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- import Storage

const firebaseConfig = {
  apiKey: "AIzaSyBWdm9JIIHqWt4rPSGv0u2R9NzkiYBlK7g",
  authDomain: "educ-platform-a09d4.firebaseapp.com",
  projectId: "educ-platform-a09d4",
  storageBucket: "educ-platform-a09d4.firebasestorage.app",
  messagingSenderId: "807454534374",
  appId: "1:807454534374:web:010f8c9b8da9beb120a927"
};

const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app); // <-- export Storage
