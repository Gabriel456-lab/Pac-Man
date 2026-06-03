// Arquivo principal do jogo - Centralizador de Estados e Renderização
// =================================================================

// ===============================
// ELEMENTOS HTML
// ===============================
const game = document.getElementById("game");
const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
const livesText = document.getElementById("lives");

// ===============================
// CONFIGURAÇÕES DO JOGO
// ===============================
let currentLevel = 0;
let score = 0;
let gameStarted = false;

// ===============================
// PLAYER
// ===============================
const player = {
    index: 0,
    lives: 3,
    invulnerable: false,
    respawning: false
};

// ===============================
// FANTASMAS
// ===============================
let ghosts = [];

// ===============================
// TABULEIRO E DIMENSÕES
// ===============================
let cells = [];
let width = 10;
let height = 10;
let currentMap = [];

// ===============================
// INICIAR JOGO
// ===============================
function startGame() {
    if (gameStarted) return;
    
    score = 0;
    player.lives = 3;
    currentLevel = 0;
    
    loadLevel(currentLevel);
    document.addEventListener("keydown", movePlayer);
    gameStarted = true;
    
    if (typeof updateUI === "function") updateUI();
}

// ===============================
// CARREGA FASE E CONFIGURA CENÁRIO
// ===============================
function loadLevel(levelIndex) {
    // Verifica se a fase existe, senão finaliza ou reinicia o loop
    if (!levels[levelIndex]) {
        alert("🏆 PARABÉNS! Você venceu todas as fases!");
        currentLevel = 0;
        location.reload();
        return;
    }

    const level = levels[levelIndex];
    width = level.width;
    height = level.height;
    currentMap = [...level.map]; // Clona o mapa original para não mutar a blueprint
    
    // Limpa o tabuleiro anterior e redefine o array de células
    game.innerHTML = "";
    cells = [];
    
    // Ajusta o grid CSS dinamicamente com base no tamanho da fase
    game.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    game.style.gridTemplateRows = `repeat(${height}, 1fr)`;

    // Aplica o cenário e música correspondente ao tema da fase
    if (typeof applyTheme === "function") {
        applyTheme(level.theme);
        if (typeof playThemeMusic === "function") {
            playThemeMusic(level.theme);
        }
    }

    // Criar o Tabuleiro fisicamente no DOM
    createBoard(level);

    // Reinicia e spawna os fantasmas específicos da fase
    ghosts.forEach(ghost => {
        if (ghost.interval) clearInterval(ghost.interval);
    });
    ghosts = [];
    if (typeof createGhosts === "function" && level.ghosts) {
        createGhosts(level.ghosts);
    }

    // Posiciona o Player
    player.index = level.playerStart;
    player.respawning = false;
    player.invulnerable = false;

    // Atualiza a interface visual (Fase, Score, Vidas)
    if (typeof updateUI === "function") {
        updateUI();
    }
    
    // Atualiza o estado visual das direções e texturas
    draw();
}

// ===============================
// CRIAÇÃO FÍSICA DO TABULEIRO (Injeção de Imagens e Estilos)
// ===============================
function createBoard(level) {
    const currentThemeName = level.theme || "classic";
    const themeConfig = themes[currentThemeName] || themes["classic"];

    for (let i = 0; i < currentMap.length; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        
        // Define o background padrão do chão do tema
        cell.style.backgroundImage = `url(${themeConfig.floor})`;
        cell.style.backgroundSize = "cover";

        // 1 -> PAREDE
        if (currentMap[i] === 1) {
            cell.classList.add("wall");
            cell.style.backgroundImage = `url(${themeConfig.wall})`;
        } 
        // 0 -> COMIDA NORMAL
        else if (currentMap[i] === 0) {
            const foodImg = document.createElement("img");
            foodImg.src = themeConfig.foodImage || "assets/images/food.png";
            foodImg.classList.add("food-item");
            cell.appendChild(foodImg);
        } 
        // 2 -> POWER PELLET
        else if (currentMap[i] === 2) {
            const powerImg = document.createElement("img");
            powerImg.src = themeConfig.powerImage || "assets/images/power.png";
            powerImg.classList.add("power-item");
            cell.appendChild(powerImg);
        }

        game.appendChild(cell);
        cells.push(cell);
    }
}

