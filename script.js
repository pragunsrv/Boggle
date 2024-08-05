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
    const profileAchievementsDisplay = document.getElementById('profile-achievements');
    const highscoresList = document.getElementById('highscores-list');
    const leaderboardList = document.getElementById('leaderboard-list');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendChatButton = document.getElementById('send-chat');
    const startMultiplayerButton = document.getElementById('start-multiplayer');
    const createLobbyButton = document.getElementById('create-lobby');
    const joinLobbyButton = document.getElementById('join-lobby');
    const lobbyList = document.getElementById('lobby-list');
    const aiHintButton = document.getElementById('get-ai-hint');
    const createCustomBoardButton = document.getElementById('create-custom-board');
    const shareCustomChallengesButton = document.getElementById('share-custom-challenges');
    const multiplayerInfo = document.getElementById('multiplayer-info');
    const currentPlayerDisplay = document.getElementById('current-player');
    const startARButton = document.getElementById('start-ar');
    const arSection = document.getElementById('ar-section');
    const tutorialSection = document.getElementById('tutorial-section');
    const closeTutorialButton = document.getElementById('close-tutorial');
    const boardLayoutSelect = document.getElementById('board-layout');

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
        totalScore: 0,
        achievements: []
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

    function fetchDictionary() {
        fetch('dictionary.txt')
            .then(response => response.text())
            .then(text => {
                text.split('\n').forEach(word => dictionary.add(word.trim().toUpperCase()));
            });
    }

    function generateRandomLetters(size) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return Array.from({ length: size * size }, () => letters[Math.floor(Math.random() * letters.length)]);
    }

    function createBoard() {
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSizeInput.value}px)`;
        boardLetters = generateRandomLetters(boardSize);
        boardLetters.forEach((letter, index) => {
            const cell = document.createElement('div');
            cell.className = `boggle-cell ${boardLayoutSelect.value}-board`;
            cell.textContent = letter;
            cell.dataset.index = index;
            cell.style.width = `${cellSizeInput.value}px`;
            cell.style.height = `${cellSizeInput.value}px`;
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        });
    }

    function checkWord(word) {
        return dictionary.has(word.toUpperCase());
    }

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

    function handleCellClick(event) {
        const cell = event.target;
        const index = parseInt(cell.dataset.index);
        if (!selectedCells.includes(index)) {
            selectedCells.push(index);
            wordInput.value += boardLetters[index];
            highlightCells(selectedCells);
        }
    }

    function handleWordSubmit() {
        const word = wordInput.value;
        if (word.length >= 3 && checkWord(word)) {
            if (!wordsFound.has(word)) {
                wordsFound.add(word);
                score += (10 + word.length - 3) * 1.5;
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

    function updateUserStats(wordLength) {
        userStats.totalWordsFound++;
        userStats.totalScore += (10 + wordLength - 3) * 1.5;
        userStats.gamesPlayed++;
        profileAvgScoreDisplay.textContent = (userStats.totalScore / userStats.gamesPlayed).toFixed(2);
        profileWordsFoundDisplay.textContent = userStats.totalWordsFound;
        profileGamesPlayedDisplay.textContent = userStats.gamesPlayed;
        saveUserStats();
        checkAchievements();
    }

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

    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        currentPlayerDisplay.textContent = `Current Player: Player ${currentPlayer}`;
    }

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

    function updateHighScoresList() {
        highscoresList.innerHTML = '';
        highScores.sort((a, b) => b.score - a.score).forEach(score => {
            const li = document.createElement('li');
            li.textContent = `${score.username}: ${score.score}`;
            highscoresList.appendChild(li);
        });
    }

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

    function displayLeaderboard() {
        leaderboardList.innerHTML = '';
        leaderboard.sort((a, b) => b.score - a.score).forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.username}: ${entry.score}`;
            leaderboardList.appendChild(li);
        });
    }

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

    function handleThemeChange() {
        document.body.className = themeSwitch.value;
    }

    function handleHint() {
        const hintWords = Array.from(dictionary).filter(word => word.length >= 3 && word.length <= boardSize);
        if (hintWords.length > 0) {
            const hintWord = hintWords[Math.floor(Math.random() * hintWords.length)];
            alert(`Hint: Try the word "${hintWord}"`);
        } else {
            alert('No hints available.');
        }
    }

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
            aiSection.style.display = 'block';
            ugcSection.style.display = 'block';
            loadUserStats();
            createBoard();
            startTimer();
        }
    }

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
        aiSection.style.display = 'none';
        ugcSection.style.display = 'none';
        resetGame();
    }

    function loadUserStats() {
        const savedStats = JSON.parse(localStorage.getItem('userStats')) || {};
        if (savedStats[currentUser]) {
            const stats = savedStats[currentUser];
            profileHighscoreDisplay.textContent = stats.highScore || 0;
            profileAvgScoreDisplay.textContent = stats.avgScore || 0;
            profileWordsFoundDisplay.textContent = stats.totalWordsFound || 0;
            profileGamesPlayedDisplay.textContent = stats.gamesPlayed || 0;
            profileAchievementsDisplay.textContent = stats.achievements.join(', ') || 'None';
        }
    }

    function saveUserStats() {
        const savedStats = JSON.parse(localStorage.getItem('userStats')) || {};
        if (!savedStats[currentUser]) {
            savedStats[currentUser] = {
                highScore: 0,
                avgScore: 0,
                totalWordsFound: 0,
                gamesPlayed: 0,
                achievements: []
            };
        }
        const stats = savedStats[currentUser];
        stats.totalWordsFound += userStats.totalWordsFound;
        stats.gamesPlayed += userStats.gamesPlayed;
        stats.avgScore = (stats.avgScore * (stats.gamesPlayed - 1) + (score / userStats.gamesPlayed)) / stats.gamesPlayed;
        stats.highScore = Math.max(stats.highScore, score);
        stats.achievements = [...new Set([...stats.achievements, ...userStats.achievements])];
        localStorage.setItem('userStats', JSON.stringify(savedStats));
    }

    function checkAchievements() {
        // Example achievement checks
        if (userStats.totalWordsFound > 50 && !userStats.achievements.includes('Word Master')) {
            userStats.achievements.push('Word Master');
        }
        if (score > 1000 && !userStats.achievements.includes('High Scorer')) {
            userStats.achievements.push('High Scorer');
        }
        saveUserStats();
    }

    function handleChatMessage() {
        const message = chatInput.value.trim();
        if (message) {
            chatMessages.push({ username: currentUser, message });
            updateChatWindow();
            chatInput.value = '';
        }
    }

    function updateChatWindow() {
        chatWindow.innerHTML = '';
        chatMessages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.textContent = `${msg.username}: ${msg.message}`;
            chatWindow.appendChild(msgDiv);
        });
    }

    function handleMultiplayerStart() {
        multiplayer = true;
        player1Score = 0;
        player2Score = 0;
        currentPlayer = 1;
        multiplayerInfo.style.display = 'flex';
        currentPlayerDisplay.textContent = `Current Player: Player ${currentPlayer}`;
        resetGame();
    }

    function handleLobbyCreation() {
        const lobbyName = prompt('Enter a name for the lobby:');
        if (lobbyName) {
            const li = document.createElement('li');
            li.textContent = lobbyName;
            lobbyList.appendChild(li);
        }
    }

    function handleLobbyJoin() {
        const selectedLobby = prompt('Enter the name of the lobby to join:');
        if (selectedLobby) {
            alert(`Joined lobby: ${selectedLobby}`);
        }
    }

    function aiPlay() {
        aiWords = Array.from(dictionary).filter(word => word.length >= 3 && word.length <= boardSize);
        if (aiWords.length > 0) {
            const aiScore = aiWords.reduce((total, word) => total + (10 + word.length - 3) * 1.5, 0);
            alert(`AI found ${aiWords.length} words and scored ${Math.round(aiScore)} points.`);
        } else {
            alert('AI could not find any words.');
        }
    }

    function startAR() {
        alert('AR Mode is not implemented. This is a placeholder.');
    }

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
                alert('Custom Challenges is a placeholder.');
                return;
        }
        resetGame();
    }

    function handleUserContentCreation() {
        // Placeholder for creating custom boards and challenges
        alert('User-Generated Content is a placeholder.');
    }

    function handleAIHint() {
        if (aiWords.length > 0) {
            const hintWord = aiWords[Math.floor(Math.random() * aiWords.length)];
            alert(`AI Hint: Try the word "${hintWord}"`);
        } else {
            alert('AI could not generate a hint.');
        }
    }

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
    aiHintButton.addEventListener('click', handleAIHint);
    createCustomBoardButton.addEventListener('click', handleUserContentCreation);
    shareCustomChallengesButton.addEventListener('click', handleUserContentCreation);
    speedChallengeButton.addEventListener('click', () => handleGameModeSelection('speed-challenge'));
    endlessModeButton.addEventListener('click', () => handleGameModeSelection('endless-mode'));
    customChallengesButton.addEventListener('click', () => handleGameModeSelection('custom-challenges'));
    closeTutorialButton.addEventListener('click', () => tutorialSection.style.display = 'none');

    fetchDictionary();
    handleDifficultyChange();
    handleThemeChange();
    updateHighScoresList();
    displayLeaderboard();
});
