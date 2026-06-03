// Sistema de gerenciamento de efeitos sonoros e músicas de fundo (BGM)
// =================================================================

// =====================================
// CONFIGURAÇÕES GLOBAIS DE ÁUDIO
// =====================================
let masterVolume = 0.5;
let muted = false;

// =====================================
// REGISTRO DE ARQUIVOS DE ÁUDIO (SONS)
// =====================================
const sounds = {
    // Efeitos de Interação
    eat: new Audio("assets/sounds/eat.wav"),
    power: new Audio("assets/sounds/power.wav"),
    ghostEat: new Audio("assets/sounds/ghost.wav"),
    fruit: new Audio("assets/sounds/fruit.wav"),
    
    // Estados do Jogo
    death: new Audio("assets/sounds/death.wav"),
    win: new Audio("assets/sounds/win.wav"),
    gameOver: new Audio("assets/sounds/gameover.wav"),
    respawn: new Audio("assets/sounds/respawn.wav")
};

// =====================================
// REGISTRO DE TRILHAS SONORAS DE FUNDO (BGMS)
// =====================================
const music = {
    background: new Audio("assets/sounds/menu.wav"), // Música da fase clássica
    lava: new Audio("assets/sounds/lava.mp3"),       // Música do tema lava
    gelo: new Audio("assets/sounds/gelo.mp3")     // Música do tema gelo
};

// Configura as músicas de fundo para rodarem em loop infinito
Object.values(music).forEach(track => {
    track.loop = true;
});

// =====================================
// GATILHOS DE DISPARO DE EFEITOS (SFX)
// =====================================
function playEatSound() { playSound(sounds.eat); }
function playPowerSound() { playSound(sounds.power); }
function playGhostEatSound() { playSound(sounds.ghostEat); }
function playDeathSound() { playSound(sounds.death); }
function playWinSound() { playSound(sounds.win); }
function playGameOverSound() { playSound(sounds.gameOver); }
function playFruitSound() { playSound(sounds.fruit); }
function playRespawnSound() { playSound(sounds.respawn); }

// Auxiliar para resetar e tocar um efeito sonoro do início
function playSound(sound) {
    if (muted || !sound) return;
    sound.currentTime = 0; // Reinicia o áudio caso já esteja tocando
    sound.volume = masterVolume;
    sound.play().catch(err => console.log("Áudio bloqueado pelo navegador:", err));
}

// =====================================
// CONTROLE GLOBAL DE MUTE
// =====================================
function toggleMasterMute() {
    muted = !muted;
    
    // Pausa ou retoma as músicas de fundo dependendo do estado
    Object.values(music).forEach(track => {
        if (muted) {
            track.pause();
        } else if (track === music[themes[levels[currentLevel].theme]?.music]) {
            // Se desmutou, toca apenas a música correspondente à fase atual
            track.play().catch(() => {});
        }
    });

    return muted; // Retorna o estado atualizado para a UI ajustar o ícone
}

// =====================================
// CONTROLES DE FLUXO (PAUSA DO JOGO)
// =====================================
function pauseAllMusic() {
    Object.values(music).forEach(track => {
        if (!track.paused) {
            track.wasPlayingBeforePause = true;
            track.pause();
        }
    });
}

function resumeAllMusic() {
    if (muted) return;
    Object.values(music).forEach(track => {
        if (track.wasPlayingBeforePause) {
            track.play().catch(() => {});
            track.wasPlayingBeforePause = false;
        }
    });
}

function stopAllMusic() {
    Object.values(music).forEach(track => {
        track.pause();
        track.currentTime = 0;
        track.wasPlayingBeforePause = false;
    });
}

// =====================================
// EFEITO VISUAL/SONORO: FADE IN DE MÚSICA
// =====================================
function fadeInMusic(track, duration = 2000) {
    if (muted || !track) return;

    track.volume = 0;
    
    // Tenta reproduzir; se o arquivo não existir (404), captura o erro sem quebrar o código
    track.play().catch(err => {
        console.warn("Trilha sonora não encontrada ou bloqueada:", err.message);
    });

    let targetVolume = masterVolume * 0.4;
    let currentVol = 0;
    const step = 0.02;
    const intervalTime = duration / (targetVolume / step);

    const interval = setInterval(() => {
        if (track.paused) {
            clearInterval(interval);
            return;
        }
        currentVol += step;
        if (currentVol >= targetVolume) {
            currentVol = targetVolume;
            clearInterval(interval);
        }
        track.volume = currentVol;
    }, intervalTime);
}

// =====================================
// EFEITO VISUAL/SONORO: FADE OUT DE MÚSICA
// =====================================
function fadeOutMusic(track, duration = 2000) {
    if (!track || track.paused) return;

    let currentVol = track.volume;
    const step = 0.02;
    const intervalTime = duration / (currentVol / step);

    const interval = setInterval(() => {
        currentVol -= step;
        if (currentVol <= 0) {
            currentVol = 0;
            track.pause();
            clearInterval(interval);
        }
        track.volume = currentVol;
    }, intervalTime);
}

// =====================================
// SELETOR AUTOMÁTICO DE MÚSICA POR FASE
// =====================================
function playLevelMusic() {
    if (typeof levels === "undefined" || !levels[currentLevel]) return;
    
    const currentThemeName = levels[currentLevel].theme;
    const themeConfig = themes[currentThemeName] || themes["classic"];
    
    const trackToPlay = music[themeConfig.music];
    if (trackToPlay) {
        fadeInMusic(trackToPlay);
    }
}