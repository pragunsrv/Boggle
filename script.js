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
    const chatSection = document.getElementById('chat-section');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendChatButton = document.getElementById('send-chat');
    const multiplayerSection = document.getElementById('multiplayer-section');
    const startMultiplayerButton = document.getElementById('start-multiplayer');
    
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
    let multiplayer = false;
    let player1Score = 0;
    let player2Score = 0;
    let currentPlayer = 1;
    let chatMessages = [];

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
    function generateRandomLetters(size) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return Array.from({ length: size * size }, () => letters[Math.floor(Math.random() * letters.length)]);
    }

    // Create Boggle board
    function createBoard() {
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;
        boardLetters = generateRandomLetters(boardSize);
        boardLetters.forEach((letter, index) => {
            const cell = document.createElement('div');
            cell.className = 'boggle-cell';
            cell.textContent = letter;
            cell.dataset.index = index;
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        });
    }

    // Check if the word is valid
    function checkWord(word) {
        return dictionary.has(word.toUpperCase());
    }

    // Highlight selected cells
    function highlightCells(cells, clear = false) {
        document.querySelectorAll('.boggle-cell').forEach(cell => {
            cell.classList.remove('highlight');
        });
        if (!clear) {
            cells.forEach(index => {
                document.querySelector(`.boggle-cell[data-index='${index}']`).classList.add('highlight');
            });
        }
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
                updateMultiplayerScore(word.length);
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

    // Update multiplayer score
    function updateMultiplayerScore(wordLength) {
        if (multiplayer) {
            const points = (10 + wordLength - 3) * 1.5;
            if (currentPlayer === 1) {
                player1Score += points;
                document.getElementById('player1-score').textContent = `Player 1 Score: ${Math.round(player1Score)}`;
            } else {
                player2Score += points;
                document.getElementById('player2-score').textContent = `Player 2 Score: ${Math.round(player2Score)}`;
            }
            switchPlayer();
        }
    }

    // Switch player
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        document.getElementById('current-player').textContent = `Current Player: Player ${currentPlayer}`;
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
                if (multiplayer) {
                    determineWinner();
                }
            }
        }, 1000);
    }

    // Determine multiplayer winner
    function determineWinner() {
        let winner;
        if (player1Score > player2Score) {
            winner = 'Player 1';
        } else if (player2Score > player1Score) {
            winner = 'Player 2';
        } else {
            winner = 'It\'s a tie!';
        }
        alert(`Game Over! Winner: ${winner}`);
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
            multiplayerSection.style.display = 'block';
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
        multiplayerSection.style.display = 'none';
        chatSection.style.display = 'none';
        clearInterval(timer);
        timerDisplay.textContent = 'Time Left: 0';
        scoreDisplay.textContent = 'Score: 0';
        wordListDisplay.textContent = 'Words Found: ';
        wordInput.value = '';
    }

    // Handle multiplayer start
    function handleMultiplayerStart() {
        multiplayer = true;
        player1Score = 0;
        player2Score = 0;
        currentPlayer = 1;
        const multiplayerInfo = document.createElement('div');
        multiplayerInfo.innerHTML = `
            <div id="player1-score">Player 1 Score: 0</div>
            <div id="player2-score">Player 2 Score: 0</div>
            <div id="current-player">Current Player: Player 1</div>
        `;
        document.body.insertBefore(multiplayerInfo, board);
        chatSection.style.display = 'block';
        resetGame();
    }

    // Handle chat message
    function handleChatMessage() {
        const message = chatInput.value.trim();
        if (message) {
            chatMessages.push({ username: currentUser, message });
            updateChatWindow();
            chatInput.value = '';
        }
    }

    // Update chat window
    function updateChatWindow() {
        chatWindow.innerHTML = '';
        chatMessages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.textContent = `${msg.username}: ${msg.message}`;
            chatWindow.appendChild(msgDiv);
        });
    }

    // Event listeners
    submitButton.addEventListener('click', handleWordSubmit);
    resetButton.addEventListener('click', resetGame);
    hintButton.addEventListener('click', handleHint);
    difficultySelect.addEventListener('change', handleDifficultyChange);
    themeSwitch.addEventListener('change', handleThemeChange);
    loginButton.addEventListener('click', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    sendChatButton.addEventListener('click', handleChatMessage);
    startMultiplayerButton.addEventListener('click', handleMultiplayerStart);

    // Initial setup
    fetchDictionary();
    handleDifficultyChange();
    handleThemeChange();
    updateHighScoresList();
    displayLeaderboard();
});
