import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Глобальна змінна для визначення поточного світу
let currentWorld = 'world1';

// Очищення збережених даних (за бажанням)
localStorage.removeItem('playerStats_world1');
localStorage.removeItem('playerStats_world2');

const firebaseConfig = {
    apiKey: "AIzaSyA2AjZvyev7_8rwMcL9Z8fxT6Phf8nH2q8",
    authDomain: "playerstats-9d4d5.firebaseapp.com",
    projectId: "playerstats-9d4d5",
    storageBucket: "playerstats-9d4d5.appspot.com",
    messagingSenderId: "109713539003405136344",
    appId: "1:109713539003405136344:web:5f9e8f9f9e8f9f9e8f9f9e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const UPDATE_INTERVAL = 60000;

// Функція для отримання ключа збереження
function getStorageKey() {
    return 'playerStats_' + currentWorld;
}

// Отримання статистики гравців
async function fetchPlayerStats() {
    try {
        const docRef = doc(db, 'player_stats', 'current_' + currentWorld);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            localStorage.setItem(getStorageKey(), JSON.stringify({ timestamp: Date.now(), data }));
            return data;
        } else {
            throw new Error('No data available');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        const savedData = localStorage.getItem(getStorageKey());
        return savedData ? JSON.parse(savedData).data : {};
    }
}

// Отримання статистики (кеш або оновлення)
async function getPlayerStats() {
    const savedData = localStorage.getItem(getStorageKey());
    if (savedData) {
        const { timestamp, data } = JSON.parse(savedData);
        if (Date.now() - timestamp < UPDATE_INTERVAL) {
            return data;
        }
    }
    return await fetchPlayerStats();
}

// Функція розрахунку K/D
function calculateKD(kills, deaths) {
    return (kills / Math.max(deaths, 1)).toFixed(2);
}

// Оновлення рейтингу (ТОП-5)
function updateLeaderboard(players) {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (!leaderboardBody) return;
    leaderboardBody.innerHTML = '';
    
    Object.entries(players)
        .map(([name, stats]) => ({ name, ...stats, kd: calculateKD(stats.kills, stats.deaths) }))
        .sort((a, b) => b.kd - a.kd)
        .slice(0, 5)
        .forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.kd}</td>
                <td>${player.kills}</td>
                <td>${player.deaths}</td>
            `;
            leaderboardBody.appendChild(row);
        });
}

// Функція створення карток гравців
function createPlayerCards(players) {
    const playerCards = document.getElementById('playerCards');
    if (!playerCards) return;
    playerCards.innerHTML = '';
    
    Object.entries(players).forEach(([name, stats]) => {
        const kd = calculateKD(stats.kills, stats.deaths);
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <div class="player-name">${name}</div>
            <div class="player-stats">
                <div class="stat"><div class="stat-label">Убийств</div><div class="stat-value">${stats.kills}</div></div>
                <div class="stat"><div class="stat-label">Смертей</div><div class="stat-value">${stats.deaths}</div></div>
                <div class="kd-ratio"><div class="stat-label">K/D</div><div class="kd-value">${kd}</div></div>
            </div>
        `;
        playerCards.appendChild(card);
    });
}

// 🔥 **Фіксований пошук для кожного світу**
function filterPlayers(searchTerm, players) {
    return Object.fromEntries(
        Object.entries(players).filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
}

// 🔄 **Головна функція оновлення статистики**
async function updateStats() {
    try {
        const players = await getPlayerStats();
        console.log('Отримані дані:', players);
        updateLeaderboard(players);
        createPlayerCards(players);
        
        // Додаємо подію до пошуку (оновлюється при зміні світу)
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.oninput = (e) => {
                const filteredPlayers = filterPlayers(e.target.value, players);
                createPlayerCards(filteredPlayers);
            };
        }
    } catch (error) {
        console.error('Помилка при оновленні даних:', error);
    }
}

// ⏳ **Оновлення таймера**
function updateTimer() {
    const timerElement = document.getElementById("updateTimer");
    if (timerElement) {
        timerElement.innerText = `Последнее обновление: ${new Date().toLocaleTimeString()}`;
    }
}

// 🌍 **Перемикання світів**
document.getElementById('btnWorld1').addEventListener('click', () => {
    currentWorld = 'world1';
    document.body.className = 'world1-style'; // змінюємо стиль для світу 1
    updateStats();
    updateTimer();
});

document.getElementById('btnWorld2').addEventListener('click', () => {
    currentWorld = 'world2';
    document.body.className = 'world2-style'; // змінюємо стиль для світу 2
    updateStats();
    updateTimer();
});

// 🔄 Оновлення статистики кожні 60 сек
setInterval(updateStats, UPDATE_INTERVAL);
setInterval(updateTimer, UPDATE_INTERVAL);

// ⏳ Початкове завантаження
updateStats();
updateTimer();
