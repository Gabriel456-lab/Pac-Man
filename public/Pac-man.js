// Pac-man.js

// Seleciona os elementos do HTML
const game = document.getElementById("game");
const scoreText = document.getElementById("score");

// Limites e pontuações no mapa (Matriz 10x10)
const width = 10;
const height = 10;
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
let pacmanIndex = 11;
let enemyIndex = 88;

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

// Função dos movimentos do Pac-man
function movePacman(e) {
    let nextIndex = pacmanIndex;

    // Identifica qual tecla foi pressionada
    switch(e.key){
        case "ArrowUp":
            nextIndex -= width;
            break;
        case "ArrowDown":
            nextIndex += width;
            break;
        case "ArrowLeft":
            nextIndex -= 1;
            break;
        case "ArrowRight":
            nextIndex += 1;
            break;
        default:
            return; // Ignora outras teclas
    }

    // Verifica se não saiu do mapa e se não é uma parede 
    if (cells[nextIndex] && !cells[nextIndex].classList.contains("wall")) {
        pacmanIndex = nextIndex;
    }

    // Verifica se existe comida na posição atual
    if(cells[pacmanIndex].classList.contains("food")){
        cells[pacmanIndex].classList.remove("food");
        score += 10;
        scoreText.innerText = score;

        // Verifica a vitória (se não há mais nenhuma comida no tabuleiro)
        const remainingFood = document.querySelectorAll('.food');
        if(remainingFood.length === 0){
            setTimeout(() => { 
                alert("🏆 Você venceu!");
                location.reload();
            }, 100);
        }
    }
    
    // Verifica encontro com o inimigo (Movimento do jogador)
    if(pacmanIndex === enemyIndex) {
        setTimeout(() => {
            alert("👻 Game Over! O fantasma te pegou.");
            location.reload();
        }, 100);
    }    

    draw(); 
}

document.addEventListener("keydown", movePacman);

// Função de movimentos do inimigo (Fantasma)
function moveEnemy() {
    const directions = [-1, +1, -width, +width];
    
    // Escolhe aleatoriamente uma direção
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const nextIndex = enemyIndex + direction;

    // Verifica barreiras para o fantasma
    if (cells[nextIndex] && !cells[nextIndex].classList.contains("wall")) {
        enemyIndex = nextIndex;
    }
    
    // Verifica colisão com o player (Movimento do Fantasma)
    if(enemyIndex === pacmanIndex){
        draw(); // Garante que o fantasma apareça na posição antes de travar a tela
        setTimeout(() => {
            alert("👻 Game Over! O fantasma te pegou.");
            location.reload();
        }, 100);
        return;
    }
    
    draw();
}

// Executa o movimento do fantasma a cada 0.5 segundos
setInterval(moveEnemy, 500);