// ===============================
// ATUALIZAÇÃO RECORRENTE DA RENDERIZAÇÃO (DRAW)
// ===============================
function draw() {
    // 1. Limpa todas as classes visuais antigas dos personagens de todas as células
    cells.forEach((cell) => {
        if (!cell) return;
        cell.classList.remove(
            "pacman", "scared", "invulnerable", 
            "face-up", "face-down", "face-left", "face-right",
            "ghost-red-sprite", "ghost-pink-sprite", "ghost-cyan-sprite", "ghost-orange-sprite"
        );
    });

    // 2. Desenha o Player (Pac-Man) apenas aplicando a classe
    if (cells[player.index] && !player.respawning) {
        const playerCell = cells[player.index];
        playerCell.classList.add("pacman");
        
        if (player.invulnerable) {
            playerCell.classList.add("invulnerable");
        }
        
        // Aplica a rotação correta baseada no player.js
        if (typeof updatePlayerDirection === "function") {
            updatePlayerDirection();
        }
    }

    // 3. Desenha os Fantasmas aplicando as novas classes CSS dedicadas
    ghosts.forEach(ghost => {
        if (cells[ghost.index]) {
            const ghostCell = cells[ghost.index];
            
            if (ghost.scared) {
                ghostCell.classList.add("scared");
            } else {
                // Mapeia a classe correspondente de acordo com o nome dele (ex: ghost-red -> ghost-red-sprite)
                const spriteClass = `${ghost.className}-sprite`;
                ghostCell.classList.add(spriteClass);
            }
        }
    });
}

// ===============================
// SISTEMA DE INTERAÇÕES E VERIFICAÇÃO DE VITÓRIA
// ===============================
function checkInteractions(index) {
    // Se o player passar por cima de comida normal
    if (currentMap[index] === 0) {
        currentMap[index] = 3; // 3 representa vazio coletado
        score += 10;
        
        if (cells[index]) {
            const food = cells[index].querySelector(".food-item");
            if (food) food.remove();
            if (typeof createEatEffect === "function") createEatEffect(index);
        }
        
        if (typeof playEatSound === "function") playEatSound();
        if (typeof updateUI === "function") updateUI();
        checkWinCondition();
    } 
    // Se passar por cima da Power Pellet
    else if (currentMap[index] === 2) {
        currentMap[index] = 3;
        score += 50;
        
        if (cells[index]) {
            const power = cells[index].querySelector(".power-item");
            if (power) power.remove();
        }
        
        if (typeof playPowerSound === "function") playPowerSound();
        if (typeof activatePowerMode === "function") activatePowerMode();
        if (typeof updateUI === "function") updateUI();
        checkWinCondition();
    }
}

// ===============================
// SISTEMA DE VERIFICAÇÃO E TROCA DE FASE AUTOMÁTICA
// ===============================
function checkWinCondition() {
    // Procura se ainda resta alguma comida ou power pellet no mapa atual
    const hasFoodLeft = currentMap.includes(0) || currentMap.includes(2);
    
    if (!hasFoodLeft) {
        // Pausa temporariamente os movimentos para a transição
        player.respawning = true;
        ghosts.forEach(ghost => {
            if (ghost.interval) clearInterval(ghost.interval);
        });

        if (typeof playWinSound === "function") playWinSound();
        
        // Dispara o alerta visual ou notificação da UI se disponível
        if (typeof showNotification === "function") {
            showNotification("🎉 Fase Concluída!");
        }

        // Aguarda 2 segundos para tocar o som de vitória e transicionar o tema do próximo nível
        setTimeout(() => {
            currentLevel++;
            if (typeof transitionTheme === "function" && levels[currentLevel]) {
                transitionTheme(levels[currentLevel].theme);
                setTimeout(() => {
                    loadLevel(currentLevel);
                }, 300); // Sincronizado com o efeito de fade do transitionTheme
            } else {
                loadLevel(currentLevel);
            }
        }, 2000);
    }
}

// ===============================
// MECÂNICA DE PERDA DE VIDA E GAME OVER
// ===============================
function loseLife() {
    player.lives--;
    if (typeof updateUI === "function") updateUI();
    if (typeof playDeathSound === "function") playDeathSound();

    if (player.lives <= 0) {
        if (typeof playGameOverSound === "function") playGameOverSound();
        alert("👻 GAME OVER! Tente novamente.");
        location.reload();
        return;
    }

    if (typeof respawnPlayer === "function") {
        respawnPlayer();
    }
}

// ===============================
// RESPAWN DO JOGADOR
// ===============================
function respawnPlayer() {
    player.respawning = true;
    player.invulnerable = true;

    player.index = levels[currentLevel].playerStart;
    draw();

    // Libera a movimentação após 1 segundo
    setTimeout(() => {
        player.respawning = false;
    }, 1000);

    // Remove a invulnerabilidade temporária após 3 segundos
    setTimeout(() => {
        player.invulnerable = false;
        draw();
    }, 3000);
}

// ===============================
// ATIVAÇÃO DO MODO ASSUSTADO (POWER)
// ===============================
function activatePowerMode() {
    if (typeof setGhostsScared === "function") {
        setGhostsScared(true);
    } else {
        ghosts.forEach(ghost => { ghost.scared = true; });
    }
    draw();

    // Duração do Power Mode fixado em 7 segundos
    setTimeout(() => {
        if (typeof setGhostsScared === "function") {
            setGhostsScared(false);
        } else {
            ghosts.forEach(ghost => { ghost.scared = false; });
        }
        draw();
    }, 7000);
}