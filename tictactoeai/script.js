const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('#statusText');
const restartBtn = document.querySelector('#restartBtn');

let board = ['', '', '', '', '', '', '', '', ''];
const human = 'X';
const ai = 'O';
let currentStarter = localStorage.getItem('tictactoeStarter') || human;
let currentPlayer = currentStarter;
let gameActive = true;
let aiTimeout;

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

initializeGame();

function initializeGame() {
    cells.forEach(cell => cell.addEventListener('click', cellClicked));
    restartBtn.addEventListener('click', restartGame);
    gameActive = true;

    if (currentPlayer === ai) {
        statusText.textContent = `AI is thinking...`;
        aiTimeout = setTimeout(() => {
            const bestMove = getBestMove();
            const aiCell = document.querySelector(`.cell[data-index="${bestMove}"]`);
            makeMove(aiCell, bestMove, ai);
            checkWinner();
            if (gameActive) {
                currentPlayer = human;
                statusText.textContent = `Your Turn!`;
            }
        }, 500);
    } else {
        statusText.textContent = `Your Turn!`;
    }
}

function cellClicked() {
    const cellIndex = this.getAttribute('data-index');

    if (board[cellIndex] !== '' || !gameActive || currentPlayer !== human) {
        return;
    }

    makeMove(this, cellIndex, human);
    checkWinner();

    if (gameActive) {
        currentPlayer = ai;
        statusText.textContent = `AI is thinking...`;
        clearTimeout(aiTimeout);
        aiTimeout = setTimeout(() => {
            const bestMove = getBestMove();
            const aiCell = document.querySelector(`.cell[data-index="${bestMove}"]`);
            makeMove(aiCell, bestMove, ai);
            checkWinner();
            if (gameActive) {
                currentPlayer = human;
                statusText.textContent = `Your Turn!`;
            }
        }, 500); // Small delay to feel like it's thinking
    }
}

function makeMove(cell, index, player) {
    board[index] = player;
    
    // Create image element for X or O
    const img = document.createElement('img');
    img.src = player === 'X' ? 'x.png' : 'o.png';
    img.alt = player;
    
    cell.appendChild(img);
    cell.classList.add('occupied');
}

function checkWinner() {
    let roundWon = false;
    let winningPlayer = null;

    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        const cellA = board[condition[0]];
        const cellB = board[condition[1]];
        const cellC = board[condition[2]];

        if (cellA === '' || cellB === '' || cellC === '') {
            continue;
        }

        if (cellA === cellB && cellB === cellC) {
            roundWon = true;
            winningPlayer = cellA;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = winningPlayer === human ? `You Win! 🎉` : `AI Wins! 🤖`;
        gameActive = false;
    } else if (!board.includes('')) {
        statusText.textContent = `It's a Draw! 🤝`;
        gameActive = false;
    }
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentStarter = currentStarter === human ? ai : human;
    localStorage.setItem('tictactoeStarter', currentStarter);
    currentPlayer = currentStarter;
    
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('occupied');
    });
    gameActive = true;
    clearTimeout(aiTimeout);

    if (currentPlayer === ai) {
        statusText.textContent = `AI is thinking...`;
        aiTimeout = setTimeout(() => {
            const bestMove = getBestMove();
            const aiCell = document.querySelector(`.cell[data-index="${bestMove}"]`);
            makeMove(aiCell, bestMove, ai);
            checkWinner();
            if (gameActive) {
                currentPlayer = human;
                statusText.textContent = `Your Turn!`;
            }
        }, 500);
    } else {
        statusText.textContent = `Your Turn!`;
    }
}

// === Minimax AI Implementation ===

function getAvailableMoves(currentBoard) {
    let moves = [];
    for (let i = 0; i < currentBoard.length; i++) {
        if (currentBoard[i] === '') moves.push(i);
    }
    return moves;
}

function checkWin(currentBoard, player) {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (currentBoard[a] === player && currentBoard[b] === player && currentBoard[c] === player) {
            return true;
        }
    }
    return false;
}

function minimax(newBoard, player) {
    const availSpots = getAvailableMoves(newBoard);

    if (checkWin(newBoard, human)) {
        return { score: -10 };
    } else if (checkWin(newBoard, ai)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];

    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === ai) {
            const result = minimax(newBoard, human);
            move.score = result.score;
        } else {
            const result = minimax(newBoard, ai);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = ''; // reset spot
        moves.push(move);
    }

    let bestMove;
    if (player === ai) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function getBestMove() {
    // If it's the first move and AI goes first (not the case here, but good practice),
    // or board is empty, pick randomly to avoid always playing same corner
    if (getAvailableMoves(board).length === 9) {
        return Math.floor(Math.random() * 9);
    }
    const bestMove = minimax(board, ai);
    return bestMove.index;
}
