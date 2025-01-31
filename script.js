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

const UPDATE_INTERVAL = 60000; // 1 хвилина в мілісекундах

// Функція для отримання даних з Firebase
async function fetchPlayerStats() {
    try {
        const docRef = doc(db, 'player_stats', 'current');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Зберігаємо дані та час останнього оновлення
            const saveData = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem('playerStats', JSON.stringify(saveData));
            return data;
        } else {
            throw new Error('No data available');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        const savedData = localStorage.getItem('playerStats');
        if (savedData) {
            return JSON.parse(savedData).data;
        }
        return {};
    }
}

// Функція для отримання даних з localStorage або API
async function getPlayerStats() {
    const savedData = localStorage.getItem('playerStats');
    if (savedData) {
        const { timestamp, data } = JSON.parse(savedData);
        const timeSinceLastUpdate = Date.now() - timestamp;
        
        // Якщо пройшло менше 1 хвилини, використовуємо збережені дані
        if (timeSinceLastUpdate < UPDATE_INTERVAL) {
            return data;
        }
    }
    // Якщо даних немає або вони застарілі, отримуємо нові
    return await fetchPlayerStats();
}

// ... keep existing code (definitions of the functions updateTimer, calculateKD, updateLeaderboard, createPlayerCards, filterPlayers)

// Основна функція для оновлення даних
async function updateStats() {
    try {
        const players = await getPlayerStats();
        console.log('Отримані дані:', players); // Додаємо для дебагу
        updateLeaderboard(players);
        createPlayerCards(players);

        // Додаємо обробник події для пошуку
        const searchInput = document.getElementById('searchInput');
        if (searchInput && !searchInput.hasListener) {
            searchInput.hasListener = true;
            searchInput.addEventListener('input', (e) => {
                const filtered = filterPlayers(players, e.target.value);
                createPlayerCards(filtered);
            });
        }
    } catch (error) {
        console.error('Помилка при оновленні даних:', error);
    }
}

// Оновлюємо дані кожну хвилину
setInterval(updateStats, UPDATE_INTERVAL);
setInterval(updateTimer, UPDATE_INTERVAL);

// Початкове завантаження даних
updateStats();
updateTimer();

export { updateStats, updateTimer };
