import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "loop-d9fc2.firebaseapp.com",
  projectId: "loop-d9fc2",
  storageBucket: "loop-d9fc2.appspot.com",
  messagingSenderId: "948360335850",
  appId: "1:948360335850:web:21ec5216c6631a690da293",
  measurementId: "G-HJJ23HJJ7V",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
