class Game2048 {
    constructor() {
        this.grid = document.getElementById('grid');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        
        this.gridArray = new Array(16).fill(0);
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.addEventListeners();
    }
    
    createBoard() {
        this.grid.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('data-value', '0');
            this.grid.appendChild(tile);
        }
    }
    
    addRandomTile() {
        const emptyCells = this.gridArray
            .map((val, index) => val === 0 ? index : null)
            .filter(val => val !== null);
            
        if (emptyCells.length > 0) {
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.gridArray[randomIndex] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    updateDisplay() {
        this.gridArray.forEach((value, index) => {
            const tile = this.grid.children[index];
            tile.textContent = value === 0 ? '' : value;
            tile.setAttribute('data-value', value);
        });
        
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        this.bestScoreDisplay.textContent = `Best: ${this.bestScore}`;
    }
    
    move(direction) {
        let moved = false;
        const previousGrid = [...this.gridArray];
        
        switch (direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            this.updateBestScore();
            
            if (this.hasWon()) {
                setTimeout(() => this.showWinMessage(), 300);
            } else if (this.isGameOver()) {
                setTimeout(() => this.showGameOverMessage(), 300);
            }
        }
    }
    
    moveLeft() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const rowData = this.getRow(row);
            const newRow = this.processRow(rowData);
            if (this.setRow(row, newRow)) moved = true;
        }
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const rowData = this.getRow(row).reverse();
            const newRow = this.processRow(rowData).reverse();
            if (this.setRow(row, newRow)) moved = true;
        }
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const colData = this.getColumn(col);
            const newCol = this.processRow(colData);
            if (this.setColumn(col, newCol)) moved = true;
        }
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const colData = this.getColumn(col).reverse();
            const newCol = this.processRow(colData).reverse();
            if (this.setColumn(col, newCol)) moved = true;
        }
        return moved;
    }
    
    getRow(rowIndex) {
        return this.gridArray.slice(rowIndex * 4, rowIndex * 4 + 4);
    }
    
    getColumn(colIndex) {
        return [0, 1, 2, 3].map(row => this.gridArray[row * 4 + colIndex]);
    }
    
    setRow(rowIndex, newRow) {
        let changed = false;
        for (let i = 0; i < 4; i++) {
            const index = rowIndex * 4 + i;
            if (this.gridArray[index] !== newRow[i]) {
                changed = true;
            }
            this.gridArray[index] = newRow[i];
        }
        return changed;
    }
    
    setColumn(colIndex, newCol) {
        let changed = false;
        for (let i = 0; i < 4; i++) {
            const index = i * 4 + colIndex;
            if (this.gridArray[index] !== newCol[i]) {
                changed = true;
            }
            this.gridArray[index] = newCol[i];
        }
        return changed;
    }
    
    processRow(row) {
        // Remove zeros
        let newRow = row.filter(val => val !== 0);
        
        // Merge adjacent equal values
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                this.score += newRow[i];
                newRow.splice(i + 1, 1);
            }
        }
        
        // Fill with zeros
        while (newRow.length < 4) {
            newRow.push(0);
        }
        
        return newRow;
    }
    
    hasWon() {
        return this.gridArray.includes(2048);
    }
    
    isGameOver() {
        // Check for empty cells
        if (this.gridArray.includes(0)) return false;
        
        // Check for possible merges
        for (let i = 0; i < 16; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const current = this.gridArray[i];
            
            // Check right neighbor
            if (col < 3 && this.gridArray[i + 1] === current) return false;
            
            // Check bottom neighbor
            if (row < 3 && this.gridArray[i + 4] === current) return false;
        }
        
        return true;
    }
    
    updateBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }
    }
    
    restart() {
        this.gridArray = new Array(16).fill(0);
        this.score = 0;
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }
    
    showWinMessage() {
        alert(`🎉 Congratulations! You reached 2048!\nScore: ${this.score}`);
    }
    
    showGameOverMessage() {
        alert(`💔 Game Over!\nFinal Score: ${this.score}\nBest Score: ${this.bestScore}`);
    }
    
    showInstructions() {
        alert(`🎮 How to Play 2048:

🎯 Goal: Reach the 2048 tile!

⌨️ Controls:
• Use arrow keys to move tiles
• On mobile: swipe in any direction

🎮 Rules:
• When two tiles with the same number touch, they merge
• After each move, a new tile appears randomly
• Game ends when no moves are possible

💡 Tips:
• Keep your highest tile in a corner
• Build in one direction
• Think ahead before moving!`);
    }
    
    addEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
            }
        });
        
        // Button events
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('how-to-play-btn').addEventListener('click', () => {
            this.showInstructions();
        });
        
        // Touch events for mobile
        let startX, startY;
        
        this.grid.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        this.grid.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            const minSwipeDistance = 50;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > minSwipeDistance) {
                    if (diffX > 0) {
                        this.move('left');
                    } else {
                        this.move('right');
                    }
                }
            } else {
                if (Math.abs(diffY) > minSwipeDistance) {
                    if (diffY > 0) {
                        this.move('up');
                    } else {
                        this.move('down');
                    }
                }
            }
            
            startX = null;
            startY = null;
        }, { passive: true });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    try {
        const game = new Game2048();
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});
