import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


let currentWorld = 'world1';


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
    updateStats();
    updateTimer();
}


document.getElementById('btnWorld1').addEventListener('click', () => switchWorld('world1'));
document.getElementById('btnWorld2').addEventListener('click', () => switchWorld('world2'));


switchWorld(currentWorld);



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


function calculateKD(kills, deaths) {
    return (kills / Math.max(deaths, 1)).toFixed(2);
}


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
            row.innerHTML = 
                <td>${player.name}</td>
                <td>${player.kd}</td>
                <td>${player.kills}</td>
                <td>${player.deaths}</td>
            ;
            leaderboardBody.appendChild(row);
        });
}


function createPlayerCards(players) {
    const playerCards = document.getElementById('playerCards');
    if (!playerCards) return;
    playerCards.innerHTML = '';
    
    // Перелік основних монстрів з DST (у нижньому регістрі)
    const monsterNames = [
      "spider", "spiderling", "spider queen", 
      "deerclops", "bearger", "dragonfly", 
      "tentacle", "treeguard", "hound", 
      "moose", "goose", "merm", "killer bee", 
      "bat", "terrorbeak", "shadow creature"
    ];
    
    Object.entries(players).forEach(([name, stats]) => {
        // Якщо ім'я (в нижньому регістрі) міститься у списку монстрів, пропускаємо створення картки
        if (monsterNames.includes(name.toLowerCase())) {
            return;
        }
        
        const kd = calculateKD(stats.kills, stats.deaths);
        const playtime = (stats.playtime || 0).toFixed(2);  // час гри у годинах
        
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = 
            <div class="player-name">${name}</div>
            <div class="player-stats">
                <div class="stat1"><div class="stat-label">Убийств</div><div class="stat-value">${stats.kills}</div></div>
                <div class="stat11"><div class="stat-label">Смертей</div><div class="stat-value">${stats.deaths}</div></div>
                <div class="kd-ratio1"><div class="stat-label">K/D</div><div class="kd-value">${kd}</div></div>
                <div class="kd-ratio11"><div class="stat-label">Время игры</div><div class="kd-value">${playtime} час</div></div>
            </div>
        ;
        playerCards.appendChild(card);
    });
}


function filterPlayers(searchTerm, players) {
    return Object.fromEntries(
        Object.entries(players).filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
}


async function updateStats() {
    try {
        const players = await getPlayerStats();
        updateLeaderboard(players);
        createPlayerCards(players);
        

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


function updateTimer() {
    const timerElement = document.getElementById("updateTimer");
    if (timerElement) {
        timerElement.innerText = Последнее обновление: ${new Date().toLocaleTimeString()};
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

// Початкове завантаження
updateStats();
updateTimer();
