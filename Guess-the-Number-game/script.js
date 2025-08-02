class GuessTheNumberGame {
    constructor() {
        this.targetNumber = 0;
        this.attempts = 0;
        this.gameHistory = [];
        this.currentDifficulty = 'easy';
        this.difficulties = {
            easy: { min: 1, max: 50 },
            medium: { min: 1, max: 100 },
            hard: { min: 1, max: 200 }
        };
        this.stats = {
            bestScore: parseInt(localStorage.getItem('bestScore')) || null,
            gamesWon: parseInt(localStorage.getItem('gamesWon')) || 0
        };

        this.initializeElements();
        this.attachEventListeners();
        this.updateStats();
        this.startNewGame();
    }

    initializeElements() {
        this.guessInput = document.getElementById('guessInput');
        this.guessBtn = document.getElementById('guessBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.message = document.getElementById('message');
        this.attemptsCount = document.getElementById('attemptsCount');
        this.bestScore = document.getElementById('bestScore');
        this.gamesWon = document.getElementById('gamesWon');
        this.attemptsList = document.getElementById('attemptsList');
        this.attemptsContainer = document.getElementById('attemptsContainer');
        this.rangeDisplay = document.getElementById('rangeDisplay');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
    }

    attachEventListeners() {
        this.guessBtn.addEventListener('click', () => this.makeGuess());
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });
        this.guessInput.addEventListener('input', () => this.validateInput());

        this.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => this.changeDifficulty(btn.dataset.difficulty));
        });
    }

    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.difficultyButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');

        const range = this.difficulties[difficulty];
        this.rangeDisplay.textContent = `${range.min} and ${range.max}`;
        this.guessInput.setAttribute('min', range.min);
        this.guessInput.setAttribute('max', range.max);

        this.startNewGame();
    }

    validateInput() {
        const range = this.difficulties[this.currentDifficulty];
        const value = parseInt(this.guessInput.value);

        if (value < range.min || value > range.max) {
            this.guessInput.style.borderColor = '#dc3545';
        } else {
            this.guessInput.style.borderColor = '#28a745';
        }
    }

    startNewGame() {
        const range = this.difficulties[this.currentDifficulty];
        this.targetNumber = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        this.attempts = 0;
        this.gameHistory = [];

        this.updateDisplay();
        this.showMessage('Make your first guess!', 'info');
        this.guessInput.value = '';
        this.guessInput.focus();
        this.attemptsList.style.display = 'none';
        this.guessBtn.disabled = false;
        this.guessInput.disabled = false;

        console.log(`New game started! Target number: ${this.targetNumber}`); // For debugging
    }

    makeGuess() {
        const guess = parseInt(this.guessInput.value);
        const range = this.difficulties[this.currentDifficulty];

        if (isNaN(guess) || guess < range.min || guess > range.max) {
            this.showMessage(`Please enter a number between ${range.min} and ${range.max}!`, 'error');
            return;
        }

        this.attempts++;
        this.gameHistory.push({
            guess: guess,
            result: this.getHint(guess)
        });

        this.updateDisplay();
        this.updateAttemptsList();

        if (guess === this.targetNumber) {
            this.handleWin();
        } else {
            this.showMessage(this.getHint(guess), 'warning');
            this.guessInput.value = '';
            this.guessInput.focus();
        }
    }

    getHint(guess) {
        const difference = Math.abs(guess - this.targetNumber);

        if (guess === this.targetNumber) {
            return `🎉 Congratulations! You got it in ${this.attempts} attempts!`;
        } else if (difference <= 5) {
            return guess < this.targetNumber ?
                '🔥 Very close! Try a bit higher!' :
                '🔥 Very close! Try a bit lower!';
        } else if (difference <= 10) {
            return guess < this.targetNumber ?
                '📈 Close! Go higher!' :
                '📉 Close! Go lower!';
        } else {
            return guess < this.targetNumber ?
                '⬆️ Too low! Try higher!' :
                '⬇️ Too high! Try lower!';
        }
    }

    handleWin() {
        this.showMessage(`🎉 Congratulations! You got it in ${this.attempts} attempts!`, 'success');
        this.stats.gamesWon++;

        if (!this.stats.bestScore || this.attempts < this.stats.bestScore) {
            this.stats.bestScore = this.attempts;
            this.showMessage(`🏆 New best score: ${this.attempts} attempts!`, 'success');
        }

        this.saveStats();
        this.updateStats();
        this.guessBtn.disabled = true;
        this.guessInput.disabled = true;

        // Add celebration animation
        document.querySelector('.game-container').classList.add('celebration');
        setTimeout(() => {
            document.querySelector('.game-container').classList.remove('celebration');
        }, 600);
    }

    updateDisplay() {
        this.attemptsCount.textContent = this.attempts;
    }

    updateStats() {
        this.bestScore.textContent = this.stats.bestScore || '-';
        this.gamesWon.textContent = this.stats.gamesWon;
    }

    updateAttemptsList() {
        if (this.gameHistory.length > 0) {
            this.attemptsList.style.display = 'block';
            this.attemptsContainer.innerHTML = '';

            this.gameHistory.forEach((attempt, index) => {
                const attemptDiv = document.createElement('div');
                attemptDiv.className = 'attempt-item';
                attemptDiv.innerHTML = `
                            <span>Attempt ${index + 1}: ${attempt.guess}</span>
                            <span>${attempt.guess === this.targetNumber ? '✅' : attempt.guess < this.targetNumber ? '⬆️' : '⬇️'}</span>
                        `;
                this.attemptsContainer.appendChild(attemptDiv);
            });
        }
    }

    showMessage(text, type) {
        this.message.textContent = text;
        this.message.className = `message ${type}`;
    }

    saveStats() {
        localStorage.setItem('bestScore', this.stats.bestScore);
        localStorage.setItem('gamesWon', this.stats.gamesWon);
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all your game history? This will reset your best score and games won count.')) {
            this.stats.bestScore = null;
            this.stats.gamesWon = 0;
            localStorage.removeItem('bestScore');
            localStorage.removeItem('gamesWon');
            this.updateStats();
            this.showMessage('Game history cleared successfully!', 'info');
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GuessTheNumberGame();
});