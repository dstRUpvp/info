import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


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

// Функція оновлення статистики
export async function updateStats() {
    console.log("Оновлення статистики...");
    const docRef = doc(db, "players", "somePlayerId"); // Заміни "somePlayerId" на реальний ID
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Дані користувача:", docSnap.data());
    } else {
        console.log("Документ не знайдено!");
    }
}

// Функція оновлення таймера
export function updateTimer() {
    console.log("Оновлення таймера...");
    document.getElementById("updateTimer").innerText = `Останнє оновлення: ${new Date().toLocaleTimeString()}`;
}

// Автоматичне оновлення
setInterval(updateStats, 60000); // Кожну хвилину
setInterval(updateTimer, 60000);

// Початкове оновлення при завантаженні сторінки
updateStats();
updateTimer();
