import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCo3Q7aTyEKWlnhv0PREsEtyGUUB67XoJk",
    authDomain: "digital-supermart.firebaseapp.com",
    projectId: "digital-supermart",
    storageBucket: "digital-supermart.firebasestorage.app",
    messagingSenderId: "594619782928",
    appId: "1:594619782928:web:48e6d3d8763f5a6d687795",
    measurementId: "G-E2DXYPJHWC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy };
