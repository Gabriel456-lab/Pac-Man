// Pac-man.js

/* ============================================================
ALTERAÇÃO 1: Objeto de configuração centralizado (CONFIG)
ANTES: os valores como velocidade, posição inicial e pontos ficavam espalhados pelo código (11, 88, 500, 10).
AGORA: estão todos num único lugar. Se quiser mudar a velocidade do fantasma, por exemplo, 
basta alterar CONFIG.enemySpeed — sem precisar caçar o número no meio do código.
============================================================*/
const CONFIG = {
    width: 10,
    height: 10,
    pacmanStart: 11,
    enemyStart: 88,
    enemySpeed: 500,
    pointsPerFood: 10,
};

// Seleciona os elementos do HTML
const game = document.getElementById("game");
const scoreText = document.getElementById("score");

let score = 0;

// 1 = Parede, 0 = Caminho/Comida
const map = [
  1,1,1,1,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,1,
  1,0,1,1,0,1,1,1,0,1,
  1,0,0,1,0,0,0,1,0,1,
  1,1,0,1,1,1,0,1,0,1,
  1,0,0,0,0,1,0,0,0,1,
  1,0,1,1,0,1,1,1,0,1,
  1,0,0,1,0,0,0,1,0,1,
  1,0,0,0,0,1,0,0,0,1,
  1,1,1,1,1,1,1,1,1,1
];

const cells = [];
let pacmanIndex = CONFIG.pacmanStart;
let enemyIndex = CONFIG.enemyStart;
 
/* ============================================================
ALTERAÇÃO 2: Controle de estado do jogo (gameRunning)
ANTES: quando o jogo acabava, o setInterval continuava rodando nos bastidores. Isso causava múltiplos alerts em sequência se
o fantasma continuasse colidindo durante os 100ms do setTimeout.
AGORA: a flag gameRunning bloqueia qualquer lógica depois do fim de jogo, garantindo que o alert apareça apenas uma vez.
============================================================*/
let gameRunning = true;

// Função que cria o mapa visualmente
function createBoard() {
    for(let i = 0; i < map.length; i++) {
        const cell = document.createElement("div");
        cell.classList.add('cell');

        if(map[i] === 1){
            cell.classList.add('wall');
        } else {
            cell.classList.add('food');
        }
        game.appendChild(cell);
        cells.push(cell);
    }
}

createBoard();

// Desenha o Pac-man e o Fantasma nas posições atuais
function draw() {
    cells.forEach(cell => {
        cell.classList.remove('pacman');
        cell.classList.remove('enemy');
    });
    
    if (cells[pacmanIndex]) cells[pacmanIndex].classList.add('pacman');
    if (cells[enemyIndex]) cells[enemyIndex].classList.add('enemy');
}

draw();

/*==========================================================
ALTERAÇÃO 3: Função isValidMove() — valida movimento com proteção contra travessia de bordas laterais.
ANTES: a verificação era apenas "não é parede", o que em teoria permite que índice 19 + 1 = 20 (pula para a próxima linha).
Na prática o labirinto atual tem paredes nas bordas e isso não ocorre, MAS se o mapa mudar no futuro, o bug apareceria.
AGORA: além de checar parede, verificamos se houve mudança de linha inesperada ao mover para esquerda/direita.
Isso torna o código robusto para qualquer mapa futuro.
============================================================*/
function isValidMove(currentIndex, nextIndex) {
    // Saiu dos limites do array?
    if (nextIndex < 0 || nextIndex >= cells.length) return false;
 
    // É uma parede?
    if (cells[nextIndex].classList.contains("wall")) return false;
 
    // Mudança horizontal: verifica se permanece na mesma linha
    const diff = nextIndex - currentIndex;
    if (diff === 1 || diff === -1) {
        const currentRow = Math.floor(currentIndex / CONFIG.width);
        const nextRow = Math.floor(nextIndex / CONFIG.width);
        if (currentRow !== nextRow) return false;
    }
 
    return true;
}
 
/* ============================================================
ALTERAÇÃO 4: Separação de responsabilidades nas funções
ANTES: movePacman() fazia tudo — mover, checar comida e checar colisão com inimigo — numa função só.
AGORA: cada responsabilidade tem sua própria função pequena e clara. movePacman() apenas coordena as chamadas. Isso facilita
entender, testar e modificar cada parte individualmente.
============================================================*/
 
