document.addEventListener("DOMContentLoaded", () => {
    const boardSize = 4;
    const board = document.getElementById('boggle-board');
    const wordInput = document.getElementById('word-input');
    const submitButton = document.getElementById('submit-word');
    const scoreDisplay = document.getElementById('score');
    
    let score = 0;
    let boardLetters = [];

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
            board.appendChild(cell);
        }
    }

    // Check if word is in the board (simple version)
    function checkWord(word) {
        word = word.toUpperCase();
        return boardLetters.join('').includes(word);
    }

    // Handle word submission
    function handleWordSubmit() {
        const word = wordInput.value;
        if (word.length >= 3 && checkWord(word)) {
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
        } else {
            alert('Invalid word. Ensure it is at least 3 letters long and exists on the board.');
        }
        wordInput.value = '';
    }

    // Initialize the board
    createBoard();

    // Event listeners
    submitButton.addEventListener('click', handleWordSubmit);
});
