import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Firebase Config
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_firebaseapi,
  authDomain: process.env.NEXT_PUBLIC_firebaseauthdomain,
  projectId: process.env.NEXT_PUBLIC_firebaseprojectid,
  storageBucket: process.env.NEXT_PUBLIC_firebasestorage,
  messagingSenderId: process.env.NEXT_PUBLIC_firebasesenderid,
  appId: process.env.NEXT_PUBLIC_firebaseappId,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

export const initializeFirebase = () => {
  return app;
};
