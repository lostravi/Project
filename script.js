
const cells = document.querySelectorAll('.cell');
const statusView = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const scoreView = document.getElementById('score');
const gameLevel = document.getElementById('gameLevel');

let board = ['', '', '', '', '', '', '', '', ''];
// 'X' is user, 'O' is computer
let currentPlayer = 'X';  
let isGameActive = true;
let scores = { user: 0, computer: 0, tie: 0 };
let difficulty = 'easy';
// Track who won the last game
let previousWinner = '';  
// Track if it's the first play
let isFirstPlay = true;  


// Winning conditions (rows, columns, diagonals)
const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
  [0, 4, 8], [2, 4, 6]              // Diagonals
];

// Helper function to check for winner
function checkWinner() {
    for (let condition of winningConditions) {
        let [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes('') ? null : 'tie';
}

// Handle cell click by user
function handleUserClick(e) {
    const index = e.target.getAttribute('data-index');
    if (!board[index] && isGameActive) {
        board[index] = 'X';
        updateBoard();
        if (!checkGameStatus()) {
            setTimeout(computerMove, 500); // Computer's turn
        }
    }
}

// Handle computer move based on difficulty
function computerMove() {
    let move;
    if (difficulty === 'easy') {
        move = getRandomMove();
    } else if (difficulty === 'medium') {
        move = getMediumMove();
    } else {
        // Minimax for hard
        move = getBestMove(); 
    }
    if (move !== null) {
        board[move] = 'O';
        updateBoard();
        checkGameStatus();
    }
}

// Easy difficulty
function getRandomMove() {
    let emptyCells = board.map((m, i) => v === '' ? i : null).filter(m => m !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Medium difficulty
function getMediumMove() {
    // Block user win if possible
    for (let condition of winningConditions) {
        let [a, b, c] = condition;
        if (board[a] === 'X' && board[a] === board[b] && !board[c]) return c;
        if (board[a] === 'X' && board[a] === board[c] && !board[b]) return b;
        if (board[b] === 'X' && board[b] === board[c] && !board[a]) return a;
    }
    // Otherwise random move
    return getRandomMove(); 
}

// Hard difficulty
function getBestMove() {
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    let result = checkWinner();
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'tie') return 0;
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check game status and update UI
function checkGameStatus() {
    const winner = checkWinner();
    if (winner) {
        isGameActive = false;
        if (winner === 'X') {
            statusView.textContent = 'User Wins!';
            scores.user++;
            // User won
            previousWinner = 'X';  
        } else if (winner === 'O') {
            statusView.textContent = 'Computer Wins!';
            scores.computer++;
            // Computer won
            previousWinner = 'O';  
        } else {
            statusView.textContent = 'It\'s a Tie!';
            scores.tie++;
            // It's a tie
            previousWinner = 'tie';
        }
        scoreView.textContent = `User: ${scores.user} | Computer: ${scores.computer} | Ties: ${scores.tie}`;
        return true;
    }
    statusView.textContent = `Current Player: ${currentPlayer === 'X' ? 'User' : 'Computer'}`;
    return false;
}

// Update the board UI
function updateBoard() {
    cells.forEach((cell, index) => {
        cell.textContent = board[index];
        cell.classList.toggle('disabled', !!board[index]);
    });
}

// Restart the game
function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    isGameActive = true;
    // Determine who goes first
    if (isFirstPlay || previousWinner === 'tie') {
        // Randomly choose
        currentPlayer = Math.random() < 0.5 ? 'X' : 'O';  
    } else {
        // Loser goes first
        currentPlayer = previousWinner === 'X' ? 'O' : 'X';  
    }
    isFirstPlay = false;

    statusView.textContent = `Current Player: ${currentPlayer === 'X' ? 'User' : 'Computer'}`;

    updateBoard();

    // If computer goes first
    if (currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
    
}

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleUserClick));
restartBtn.addEventListener('click', restartGame);
gameLevel.addEventListener('change', (e) => difficulty = e.target.value);


// Initialize game
restartGame();
