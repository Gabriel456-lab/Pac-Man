// Sistema de Controle e Comportamento do Pac-Man
// =================================================================

let lastPlayerDirection = "right";
let isMoving = false; // Trava de debounce mecânico

// =====================================
// PROCESSADOR DE ENTRADA DO TECLADO
// =====================================
function movePlayer(e) {
    // Bloqueia comandos se estiver em transição, pausado ou com a trava ativa
    if (player.respawning || (typeof paused !== "undefined" && paused) || isMoving || !gameStarted) {
        return;
    }

    let nextIndex = player.index;

    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            nextIndex -= width;
            lastPlayerDirection = "up";
            break;
        case "ArrowDown":
        case "s":
        case "S":
            nextIndex += width;
            lastPlayerDirection = "down";
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            nextIndex -= 1;
            lastPlayerDirection = "left";
            break;
        case "ArrowRight":
        case "d":
        case "D":
            nextIndex += 1;
            lastPlayerDirection = "right";
            break;
        default:
            return; // Descarta outras teclas
    }

    e.preventDefault(); // Evita rolagem da página no navegador

    // Executa cálculo de teleporte nas extremidades laterais do mapa
    nextIndex = handleTeleport(nextIndex);

    // Valida se o movimento não colide com paredes
    if (nextIndex >= 0 && nextIndex < currentMap.length && currentMap[nextIndex] !== 1) {
        isMoving = true;
        player.index = nextIndex;

        // Processa coleta de comidas e checa colisões imediatamente
        if (typeof checkInteractions === "function") {
            checkInteractions(player.index);
        }
        if (typeof checkGhostCollisions === "function") {
            checkGhostCollisions();
        }

        // Libera os controles após 120ms (casamento perfeito com o tempo de renderização)
        setTimeout(() => {
            isMoving = false;
        }, 120);
    }

    if (typeof draw === "function") {
        draw();
    }
}

// =====================================
// LÓGICA DE TELEPORTE LATERAL (TÚNEL)
// =====================================
function handleTeleport(index) {
    const currY = Math.floor(player.index / width);
    const nextY = Math.floor(index / width);

    // Se mudou de linha andando para os lados, significa que cruzou a borda do túnel
    if (currY !== nextY && (lastPlayerDirection === "left" || lastPlayerDirection === "right")) {
        if (lastPlayerDirection === "left") {
            return player.index + (width - 1); // Joga pro lado direito
        } else {
            return player.index - (width - 1); // Joga pro lado esquerdo
        }
    }
    return index;
}

// =====================================
// APLICAÇÃO DE ROTACIONAMENTO DO GIF
// =====================================
function updatePlayerDirection() {
    const cell = cells[player.index];
    if (!cell) return;

    // Limpa todas as orientações anteriores para evitar rotações duplicadas
    cell.classList.remove("face-up", "face-down", "face-left", "face-right");

    switch (lastPlayerDirection) {
        case "up":
            cell.classList.add("face-up");
            break;
        case "down":
            cell.classList.add("face-down");
            break;
        case "left":
            cell.classList.add("face-left");
            break;
        case "right":
            cell.classList.add("face-right");
            break;
    }
}

// =====================================
// EFETOR DE IMPACTO (TREMER TELA)
// =====================================
function screenShake() {
    const gameContainer = document.getElementById("game");
    if (!gameContainer) return;

    gameContainer.classList.add("shake");
    setTimeout(() => {
        gameContainer.classList.remove("shake");
    }, 400);
}