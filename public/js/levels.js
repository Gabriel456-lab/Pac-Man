// Banco de dados e configuração de todas as fases do jogo
// =================================================================

// Mapeamento numérico do tabuleiro:
// 1 -> Parede (Injeta a textura de parede correspondente ao tema)
// 0 -> Comida Normal (Renderiza a tag img com o foodImage do tema)
// 2 -> Power Pellet (Renderiza a tag img com o powerImage do tema)
// 3 -> Caminho Vazio (Espaço livre para movimentação)

const levels = [
    // =========================================
    // FASE 1: CLÁSSICA (Grid 10x10)
    // =========================================
    {
        width: 10,
        height: 10,
        theme: "classic",
        playerStart: 11, // Posição inicial linear do Pac-Man
        ghosts: [
            {
                startIndex: 88,
                speed: 400, // Milissegundos por movimento (menor = mais rápido)
                className: "ghost-red",
                mode: "chase", // Persegue diretamente o jogador
                image: "assets/gifs/ghost-red.gif" // Caminho do GIF
            }
        ],
        map: [
            1,1,1,1,1,1,1,1,1,1,
            1,3,0,0,0,0,0,0,2,1,
            1,0,1,1,0,1,1,1,0,1,
            1,0,0,1,0,0,0,1,0,1,
            1,1,0,1,1,1,0,1,0,1,
            1,0,0,0,0,1,0,0,0,1,
            1,0,1,1,0,1,1,1,0,1,
            1,0,0,1,0,0,0,1,0,1,
            1,2,0,0,0,1,0,0,0,1,
            1,1,1,1,1,1,1,1,1,1
        ]
    },

    // =========================================
    // FASE 2: LABIRINTO DE LAVA (Grid 12x12)
    // =========================================
    {
        width: 12,
        height: 12,
        theme: "lava",
        playerStart: 13,
        ghosts: [
            {
                startIndex: 130,
                speed: 350,
                className: "ghost-red",
                mode: "chase",
                image: "assets/gifs/ghost-red.gif"
            },
            {
                startIndex: 131,
                speed: 450,
                className: "ghost-pink",
                mode: "random", // Movimentação aleatória pelo mapa
                image: "assets/gifs/ghost-pink.gif"
            }
        ],
        map: [
            1,1,1,1,1,1,1,1,1,1,1,1,
            1,3,0,0,0,0,1,0,0,0,2,1,
            1,0,1,1,1,0,1,0,1,1,0,1,
            1,0,1,2,0,0,0,0,0,1,0,1,
            1,0,1,0,1,1,1,1,0,1,0,1,
            1,0,0,0,1,3,3,1,0,0,0,1,
            1,0,0,0,1,3,3,1,0,0,0,1,
            1,0,1,0,1,1,1,1,0,1,0,1,
            1,0,1,0,0,0,0,0,0,1,0,1,
            1,0,1,1,1,0,1,1,1,1,0,1,
            1,2,0,0,0,0,1,0,0,0,0,1,
            1,1,1,1,1,1,1,1,1,1,1,1
        ]
    },

    // =========================================
    // FASE 3: LABIRINTO DE GELO / ICE (Grid 20x20 Manual Estável)
    // =========================================
    {
        width: 20,
        height: 20,
        theme: "ice",
        playerStart: 22, // Spawn simétrico e totalmente aberto
        ghosts: [
            {
                startIndex: 170, // Posicionado estrategicamente nos corredores centrais
                speed: 300,
                className: "ghost-red",
                mode: "chase",
                image: "assets/gifs/ghost-red.gif"
            },
            {
                startIndex: 229,
                speed: 320,
                className: "ghost-pink",
                mode: "chase",
                image: "assets/gifs/ghost-pink.gif"
            },
            {
                startIndex: 169,
                speed: 350,
                className: "ghost-orange",
                mode: "random",
                image: "assets/gifs/ghost-orange.gif"
            }
        ],
        map: [
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,3,0,0,0,0,0,0,1,1,0,0,0,0,0,0,2,1,1,
            1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,
            1,1,2,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,
            1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
            1,1,0,1,1,0,1,0,1,1,1,1,0,1,0,1,1,0,1,1,
            1,1,0,1,1,0,1,0,1,1,1,1,0,1,0,1,1,0,1,1,
            1,1,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,1,1,
            1,1,1,1,1,0,1,1,3,1,1,3,1,1,0,1,1,1,1,1,
            1,1,1,1,1,0,1,3,3,3,3,3,3,1,0,1,1,1,1,1,
            1,1,1,1,1,0,1,3,1,1,1,1,3,1,0,1,1,1,1,1,
            1,1,0,0,0,0,3,3,1,1,1,1,3,3,0,0,0,0,1,1,
            1,1,0,1,1,0,1,3,3,3,3,3,3,1,0,1,1,0,1,1,
            1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,
            1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,
            1,1,1,0,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1,
            1,1,0,0,0,0,1,1,0,1,1,0,1,1,0,0,0,0,1,1,
            1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
        ]
    }
];