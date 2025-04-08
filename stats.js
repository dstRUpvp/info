import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentWorld = 'world2';

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
const UPDATE_INTERVAL = 691200000;

function getStorageKey() {
    return 'playerStats_' + currentWorld;
}

const savedWorld = localStorage.getItem('selectedWorld');
if (savedWorld) {
    currentWorld = savedWorld; 
}

function switchWorld(world) {
    currentWorld = world;
    localStorage.setItem('selectedWorld', world); 
    document.body.className = world + '-style';

    // ОНОВЛЮЄМО заголовок
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.innerText = (world === 'world1') ? 'DST RU PVP' : 'DST RU ENDLESS';
    }

    updateStats();
    updateTimer();
}

document.getElementById('btnWorld1').addEventListener('click', () => switchWorld('world1'));
document.getElementById('btnWorld2').addEventListener('click', () => switchWorld('world2'));

switchWorld(currentWorld);

// *** Основна функція для завантаження статистики ***
// Завантажуємо основні дані
async function fetchPlayerStats() {
    try {
        const docRef = doc(db, 'player_stats', 'current_' + currentWorld);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            throw new Error('No data available in player_stats');
        }
    } catch (error) {
        console.error('Error fetching player_stats:', error);
        const savedData = localStorage.getItem(getStorageKey());
        return savedData ? JSON.parse(savedData).data : {};
    }
}

// *** Функція для завантаження коригувань ***
// Тут ми завантажуємо дані, які ти будеш змінювати вручну,
// наприклад з документа adjustments_current_world1 або adjustments_current_world2
async function fetchAdjustments() {
    try {
        const docRef = doc(db, 'player_stats', 'adjustments_current_' + currentWorld);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Якщо документ коригувань не існує, повертаємо пустий об'єкт
            return {};
        }
    } catch (error) {
        console.error('Error fetching adjustments:', error);
        return {};
    }
}

// *** Функція для об'єднання даних ***
// Завантажуємо основну статистику та коригування, і об'єднуємо їх
async function getPlayerStats() {
    const savedData = localStorage.getItem(getStorageKey());
    if (savedData) {
        const { timestamp, data } = JSON.parse(savedData);
        if (Date.now() - timestamp < UPDATE_INTERVAL) {
            return data;
        }
    }
    const [playersData, adjustmentsData] = await Promise.all([
        fetchPlayerStats(),
        fetchAdjustments()
    ]);

    // Зберігаємо основну статистику у localStorage, як резервну копію
    localStorage.setItem(getStorageKey(), JSON.stringify({ timestamp: Date.now(), data: playersData }));

    // Для кожного гравця (ключ – ім'я гравця) перевіряємо, чи є коригування
    for (const [playerName, stats] of Object.entries(playersData)) {
        // Ми використовуємо нижній регістр для коригувань
        const adj = adjustmentsData[playerName.toLowerCase()];
        if (adj) {
            // Якщо задано прапорець, що гравця приховувати, то видаляємо його з даних
            if (adj.hide === true) {
                delete playersData[playerName];
                continue;
            }
            // Додаємо або віднімаємо значення для kills та deaths, якщо є
            if (adj.kills !== undefined && typeof adj.kills === 'number') {
                stats.kills += adj.kills;
            }
            if (adj.deaths !== undefined && typeof adj.deaths === 'number') {
                stats.deaths += adj.deaths;
            }
            // При бажанні можна додати інші коригування (наприклад, playtime)
        }
    }
    return playersData;
}

function calculateKD(kills, deaths) {
    return (kills / Math.max(deaths, 1)).toFixed(2);
}

// Глобальна змінна для збереження масиву гравців (тільки тих, у кого playtime > 0)
let allPlayers = [];

function updateLeaderboard(playersObj) {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (!leaderboardBody) return;
    leaderboardBody.innerHTML = '';

    const playersArray = Object.entries(playersObj)
        .filter(([_, stats]) => (stats.playtime || 0) > 0)
        .map(([name, stats]) => ({ name, ...stats, kd: calculateKD(stats.kills, stats.deaths) }));
    
    playersArray.sort((a, b) => b.kd - a.kd)
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

function createPlayerCards(playersArray) {
    const playerCards = document.getElementById('playerCards');
    if (!playerCards) return;
    playerCards.innerHTML = '';

    playersArray.forEach(player => {
        const playtime = player.playtime || 0;
        if (playtime === 0) return;  // Пропускаємо записи з playtime 0
        
        const kd = calculateKD(player.kills, player.deaths);
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-stats">
                <div class="stat1">
                  <div class="stat-label">Убийств</div>
                  <div class="stat-value">${player.kills}</div>
                </div>
                <div class="stat11">
                  <div class="stat-label">Смертей</div>
                  <div class="stat-value">${player.deaths}</div>
                </div>
                <div class="kd-ratio1">
                  <div class="stat-label">K/D</div>
                  <div class="kd-value">${kd}</div>
                </div>
                <div class="kd-ratio11">
                  <div class="stat-label">Время игры</div>
                  <div class="kd-value">${playtime.toFixed(2)} дней</div>
                </div>
            </div>
        `;
        playerCards.appendChild(card);
    });
}

function filterPlayers(searchTerm, playersArray) {
    return playersArray.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

async function updateStats() {
    try {
        const playersObj = await getPlayerStats();
        // Перетворюємо об'єкт гравців в масив для рендерингу
        const playersArray = Object.entries(playersObj)
            .filter(([_, stats]) => (stats.playtime || 0) > 0)
            .map(([name, stats]) => ({ name, ...stats }));
        
        allPlayers = playersArray;
        updateLeaderboard(playersObj);
        createPlayerCards(allPlayers);

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.oninput = (e) => {
                const filtered = filterPlayers(e.target.value, allPlayers);
                createPlayerCards(filtered);
            };
        }
    } catch (error) {
        console.error('Помилка при оновленні даних:', error);
    }
}

function updateTimer() {
    const timerElement = document.getElementById("updateTimer");
    if (timerElement) {
        timerElement.innerText = `Последнее обновление: ${new Date().toLocaleTimeString()}`;
    }
}

document.getElementById('btnWorld1').addEventListener('click', () => {
    currentWorld = 'world1';
    document.body.className = 'world1-style'; 
    updateStats();
    updateTimer();
});

document.getElementById('btnWorld2').addEventListener('click', () => {
    currentWorld = 'world2';
    document.body.className = 'world2-style'; 
    updateStats();
    updateTimer();
});

setInterval(updateStats, UPDATE_INTERVAL);
setInterval(updateTimer, UPDATE_INTERVAL);

// Початкове оновлення
updateStats();
updateTimer();

// Фільтрація за кнопками сортування
document.getElementById("sortByDeaths").addEventListener("click", () => {
    const sorted = [...allPlayers].sort((a, b) => b.deaths - a.deaths);
    createPlayerCards(sorted);
});

document.getElementById("sortByKills").addEventListener("click", () => {
    const sorted = [...allPlayers].sort((a, b) => b.kills - a.kills);
    createPlayerCards(sorted);
});

document.getElementById("sortByTime").addEventListener("click", () => {
    const sorted = [...allPlayers].sort((a, b) => b.playtime - a.playtime);
    createPlayerCards(sorted);
});
