import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYLTqZE8RkZS6L_fHgBPnvTVXGNhzC-Ys",
  authDomain: "playerstats-9d4d5.firebaseapp.com",
  projectId: "playerstats-9d4d5",
  storageBucket: "playerstats-9d4d5.appspot.com",
  messagingSenderId: "109713539003405136344",
  appId: "1:109713539003405136344:web:5f9e8f9f9e8f9f9e8f9f9e"
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const UPDATE_INTERVAL = 60000; // 1 хвилина в мілісекундах

// ... keep existing code (all functions remain the same)

// Оновлюємо дані кожну хвилину
setInterval(updateStats, UPDATE_INTERVAL);
setInterval(updateTimer, UPDATE_INTERVAL);

// Початкове завантаження даних
updateStats();
updateTimer();