// Verifica e processa se Pac-Man comeu uma bolinha
function checkFoodCollision() {
    if (cells[pacmanIndex].classList.contains("food")) {
        cells[pacmanIndex].classList.remove("food");
        score += CONFIG.pointsPerFood;
        scoreText.innerText = score;
 
        const remainingFood = document.querySelectorAll(".food");
        if (remainingFood.length === 0) {
            endGame("🏆 Você venceu!");
        }
    }
}
 
// Verifica se Pac-Man colidiu com o fantasma
function checkEnemyCollision() {
    if (pacmanIndex === enemyIndex) {
        endGame("👻 Game Over! O fantasma te pegou.");
    }
}
 
/*============================================================
ALTERAÇÃO 5: Função endGame() centraliza o fim de jogo
ANTES: alert() + location.reload() estavam duplicados em dois lugares (no movimento do jogador E no movimento do inimigo).
AGORA: existe um único ponto de saída para o fim do jogo.Também desativa o gameRunning para evitar múltiplos disparos,
e usa confirm() no lugar de alert() — assim o jogador escolhe se quer jogar de novo, sem recarregar a página à força.
============================================================*/

function endGame(message) {
    if (!gameRunning) return;
    gameRunning = false;
 
    draw(); // garante que o estado visual final apareça
 
    setTimeout(() => {
        const playAgain = confirm(message + "\n\nJogar novamente?");
        if (playAgain) resetGame();
    }, 100);
}
 
/*============================================================
ALTERAÇÃO 6: Função resetGame() substitui location.reload()
ANTES: o jogo reiniciava recarregando a página inteira, o que é brusco e perderia qualquer dado futuro (recorde, fase, etc).
AGORA: o estado é resetado manualmente — posições voltam ao início, comidas reaparecem, pontuação zera — sem reload.
Isso também é a base necessária para implementar fases depois.
============================================================*/
function resetGame() {
    score = 0;
    scoreText.innerText = score;
    pacmanIndex = CONFIG.pacmanStart;
    enemyIndex = CONFIG.enemyStart;
    gameRunning = true;
 
    // Recoloca as comidas em todas as células de caminho
    cells.forEach((cell, i) => {
        cell.classList.remove("pacman", "enemy", "food");
        if (map[i] === 0) {
            cell.classList.add("food");
        }
    });
 
    draw();
}
 
// Movimento do Pac-Man (controlado pelo teclado)
function movePacman(e) {
    if (!gameRunning) return; // ALTERAÇÃO 2: bloqueia input após fim de jogo
 
    let nextIndex = pacmanIndex;
 
    switch (e.key) {
        case "ArrowUp":    nextIndex -= CONFIG.width; break;
        case "ArrowDown":  nextIndex += CONFIG.width; break;
        case "ArrowLeft":  nextIndex -= 1;            break;
        case "ArrowRight": nextIndex += 1;            break;
        default: return;
    }
 
    // ALTERAÇÃO 3: usa isValidMove() no lugar da verificação simples
    if (isValidMove(pacmanIndex, nextIndex)) {
        pacmanIndex = nextIndex;
    }
 
    // ALTERAÇÃO 4: responsabilidades separadas em funções próprias
    checkFoodCollision();
    checkEnemyCollision();
    draw();
}
 
document.addEventListener("keydown", movePacman);
 
// Movimento do fantasma (automático)
function moveEnemy() {
    if (!gameRunning) return; // ALTERAÇÃO 2: para o fantasma após fim de jogo
 
    const directions = [-1, +1, -CONFIG.width, +CONFIG.width];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const nextIndex = enemyIndex + direction;
 
    // ALTERAÇÃO 3: usa isValidMove() aqui também
    if (isValidMove(enemyIndex, nextIndex)) {
        enemyIndex = nextIndex;
    }
 
    // ALTERAÇÃO 4: mesma função de colisão usada nos dois lugares
    checkEnemyCollision();
    draw();
}

// Executa o movimento conforme o CONFIG.enemySpeed
setInterval(moveEnemy, CONFIG.enemySpeed);