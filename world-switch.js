document.addEventListener("DOMContentLoaded", function () {
    // Отримуємо збережений світ з localStorage, якщо він є, або встановлюємо світ 1 за замовчуванням
    let savedWorld = localStorage.getItem("selectedWorld") || "1"; 
    setWorld(parseInt(savedWorld), false); // Встановлюємо світ, не зберігаючи зміни, оскільки вже зберегли
});

function setWorld(worldNumber, save = true) {
    let titleElement = document.querySelector("title");
    let headerElement = document.querySelector("h1");
    let bodyElement = document.body; // Міняємо клас для стилів

    // Перевіряємо, який світ вибрано, і змінюємо відповідно заголовок та стиль
    if (worldNumber === 1) {
        titleElement.textContent = "DST RU PVP";
        headerElement.textContent = "DST RU PVP";
        bodyElement.className = "world1-style"; // Міняємо клас стилів
    } else if (worldNumber === 2) {
        titleElement.textContent = "DST RU ENDLESS";
        headerElement.textContent = "DST RU ENDLESS";
        bodyElement.className = "world2-style"; // Міняємо клас стилів
    }

    // Якщо потрібно, зберігаємо вибір у localStorage
    if (save) {
        localStorage.setItem("selectedWorld", worldNumber); // Зберігаємо вибір світу
    }
}

// Додаємо події для кнопок
document.getElementById("btnWorld1").addEventListener("click", function () {
    setWorld(1); // Вибір світу 1
});

document.getElementById("btnWorld2").addEventListener("click", function () {
    setWorld(2); // Вибір світу 2
});
