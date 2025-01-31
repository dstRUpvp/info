import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// Конфігурація Firebase (онови, якщо змінив БД)
const firebaseConfig = {
    apiKey: "AIzaSyDYLTqZE8RkZS6L_fHgBPnvTVXGNhzC-Ys",
    authDomain: "playerstats-9d4d5.firebaseapp.com",
    projectId: "playerstats-9d4d5",
    storageBucket: "playerstats-9d4d5.appspot.com",
    messagingSenderId: "109713539003405136344",
    appId: "1:109713539003405136344:web:5f9e8f9f9e8f9f9e8f9f9e"
};

// Ініціалізуємо Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Функція отримання статистики гравця
export async function updateStats() {
    console.log("Запит до БД...");
    try {
        const docRef = doc(db, "players", "somePlayerId"); // 🔹 Замініть "somePlayerId" на реальний ID гравця
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Дані гравця:", docSnap.data());
        } else {
            console.log("Документ не знайдено!");
        }
    } catch (error) {
        console.error("Помилка при отриманні даних:", error);
    }
}

// Функція оновлення таймера
export function updateTimer() {
    console.log("Таймер оновлено");
    document.getElementById("updateTimer").innerText = `Останнє оновлення: ${new Date().toLocaleTimeString()}`;
}

// Викликаємо функції відразу
updateStats();
updateTimer();

// Оновлення кожні 60 секунд
setInterval(updateStats, 60000);
setInterval(updateTimer, 60000);
