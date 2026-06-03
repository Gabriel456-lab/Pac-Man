// Gerenciamento de Interface do Usuário (UI), HUD e Telas Sobrepostas (Overlays)
// =================================================================

// =====================================
// REGISTRO E MAPEAMENTO DOS ELEMENTOS DO DOM
// =====================================
const ui = {
    score: document.getElementById("score"),
    level: document.getElementById("level"),
    lives: document.getElementById("lives"),
    overlay: document.getElementById("overlay"),
    overlayText: document.getElementById("overlayText"),
    startButton: document.getElementById("startBtn"),
    pauseButton: document.getElementById("pauseBtn"),
    muteButton: document.getElementById("muteBtn"),
    loading: document.getElementById("loading"),
    notification: document.getElementById("notification"),
    powerBar: document.getElementById("powerBar")
};

// =====================================
// ESTADO INTERNO DA UI
// =====================================
let paused = false;

// =====================================
// MÓDULO CENTRAL DE ATUALIZAÇÃO DA HUD
// =====================================
function updateUI() {
    updateScore();
    updateLives();
    updateLevel();
}

// =====================================
// ATUALIZAÇÃO DO SCORE (PONTUAÇÃO)
// =====================================
function updateScore() {
    if (ui.score) {
        ui.score.innerText = score;
        animateScore();
    }
}

// =====================================
// ATUALIZAÇÃO RECURSIVA DAS VIDAS (CORAÇÕES)
// =====================================
function updateLives() {
    if (!ui.lives) return;
    
    // Limpa os corações anteriores
    ui.lives.innerHTML = "";
    
    // Injeta a quantidade de corações com base nas vidas atuais do player objeto
    for (let i = 0; i < player.lives; i++) {
        const heart = document.createElement("span");
        heart.innerText = "❤️";
        heart.style.marginRight = "2px";
        ui.lives.appendChild(heart);
    }
}

// =====================================
// ATUALIZAÇÃO DO CONTADOR DE FASES
// =====================================
function updateLevel() {
    if (ui.level) {
        // Exibe de forma amigável para o usuário (Fase 1, Fase 2...) somando +1 ao index 0
        ui.level.innerText = currentLevel + 1;
    }
}

// =====================================
// CONTROLES DE FLUXO: FUNÇÃO DE PAUSA
// =====================================
function togglePause() {
    if (!gameStarted || player.respawning) return;

    paused = !paused;

    if (paused) {
        showOverlay("JOGO PAUSADO", "Pressione ESC ou clique no botão para retornar.");
        if (ui.pauseButton) ui.pauseButton.innerText = "▶️";
        if (typeof pauseAllMusic === "function") pauseAllMusic();
    } else {
        hideOverlay();
        if (ui.pauseButton) ui.pauseButton.innerText = "⏸️";
        if (typeof resumeAllMusic === "function") resumeAllMusic();
    }
}

// =====================================
// CONTROLES DE FLUXO: ALTERNAR ÁUDIO (MUTE)
// =====================================
function toggleMute() {
    if (typeof toggleMasterMute === "function") {
        const isMuted = toggleMasterMute();
        if (ui.muteButton) {
            ui.muteButton.innerText = isMuted ? "🔇" : "🔊";
        }
    }
}

// =====================================
// ENGENHARIA DE OVERLAYS (TELAS SOBREPOSTAS)
// =====================================
function showOverlay(title, subtitle = "") {
    if (ui.overlay && ui.overlayText) {
        ui.overlayText.innerHTML = `<h1>${title}</h1><p style="font-size: 16px; margin-top: 10px;">${subtitle}</p>`;
        ui.overlay.style.display = "flex";
    }
}

function hideOverlay() {
    if (ui.overlay) {
        ui.overlay.style.display = "none";
    }
}

// =====================================
// COMPORTAMENTO DO BOTÃO JOGAR (START GAME INITIALIZER)
// =====================================
function startGameUI() {
    hideOverlay();
    if (ui.loading) ui.loading.style.display = "none";
    
    // Invoca o motor de inicialização do game.js
    if (typeof startGame === "function") {
        startGame();
    }
}

// =====================================
// SISTEMA DE NOTIFICAÇÕES (POP-UPS FLUTUANTES)
// =====================================
function showNotification(message, duration = 2000) {
    if (!ui.notification) return;

    ui.notification.innerText = message;
    ui.notification.classList.add("show");

    // Remove a classe de exibição após o estouro do timer
    setTimeout(() => {
        ui.notification.classList.remove("show");
    }, duration);
}

// =====================================
// ANIMAÇÃO DE PULSO NO PLACAR (POP EFFECT)
// =====================================
function animateScore() {
    if (!ui.score) return;
    
    ui.score.classList.add("score-animate");
    setTimeout(() => {
        ui.score.classList.remove("score-animate");
    }, 300);
}

// =====================================
// SISTEMA DE GESTÃO DE RECOMPENSAS / GANHO DE VIDA
// =====================================
function gainLife() {
    if (player.lives >= 5) return; // Limite técnico máximo estipulado de 5 vidas
    
    player.lives++;
    updateLives();
    showNotification("❤️ Vida Extra Adquirida!");
    if (typeof playFruitSound === "function") playFruitSound();
}

// =====================================
// EVENTOS DE ESCUTA DOS BOTÕES (LISTENERS)
// =====================================
ui.startButton?.addEventListener("click", () => {
    startGameUI();
});

ui.pauseButton?.addEventListener("click", () => {
    togglePause();
});

ui.muteButton?.addEventListener("click", () => {
    toggleMute();
});

// Captura do atalho de teclado "Escape" para pausar de forma ágil
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Esc") {
        togglePause();
    }
});