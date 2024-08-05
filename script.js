document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById('boggle-board');
    const wordInput = document.getElementById('word-input');
    const submitButton = document.getElementById('submit-word');
    const resetButton = document.getElementById('reset-game');
    const hintButton = document.getElementById('hint-button');
    const scoreDisplay = document.getElementById('score');
    const wordListDisplay = document.getElementById('word-list');
    const timerDisplay = document.getElementById('timer');
    const difficultySelect = document.getElementById('difficulty');
    const usernameInput = document.getElementById('username');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userNameDisplay = document.getElementById('user-name');
    const profileUsernameDisplay = document.getElementById('profile-username');
    const profileHighscoreDisplay = document.getElementById('profile-highscore');
    const highscoresList = document.getElementById('highscores-list');
    const leaderboardList = document.getElementById('leaderboard-list');
    const themeSwitch = document.getElementById('theme-switch');
    const soundToggle = document.getElementById('sound-toggle');
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    const profileSection = document.getElementById('profile-section');
    const difficultySection = document.getElementById('difficulty-section');
    const settingsSection = document.getElementById('settings-section');
    const highscoresSection = document.getElementById('highscores-section');
    const leaderboardSection = document.getElementById('leaderboard-section');
    
    let score = 0;
    let boardSize = 4;
    let timeLimit = 60;
    let boardLetters = [];
    let wordsFound = new Set();
    let timer;
    let timeLeft;
    let selectedCells = [];
    let currentUser = null;
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Fetch dictionary data
    async function fetchDictionary() {
        try {
            const response = await fetch('path/to/your/wordlist.txt');
            const text = await response.text();
            dictionary = new Set(text.split('\n').map(word => word.trim().toUpperCase()));
        } catch (error) {
            console.error('Error fetching dictionary:', error);
        }
    }

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
                // Scoring with multiplier: 10 points per letter
                score += (10 + word.length - 3) * 1.5; // 1.5x multiplier
                scoreDisplay.textContent = `Score: ${Math.round(score)}`;
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
        timeLeft = timeLimit;
        timerDisplay.textContent = `Time Left: ${timeLeft}`;
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time Left: ${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert('Time is up!');
                saveHighScore();
                updateLeaderboard();
            }
        }, 1000);
    }

    // Save high score
    function saveHighScore() {
        if (currentUser) {
            const existingHighscore = highScores.find(score => score.username === currentUser);
            if (!existingHighscore || score > existingHighscore.score) {
                if (existingHighscore) {
                    existingHighscore.score = score;
                } else {
                    highScores.push({ username: currentUser, score });
                }
                localStorage.setItem('highScores', JSON.stringify(highScores));
                updateHighScoresList();
            }
        }
    }

    // Update high scores list
    function updateHighScoresList() {
        highscoresList.innerHTML = '';
        highScores.sort((a, b) => b.score - a.score).forEach(score => {
            const li = document.createElement('li');
            li.textContent = `${score.username}: ${score.score}`;
            highscoresList.appendChild(li);
        });
    }

    // Update leaderboard
    function updateLeaderboard() {
        const existingEntry = leaderboard.find(entry => entry.username === currentUser);
        if (!existingEntry || score > existingEntry.score) {
            if (existingEntry) {
                existingEntry.score = score;
            } else {
                leaderboard.push({ username: currentUser, score });
            }
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
            displayLeaderboard();
        }
    }

    // Display leaderboard
    function displayLeaderboard() {
        leaderboardList.innerHTML = '';
        leaderboard.sort((a, b) => b.score - a.score).forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.username}: ${entry.score}`;
            leaderboardList.appendChild(li);
        });
    }

    // Reset game
    function resetGame() {
        clearInterval(timer);
        timeLeft = timeLimit;
        timerDisplay.textContent = `Time Left: ${timeLeft}`;
        score = 0;
        wordsFound = new Set();
        scoreDisplay.textContent = `Score: ${score}`;
        wordListDisplay.textContent = 'Words Found: ';
        wordInput.value = '';
        selectedCells = [];
        createBoard();
        startTimer();
    }

    // Handle difficulty change
    function handleDifficultyChange() {
        const difficulty = difficultySelect.value;
        switch (difficulty) {
            case 'easy':
                boardSize = 4;
                timeLimit = 60;
                break;
            case 'medium':
                boardSize = 5;
                timeLimit = 90;
                break;
            case 'hard':
                boardSize = 6;
                timeLimit = 120;
                break;
        }
        resetGame();
    }

    // Handle theme change
    function handleThemeChange() {
        const theme = themeSwitch.value;
        document.body.className = theme;
        document.querySelectorAll('.boggle-cell').forEach(cell => {
            cell.className = `boggle-cell ${theme}`;
        });
    }

    // Handle hint
    function handleHint() {
        const hints = Array.from(dictionary).filter(word => word.length >= 3);
        const hint = hints[Math.floor(Math.random() * hints.length)];
        alert(`Try this word: ${hint}`);
    }

    // Handle login
    function handleLogin() {
        const username = usernameInput.value.trim();
        if (username) {
            currentUser = username;
            userNameDisplay.textContent = currentUser;
            profileUsernameDisplay.textContent = currentUser;
            const userHighscore = highScores.find(score => score.username === currentUser);
            profileHighscoreDisplay.textContent = userHighscore ? userHighscore.score : '0';
            authSection.style.display = 'none';
            userSection.style.display = 'block';
            profileSection.style.display = 'block';
            difficultySection.style.display = 'block';
            settingsSection.style.display = 'block';
            highscoresSection.style.display = 'block';
            leaderboardSection.style.display = 'block';
            resetGame();
        }
    }

    // Handle logout
    function handleLogout() {
        currentUser = null;
        authSection.style.display = 'block';
        userSection.style.display = 'none';
        profileSection.style.display = 'none';
        difficultySection.style.display = 'none';
        settingsSection.style.display = 'none';
        highscoresSection.style.display = 'none';
        leaderboardSection.style.display = 'none';
        clearInterval(timer);
        timerDisplay.textContent = 'Time Left: 0';
        scoreDisplay.textContent = 'Score: 0';
        wordListDisplay.textContent = 'Words Found: ';
        wordInput.value = '';
    }

    // Initialize
    fetchDictionary();
    difficultySelect.addEventListener('change', handleDifficultyChange);
    themeSwitch.addEventListener('change', handleThemeChange);
    loginButton.addEventListener('click', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    submitButton.addEventListener('click', handleWordSubmit);
    resetButton.addEventListener('click', resetGame);
    hintButton.addEventListener('click', handleHint);
});
