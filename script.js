document.addEventListener("DOMContentLoaded", () => {
    const defaultSize = 4;
    const board = document.getElementById('boggle-board');
    const wordInput = document.getElementById('word-input');
    const submitButton = document.getElementById('submit-word');
    const resetButton = document.getElementById('reset-game');
    const scoreDisplay = document.getElementById('score');
    const wordListDisplay = document.getElementById('word-list');
    const timerDisplay = document.getElementById('timer');
    const boardSizeSelect = document.getElementById('board-size');
    const timerLengthInput = document.getElementById('timer-length');
    
    let score = 0;
    let boardSize = parseInt(boardSizeSelect.value);
    let boardLetters = [];
    let wordsFound = new Set();
    let timer;
    let timeLeft;
    let selectedCells = [];
    
    // Dictionary of valid words (sample)
    const dictionary = new Set(['CAT', 'DOG', 'BAT', 'RAT', 'CAR', 'CARD', 'CART', 'CARGO']);

    // Generate random letters
    function generateRandomLetter() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // Create the Boggle board
    function createBoard() {
        board.innerHTML = '';
        boardLetters = [];
        for (let i = 0; i < boardSize * boardSize; i++) {
            const letter = generateRandomLetter();
            boardLetters.push(letter);
            const cell = document.createElement('div');
            cell.classList.add('boggle-cell');
            cell.textContent = letter;
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
        board.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;
    }

    // Check if word is valid
    function checkWord(word) {
        return dictionary.has(word.toUpperCase());
    }

    // Highlight the cells part of the word
    function highlightCells(indices, path = false) {
        document.querySelectorAll('.boggle-cell').forEach(cell => {
            const index = parseInt(cell.dataset.index);
            if (indices.includes(index)) {
                cell.classList.add(path ? 'path' : 'highlight');
            } else {
                cell.classList.remove('highlight', 'path');
            }
        });
    }

    // Handle cell click
    function handleCellClick(event) {
        const cell = event.target;
        const index = parseInt(cell.dataset.index);
        if (!selectedCells.includes(index)) {
            selectedCells.push(index);
            wordInput.value += boardLetters[index];
            highlightCells(selectedCells);
        }
    }

    // Handle word submission
    function handleWordSubmit() {
        const word = wordInput.value;
        if (word.length >= 3 && checkWord(word)) {
            if (!wordsFound.has(word)) {
                wordsFound.add(word);
                score += 10 + word.length - 3;  // Bonus for word length
                scoreDisplay.textContent = `Score: ${score}`;
                wordListDisplay.textContent = `Words Found: ${Array.from(wordsFound).join(', ')}`;
            } else {
                alert('Word already found.');
            }
        } else {
            alert('Invalid word. Ensure it is at least 3 letters long and a valid word.');
        }
        wordInput.value = '';
        selectedCells = [];
        highlightCells([], true);
    }

    // Timer countdown
    function startTimer() {
        timeLeft = parseInt(timerLengthInput.value);
        timerDisplay.textContent = `Time Left: ${timeLeft}`;
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time Left: ${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert('Time is up!');
            }
        }, 1000);
    }

    // Reset game
    function resetGame() {
        clearInterval(timer);
        timeLeft = parseInt(timerLengthInput.value);
        timerDisplay.textContent = `Time Left: ${timeLeft}`;
        score = 0;
        wordsFound = new Set();
        scoreDisplay.textContent = `Score: ${score}`;
        wordListDisplay.textContent = 'Words Found: ';
        wordInput.value = '';
        selectedCells = [];
        boardSize = parseInt(boardSizeSelect.value);
        createBoard();
        startTimer();
    }

    // Event listeners
    submitButton.addEventListener('click', handleWordSubmit);
    resetButton.addEventListener('click', resetGame);
    boardSizeSelect.addEventListener('change', resetGame);
    timerLengthInput.addEventListener('change', resetGame);

    // Initialize the board and timer
    createBoard();
    startTimer();
});
