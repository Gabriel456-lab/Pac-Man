// Gerenciamento de Temas Visuais, Estilos Dinâmicos e Áudio por Fase
// =================================================================

// =====================================
// ESTADO DO TEMA ATUAL
// =====================================
let currentTheme = null;

// =====================================
// DICIONÁRIO DE CONFIGURAÇÃO DE TEMAS
// =====================================
const themes = {
    // =================================
    // CLÁSSICO (Fase 1)
    // =================================
    classic: {
        name: "Classic",
        wall: "assets/images/wall-classic.png", // Imagem da parede
        floor: "", // Imagem do chão
        foodImage: "assets/images/food.png",      // Imagem da comida (solicitada)
        powerImage: "assets/images/power.png",    // Imagem do power pellet (solicitada)
        background: "#000000",
        border: "#ffe600",
        glow: "#ffe600",
        music: "background", // Chave do som correspondente em audio.js
        particleColor: "#ffe600"
    },

    // =================================
    // LAVA / INFERNAL (Fase 2)
    // =================================
    lava: {
        name: "Lava",
        wall: "assets/images/wall-lava.png",
        floor: "",
        foodImage: "assets/images/food.png",
        powerImage: "assets/images/power.png",
        background: "#1a0500",
        border: "#ff3300",
        glow: "#ff6600",
        music: "lava", // Exemplo de música customizada para lava
        particleColor: "#ff3300"
    },

    // =================================
    // ESPAÇO / CYBER (Fase 3)
    // =================================
    ice: {
        name: "ice",
        wall: "assets/images/wall-ice.png",
        floor: "",
        foodImage: "assets/images/food.png",
        powerImage: "assets/images/power.png",
        background: "#05001a",
        border: "#00ffff",
        glow: "#0088ff",
        music: "gelo",
        particleColor: "#00ffff"
    }
};

// =====================================
// APLICAÇÃO DO TEMA NO DOM E NO CANVAS
// =====================================
function applyTheme(themeName) {
    const theme = themes[themeName] || themes["classic"];
    currentTheme = theme;

    // 1. Atualiza propriedades de estilo globais do body
    document.body.style.backgroundColor = theme.background;

    // 2. Customiza o container do jogo de acordo com o tema
    const gameContainer = document.getElementById("game");
    if (gameContainer) {
        gameContainer.style.borderColor = theme.border;
        gameContainer.style.boxShadow = `0 0 25px ${theme.glow}`;
    }

    // 3. Atualiza as bordas da HUD para orquestrar o visual
    const hudContainer = document.getElementById("hud");
    if (hudContainer) {
        hudContainer.style.borderColor = theme.border;
    }

    // 4. Instancia e limpa partículas ambientais se o método existir
    if (typeof createThemeParticles === "function") {
        const oldParticles = document.querySelectorAll(".theme-particle");
        oldParticles.forEach(p => p.remove());
        createThemeParticles();
    }
}

// =====================================
// EXECUÇÃO DE ÁUDIO SINCRO COM O TEMA
// =====================================
function playThemeMusic(themeName) {
    const theme = themes[themeName] || themes["classic"];
    
    // Verifica se o motor de audio.js está presente no escopo global
    if (typeof stopAllMusic === "function" && typeof music !== "undefined") {
        stopAllMusic();

        const track = music[theme.music];
        if (track && typeof fadeInMusic === "function") {
            fadeInMusic(track);
        }
    }
}

// =====================================
// TRANSIÇÃO DE MUDANÇA DE CENÁRIO (FADE)
// =====================================
function transitionTheme(themeName) {
    // Adiciona classe de transição CSS para escurecer ou suavizar a tela
    document.body.classList.add("theme-transition");

    // Executa as trocas visuais no meio da animação (300ms)
    setTimeout(() => {
        applyTheme(themeName);
        playThemeMusic(themeName);
    }, 300);

    // Remove a classe controladora para revelar o novo cenário reconfigurado
    setTimeout(() => {
        document.body.classList.remove("theme-transition");
    }, 1000);
}

// =====================================
// SISTEMA DE PARTÍCULAS AMBIENTAIS DO TEMA
// =====================================
function createThemeParticles() {
    if (!currentTheme) return;

    // Cria pequenas esferas flutuantes ao fundo baseadas na cor do tema ativo
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement("div");
        particle.classList.add("theme-particle");
        
        particle.style.position = "fixed";
        particle.style.zIndex = "-1";
        particle.style.width = "4px";
        particle.style.height = "4px";
        particle.style.borderRadius = "50%";
        particle.style.pointerEvents = "none";
        
        particle.style.background = currentTheme.particleColor;
        particle.style.left = Math.random() * window.innerWidth + "px";
        particle.style.top = Math.random() * window.innerHeight + "px";
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        
        // Aplica tempos de animação variados para dar profundidade orgânica
        particle.style.animation = `blink ${2 + Math.random() * 4}s infinite alternate`;

        document.body.appendChild(particle);
    }
}