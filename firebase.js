import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyDPOUcd4VVvDDNa6yR3yP-oir-aoRJSnz4",
  authDomain: "dailydoseapp-666c8.firebaseapp.com",
  projectId: "dailydoseapp-666c8",
  storageBucket: "dailydoseapp-666c8.firebasestorage.app",
  messagingSenderId: "585548938236",
  appId: "1:585548938236:web:3415c98886771cac9d9079"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);