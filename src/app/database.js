import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDGvuOvbHIDR1MaZO_8RDSXvkb7ofgbi4",
  authDomain: "medecine-box.firebaseapp.com",
  databaseURL: "https://medecine-box-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "medecine-box",
  storageBucket: "medecine-box.firebasestorage.app",
  messagingSenderId: "282286067663",
  appId: "1:282286067663:web:4dcebdcbbf3d126c7b8cba",
  measurementId: "G-GXQLVRE8JC"
};

// Cegah inisialisasi ulang
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };