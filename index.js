<<<<<<< HEAD
// index.js
const express = require('express');
const path = require('path');
const chalk = require('chalk');

const app = express();
const PORT = 3000;

// Entrega os arquivos da pasta public (HTML, CSS, JS do jogo)
app.use(express.static(path.join(__dirname, 'public')));

// Liga o servidor
app.listen(PORT, () => {
    console.log(chalk.black.bgYellow(" PAC-MAN SERVER ") + chalk.yellow(` Rodando com sucesso!`));
    console.log(chalk.cyan(`👉 Abra no navegador para jogar: `) + chalk.underline.cyan(`http://localhost:${PORT}`));
=======
// index.js
const express = require('express');
const path = require('path');
const chalk = require('chalk');

const app = express();
const PORT = 3000;

// Entrega os arquivos da pasta public (HTML, CSS, JS do jogo)
app.use(express.static(path.join(__dirname, 'public')));

// Liga o servidor
app.listen(PORT, () => {
    console.log(chalk.black.bgYellow(" PAC-MAN SERVER ") + chalk.yellow(` Rodando com sucesso!`));
    console.log(chalk.cyan(`👉 Abra no navegador para jogar: `) + chalk.underline.cyan(`http://localhost:${PORT}`));
>>>>>>> 91fedaaa8c3dc1f77594e8408eed43b1d8dd45c5
});