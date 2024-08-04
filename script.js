document.addEventListener("DOMContentLoaded", () => {
    const boardSize = 4;
    const board = document.getElementById('boggle-board');
    const wordInput = document.getElementById('word-input');
    const submitButton = document.getElementById('submit-word');
    const scoreDisplay = document.getElementById('score');
    const wordListDisplay = document.getElementById('word-list');
    const timerDisplay = document.getElementById('timer');
    
    let score = 0;
    let boardLetters = [];
    let wordsFound = new Set();
    let timer;
    let timeLeft = 60;

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
    }

    // Check if word is in the board (basic version)
    function checkWord(word) {
        word = word.toUpperCase();
        return boardLetters.join('').includes(word);
    }

    // Highlight the cells part of the word
    function highlightCells(indices) {
        document.querySelectorAll('.boggle-cell').forEach(cell => {
            if (indices.includes(parseInt(cell.dataset.index))) {
                cell.classList.add('highlight');
            } else {
                cell.classList.remove('highlight');
            }
        });
    }

    // Handle cell click
    function handleCellClick(event) {
        const cell = event.target;
        const index = parseInt(cell.dataset.index);
        if (!wordInput.value.includes(boardLetters[index])) {
            wordInput.value += boardLetters[index];
            cell.classList.add('highlight');
        }
    }

    // Handle word submission
    function handleWordSubmit() {
        const word = wordInput.value;
        if (word.length >= 3 && checkWord(word)) {
            if (!wordsFound.has(word)) {
                wordsFound.add(word);
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                wordListDisplay.textContent = `Words Found: ${Array.from(wordsFound).join(', ')}`;
            } else {
                alert('Word already found.');
            }
        } else {
            alert('Invalid word. Ensure it is at least 3 letters long and exists on the board.');
        }
        wordInput.value = '';
        document.querySelectorAll('.boggle-cell').forEach(cell => cell.classList.remove('highlight'));
    }

    // Timer countdown
    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time Left: ${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert('Time is up!');
            }
        }, 1000);
    }

    // Initialize the board and timer
    createBoard();
    startTimer();

    // Event listeners
    submitButton.addEventListener('click', handleWordSubmit);
});
