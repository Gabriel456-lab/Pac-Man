// Sistema de IA e Movimentação dos Fantasmas
// =================================================================

// =====================================
// CRIAR FANTASMAS NO TABULEIRO
// =====================================
function createGhosts(ghostList) {
    ghosts = []; // Limpa o array global anterior

    ghostList.forEach(data => {
        const ghost = {
            index: data.startIndex,
            startIndex: data.startIndex,
            speed: data.speed,
            className: data.className,
            mode: data.mode,
            scared: false,
            interval: null,
            lastDirection: null,
            image: data.image
        };

        ghosts.push(ghost);
        startGhostMovement(ghost);
    });
}

// =====================================
// DISPARAR TEMPORIZADOR DE MOVIMENTO
// =====================================
function startGhostMovement(ghost) {
    if (ghost.interval) clearInterval(ghost.interval);

    ghost.interval = setInterval(() => {
        // Bloqueia movimento se o jogo estiver pausado ou reiniciando
        if ((typeof paused !== "undefined" && paused) || player.respawning || !gameStarted) return;

        moveGhost(ghost);
    }, ghost.speed);
}

// =====================================
// ALGORITMO DE MOVIMENTAÇÃO CENTRAL
// =====================================
function moveGhost(ghost) {
    let nextMove = ghost.index;

    // Seleciona o comportamento baseado no modo da Blueprint
    switch (ghost.mode) {
        case "chase":
            nextMove = chaseMovement(ghost);
            break;
        case "random":
        default:
            nextMove = randomMovement(ghost);
            break;
    }

    // Aplica a nova posição física
    ghost.index = nextMove;

    // Verifica colisões imediatas pós-passo
    if (typeof checkGhostCollisions === "function") {
        checkGhostCollisions();
    }

    // Atualiza apenas a renderização visual leve (sem recriar tags pesadas)
    if (typeof draw === "function") {
        draw();
    }
}

// =====================================
// IA: MOVIMENTO ALEATÓRIO (GCM/RANDOM) - SEM CONGELAR
// =====================================
function randomMovement(ghost) {
    const directions = [
        { name: "up", index: ghost.index - width },
        { name: "down", index: ghost.index + width },
        { name: "left", index: ghost.index - 1 },
        { name: "right", index: ghost.index + 1 }
    ];

    // Filtra caminhos que fiquem dentro do mapa, não sejam paredes (1) e evitam voltar imediatamente para trás
    const validMoves = directions.filter(dir => {
        const isOpposite = 
            (dir.name === "up" && ghost.lastDirection === "down") ||
            (dir.name === "down" && ghost.lastDirection === "up") ||
            (dir.name === "left" && ghost.lastDirection === "right") ||
            (dir.name === "right" && ghost.lastDirection === "left");

        // Proteção extra: garante que o index existe no tamanho do mapa atual
        const isValidBounds = dir.index >= 0 && dir.index < currentMap.length;
        const isNotWall = isValidBounds && currentMap[dir.index] !== 1;
        
        return isNotWall && !isOpposite;
    });

    // Se estiver em um beco sem saída, aceita voltar para trás contanto que NÃO seja parede
    const finalChoices = validMoves.length > 0 ? validMoves : directions.filter(dir => {
        return dir.index >= 0 && dir.index < currentMap.length && currentMap[dir.index] !== 1;
    });

    if (finalChoices.length > 0) {
        const choice = finalChoices[Math.floor(Math.random() * finalChoices.length)];
        ghost.lastDirection = choice.name;
        return choice.index;
    }

    return ghost.index; // Se tudo falhar, ele fica parado em vez de atravessar paredes
}

function chaseMovement(ghost) {
    const directions = [
        { name: "up", index: ghost.index - width },
        { name: "down", index: ghost.index + width },
        { name: "left", index: ghost.index - 1 },
        { name: "right", index: ghost.index + 1 }
    ];

    let bestMove = ghost.index;
    let minDistance = Infinity;

    const targetX = player.index % width;
    const targetY = Math.floor(player.index / width);

    // Filtra caminhos válidos primeiro para não computar paredes de jeito nenhum
    const allowedMoves = directions.filter(dir => {
        return dir.index >= 0 && dir.index < currentMap.length && currentMap[dir.index] !== 1;
    });

    // Se não houver caminhos inteligentes livres, usa o comportamento aleatório como escape rápido
    if (allowedMoves.length === 0) {
        return randomMovement(ghost);
    }

    allowedMoves.forEach(dir => {
        const currX = dir.index % width;
        const currY = Math.floor(dir.index / width);

        // Distância Euclidiana até o Pac-man
        const distance = Math.pow(currX - targetX, 2) + Math.pow(currY - targetY, 2);

        if (distance < minDistance) {
            minDistance = distance;
            bestMove = dir.index;
            ghost.lastDirection = dir.name;
        }
    });

    return bestMove;
}
// =====================================
// IA: PERSEGUIÇÃO DIRETA (CHASE)
// =====================================
function chaseMovement(ghost) {
    const directions = [
        { name: "up", index: ghost.index - width },
        { name: "down", index: ghost.index + width },
        { name: "left", index: ghost.index - 1 },
        { name: "right", index: ghost.index + 1 }
    ];

    let bestMove = ghost.index;
    let minDistance = Infinity;

    // Coordenadas cartesianas do alvo (Pac-Man)
    const targetX = player.index % width;
    const targetY = Math.floor(player.index / width);

    directions.forEach(dir => {
        // Verifica se a célula é válida e não é parede
        if (dir.index >= 0 && dir.index < currentMap.length && currentMap[dir.index] !== 1) {
            const currX = dir.index % width;
            const currY = Math.floor(dir.index / width);

            // Fórmula de Distância Euclidiana simplificada para performance
            const distance = Math.pow(currX - targetX, 2) + Math.pow(currY - targetY, 2);

            if (distance < minDistance) {
                minDistance = distance;
                bestMove = dir.index;
                ghost.lastDirection = dir.name;
            }
        }
    });

    return bestMove;
}

// =====================================
// VERIFICAÇÃO DE DANO E COLISÕES
// =====================================
function checkGhostCollisions() {
    ghosts.forEach(ghost => {
        if (ghost.index === player.index) {
            if (ghost.scared) {
                eatGhost(ghost);
            } else if (!player.invulnerable && !player.respawning) {
                if (typeof loseLife === "function") {
                    loseLife();
                }
            }
        }
    });
}

// =====================================
// MECÂNICA DE COMER FANTASMA (POWER MODE)
// =====================================
function eatGhost(ghost) {
    score += 200;
    if (typeof updateUI === "function") updateUI();
    if (typeof playGhostEatSound === "function") playGhostEatSound();

    ghost.index = ghost.startIndex;
    ghost.scared = false;
    ghost.lastDirection = null;
}

// Helper global para gerenciar o estado assustado via temporizador do game.js
function setGhostsScared(state) {
    ghosts.forEach(ghost => {
        ghost.scared = state;
    });
}