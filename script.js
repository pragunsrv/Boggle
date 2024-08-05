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
    const profileAvgScoreDisplay = document.getElementById('profile-avgscore');
    const profileWordsFoundDisplay = document.getElementById('profile-wordsfound');
    const profileGamesPlayedDisplay = document.getElementById('profile-gamesplayed');
    const highscoresList = document.getElementById('highscores-list');
    const leaderboardList = document.getElementById('leaderboard-list');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendChatButton = document.getElementById('send-chat');
    const multiplayerSection = document.getElementById('multiplayer-section');
    const startMultiplayerButton = document.getElementById('start-multiplayer');
    const createLobbyButton = document.getElementById('create-lobby');
    const joinLobbyButton = document.getElementById('join-lobby');
    const lobbyList = document.getElementById('lobby-list');
    const multiplayerInfo = document.getElementById('multiplayer-info');
    const player1ScoreDisplay = document.getElementById('player1-score');
    const player2ScoreDisplay = document.getElementById('player2-score');
    const currentPlayerDisplay = document.getElementById('current-player');
    const bgColorInput = document.getElementById('bg-color');
    const fontColorInput = document.getElementById('font-color');
    const cellSizeInput = document.getElementById('cell-size');
    const themeSwitch = document.getElementById('theme-switch');
    const gameModesSection = document.getElementById('game-modes-section');
    const speedChallengeButton = document.getElementById('speed-challenge');
    const endlessModeButton = document.getElementById('endless-mode');
    const customChallengesButton = document.getElementById('custom-challenges');
    const arSection = document.getElementById('ar-section');
    const startARButton = document.getElementById('start-ar');
    const tutorialSection = document.getElementById('tutorial-section');
    const closeTutorialButton = document.getElementById('close-tutorial');

    let boardSize = 4;
    let timeLimit = 60;
    let selectedCells = [];
    let timeLeft;
    let timer;
    let score = 0;
    let wordsFound = new Set();
    let boardLetters = [];
    let dictionary = new Set();
    let currentUser;
    let userStats = {
        totalWordsFound: 0,
        gamesPlayed: 0,
        totalScore: 0
    };
    let multiplayer = false;
    let player1Score = 0;
    let player2Score = 0;
    let currentPlayer = 1;
    let playerQueue = [];
    let aiWords = [];
    let chatMessages = [];
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Fetch dictionary from a text file or online source
    function fetchDictionary() {
        fetch('dictionary.txt')
            .then(response => response.text())
            .then(text => {
                text.split('\n').forEach(word => dictionary.add(word.trim().toUpperCase()));
            });
    }

    // Generate random letters for the board
    function generateRandomLetters(size) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return Array.from({ length: size * size }, () => letters[Math.floor(Math.random() * letters.length)]);
    }

    // Create Boggle board
    function createBoard() {
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSizeInput.value}px)`;
        boardLetters = generateRandomLetters(boardSize);
        boardLetters.forEach((letter, index) => {
            const cell = document.createElement('div');
            cell.className = 'boggle-cell';
            cell.textContent = letter;
            cell.dataset.index = index;
            cell.style.width = `${cellSizeInput.value}px`;
            cell.style.height = `${cellSizeInput.value}px`;
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
                updateUserStats(word.length);
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

    // Update user stats
    function updateUserStats(wordLength) {
        userStats.totalWordsFound++;
        userStats.totalScore += (10 + wordLength - 3) * 1.5;
        userStats.gamesPlayed++;
        profileAvgScoreDisplay.textContent = (userStats.totalScore / userStats.gamesPlayed).toFixed(2);
        profileWordsFoundDisplay.textContent = userStats.totalWordsFound;
        profileGamesPlayedDisplay.textContent = userStats.gamesPlayed;
    }

    // Update multiplayer score
    function updateMultiplayerScore(wordLength) {
        if (multiplayer) {
            const points = (10 + wordLength - 3) * 1.5;
            if (currentPlayer === 1) {
                player1Score += points;
                player1ScoreDisplay.textContent = `Player 1 Score: ${Math.round(player1Score)}`;
            } else {
                player2Score += points;
                player2ScoreDisplay.textContent = `Player 2 Score: ${Math.round(player2Score)}`;
            }
            switchPlayer();
        }
    }

    // Switch player
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        currentPlayerDisplay.textContent = `Current Player: Player ${currentPlayer}`;
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
                } else {
                    aiPlay();
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
        aiWords = [];
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
        document.body.className = themeSwitch.value;
    }

    // Handle hint
    function handleHint() {
        const hintWords = Array.from(dictionary).filter(word => word.length >= 3 && word.length <= boardSize);
        if (hintWords.length > 0) {
            const hintWord = hintWords[Math.floor(Math.random() * hintWords.length)];
            alert(`Hint: Try the word "${hintWord}"`);
        } else {
            alert('No hints available.');
        }
    }

    // Handle login
    function handleLogin() {
        const username = usernameInput.value.trim();
        if (username) {
            currentUser = username;
            userNameDisplay.textContent = currentUser;
            profileUsernameDisplay.textContent = currentUser;
            authSection.style.display = 'none';
            userSection.style.display = 'block';
            profileSection.style.display = 'block';
            customizationSection.style.display = 'block';
            difficultySection.style.display = 'block';
            settingsSection.style.display = 'block';
            chatSection.style.display = 'block';
            multiplayerSection.style.display = 'block';
            gameModesSection.style.display = 'block';
            arSection.style.display = 'block';
            tutorialSection.style.display = 'block';
            loadUserStats();
            createBoard();
            startTimer();
        }
    }

    // Handle logout
    function handleLogout() {
        currentUser = null;
        authSection.style.display = 'block';
        userSection.style.display = 'none';
        profileSection.style.display = 'none';
        customizationSection.style.display = 'none';
        difficultySection.style.display = 'none';
        settingsSection.style.display = 'none';
        chatSection.style.display = 'none';
        multiplayerSection.style.display = 'none';
        gameModesSection.style.display = 'none';
        arSection.style.display = 'none';
        tutorialSection.style.display = 'none';
        resetGame();
    }

    // Load user stats
    function loadUserStats() {
        const savedStats = JSON.parse(localStorage.getItem('userStats')) || {};
        if (savedStats[currentUser]) {
            const stats = savedStats[currentUser];
            profileHighscoreDisplay.textContent = stats.highScore || 0;
            profileAvgScoreDisplay.textContent = stats.avgScore || 0;
            profileWordsFoundDisplay.textContent = stats.totalWordsFound || 0;
            profileGamesPlayedDisplay.textContent = stats.gamesPlayed || 0;
        }
    }

    // Save user stats
    function saveUserStats() {
        const savedStats = JSON.parse(localStorage.getItem('userStats')) || {};
        if (!savedStats[currentUser]) {
            savedStats[currentUser] = {
                highScore: 0,
                avgScore: 0,
                totalWordsFound: 0,
                gamesPlayed: 0
            };
        }
        const stats = savedStats[currentUser];
        stats.totalWordsFound += userStats.totalWordsFound;
        stats.gamesPlayed += userStats.gamesPlayed;
        stats.avgScore = (stats.avgScore * (stats.gamesPlayed - 1) + (score / userStats.gamesPlayed)) / stats.gamesPlayed;
        stats.highScore = Math.max(stats.highScore, score);
        localStorage.setItem('userStats', JSON.stringify(savedStats));
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

    // Handle multiplayer start
    function handleMultiplayerStart() {
        multiplayer = true;
        player1Score = 0;
        player2Score = 0;
        currentPlayer = 1;
        multiplayerInfo.style.display = 'flex';
        currentPlayerDisplay.textContent = `Current Player: Player ${currentPlayer}`;
        resetGame();
    }

    // Handle lobby creation
    function handleLobbyCreation() {
        // Example code for creating a lobby
        const lobbyName = prompt('Enter a name for the lobby:');
        if (lobbyName) {
            // Add lobby to the lobby list
            const li = document.createElement('li');
            li.textContent = lobbyName;
            lobbyList.appendChild(li);
        }
    }

    // Handle joining a lobby
    function handleLobbyJoin() {
        // Example code for joining a lobby
        const selectedLobby = prompt('Enter the name of the lobby to join:');
        if (selectedLobby) {
            // Join the selected lobby
            alert(`Joined lobby: ${selectedLobby}`);
        }
    }

    // AI opponent logic
    function aiPlay() {
        // Simulate AI finding words
        aiWords = Array.from(dictionary).filter(word => word.length >= 3 && word.length <= boardSize);
        if (aiWords.length > 0) {
            const aiScore = aiWords.reduce((total, word) => total + (10 + word.length - 3) * 1.5, 0);
            alert(`AI found ${aiWords.length} words and scored ${Math.round(aiScore)} points.`);
        } else {
            alert('AI could not find any words.');
        }
    }

    // AR mode
    function startAR() {
        // Example code for AR
        alert('AR Mode is not implemented. This is a placeholder.');
    }

    // Handle game mode selection
    function handleGameModeSelection(mode) {
        switch (mode) {
            case 'speed-challenge':
                boardSize = 4;
                timeLimit = 30;
                break;
            case 'endless-mode':
                boardSize = 5;
                timeLimit = Infinity;
                break;
            case 'custom-challenges':
                // Custom challenges implementation
                alert('Custom Challenges is a placeholder.');
                return;
        }
        resetGame();
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
    createLobbyButton.addEventListener('click', handleLobbyCreation);
    joinLobbyButton.addEventListener('click', handleLobbyJoin);
    startARButton.addEventListener('click', startAR);
    speedChallengeButton.addEventListener('click', () => handleGameModeSelection('speed-challenge'));
    endlessModeButton.addEventListener('click', () => handleGameModeSelection('endless-mode'));
    customChallengesButton.addEventListener('click', () => handleGameModeSelection('custom-challenges'));
    closeTutorialButton.addEventListener('click', () => tutorialSection.style.display = 'none');

    // Initial setup
    fetchDictionary();
    handleDifficultyChange();
    handleThemeChange();
    updateHighScoresList();
    displayLeaderboard();
});
