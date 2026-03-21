import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// 🔧 Cole aqui as credenciais do seu projeto Firebase
// Firebase Console → Project Settings → Your Apps → SDK setup
const firebaseConfig = {
  apiKey:            "AIzaSyA3u8lWE4ZEPfcIqiLjrZnNNNnXziL0QIk",
  authDomain:        "redesocial-59f1d.firebaseapp.com",
  projectId:         "redesocial-59f1d",
  storageBucket:     "redesocial-59f1d.firebasestorage.app",
  messagingSenderId: "141012129729",
  appId:             "1:141012129729:web:7487f75f9012fd1e258140",
  measurementId: "G-EZSBHL3S41"
}

const app = initializeApp(firebaseConfig)

export const db      = getFirestore(app)
export const auth    = getAuth(app)
export const storage = getStorage(app)