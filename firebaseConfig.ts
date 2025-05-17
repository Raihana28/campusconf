import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOr-PvscNW9f0pGnbOdavMwVOQEXzeC0A",
  authDomain: "campusconfessions-94c40.firebaseapp.com",
  projectId: "campusconfessions-94c40",
  storageBucket: "campusconfessions-94c40.firebasestorage.app",
  messagingSenderId: "354033644622",
  appId: "1:354033644622:web:b0635d5de1858036a13f1f",
  measurementId: "G-S78S5W6BEQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);