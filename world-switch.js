document.addEventListener("DOMContentLoaded", function () {
    let savedWorld = localStorage.getItem("selectedWorld") || "1"; // За замовчуванням - світ 1
    setWorld(parseInt(savedWorld), false);
});

function setWorld(worldNumber, save = true) {
    let titleElement = document.querySelector("title");
    let headerElement = document.querySelector("h1");
    let bodyElement = document.body; // Міняємо клас для стилів

    if (worldNumber === 1) {
        titleElement.textContent = "DST RU PVP";
        headerElement.textContent = "DST RU PVP";
        bodyElement.className = "world1-style"; // Міняємо клас стилів
    } else if (worldNumber === 2) {
        titleElement.textContent = "DST RU ENDLESS";
        headerElement.textContent = "DST RU ENDLESS";
        bodyElement.className = "world2-style"; // Міняємо клас стилів
    }

    if (save) {
        localStorage.setItem("selectedWorld", worldNumber);
    }
}

// Додаємо події для кнопок
document.getElementById("btnWorld1").addEventListener("click", function () {
    setWorld(1);
});

document.getElementById("btnWorld2").addEventListener("click", function () {
    setWorld(2);
});
