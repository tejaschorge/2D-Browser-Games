document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');

    let gridArray;
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;

    function createBoard() {
        gridArray = new Array(16).fill(0);
        gridArray.forEach((_, i) => {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            grid.appendChild(tile);
        });

        addNumber();
        addNumber();
        updateBestScore();
    }

    function updateBestScore() {
        bestScoreDisplay.innerText = `Best: ${bestScore}`;
    }

    function addNumber() {
        const freeTiles = gridArray.flatMap((value, index) => value === 0 ? index : []);
        if (freeTiles.length) {
            const randomTile = freeTiles[Math.floor(Math.random() * freeTiles.length)];
            gridArray[randomTile] = Math.random() < 0.9 ? 2 : 4;
            updateGrid();
        }
    }

    function updateGrid() {
        gridArray.forEach((tileValue, i) => {
            const tile = grid.children[i];
            tile.innerText = tileValue ? tileValue : '';
            tile.setAttribute('data-value', tileValue);
        });
        scoreDisplay.innerText = `Score: ${score}`;
    }

    function move(direction) {
        let moved = false;
        switch (direction) {
            case 'left':
                moved = moveLeft();
                break;
            case 'right':
                gridArray = reverse(gridArray);
                moved = moveLeft();
                gridArray = reverse(gridArray);
                if (moved) updateGrid();
                break;
            case 'up':
                gridArray = transpose(gridArray);
                moved = moveLeft();
                gridArray = transpose(gridArray);
                if (moved) updateGrid();
                break;
            case 'down':
                gridArray = transpose(gridArray);
                gridArray = reverse(gridArray);
                moved = moveLeft();
                gridArray = reverse(gridArray);
                gridArray = transpose(gridArray);
                if (moved) updateGrid();
                break;
        }
        if (moved) {
            addNumber();
            checkWin();
        }
        checkGameOver();
    }

    function moveLeft() {
        let moved = false;
        const newGrid = [...gridArray];
        
        for (let i = 0; i < 4; i++) {
            const start = i * 4;
            const row = newGrid.slice(start, start + 4);
            const originalRow = [...row];
            
            // Filter out zeros
            const filteredRow = row.filter(num => num);
            
            // Merge adjacent equal tiles
            const mergedRow = [];
            let j = 0;
            while (j < filteredRow.length) {
                if (j < filteredRow.length - 1 && filteredRow[j] === filteredRow[j + 1]) {
                    const mergedValue = filteredRow[j] * 2;
                    mergedRow.push(mergedValue);
                    score += mergedValue;
                    j += 2; // Skip next tile as it's merged
                } else {
                    mergedRow.push(filteredRow[j]);
                    j++;
                }
            }
            
            // Fill with zeros
            const newRow = [...mergedRow, ...Array(4 - mergedRow.length).fill(0)];
            
            // Check if row changed
            for (let k = 0; k < 4; k++) {
                if (originalRow[k] !== newRow[k]) {
                    moved = true;
                }
                newGrid[start + k] = newRow[k];
            }
        }
        
        if (moved) {
            gridArray = newGrid;
            bestScore = Math.max(score, bestScore);
            localStorage.setItem('bestScore', bestScore);
            updateBestScore();
            updateGrid();
        }
        
        return moved;
    }

    function reverse(arr) {
        return arr.reduce((acc, _, i) => acc.concat(arr.slice(i * 4, i * 4 + 4).reverse()), []);
    }

    function transpose(arr) {
        return arr.reduce((acc, _, i) => acc.concat([0, 1, 2, 3].map(x => arr[x * 4 + i])), []);
    }

    function checkWin() {
        if (gridArray.includes(2048)) {
            alert('Congratulations! You reached 2048!');
        }
    }

    function checkGameOver() {
        if (!gridArray.includes(0) && !canMove()) {
            alert('Game Over!');
        }
    }

    function canMove() {
        for (let i = 0; i < gridArray.length; i++) {
            const current = gridArray[i];
            if (i % 4 !== 3 && gridArray[i + 1] === current) return true;
            if (i < 12 && gridArray[i + 4] === current) return true;
        }
        return false;
    }

    // Modal functions
    function showModal(title, text, buttonText, callback) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalText = document.getElementById('modal-text');
        const modalBtn = document.getElementById('modal-btn');
        
        modalTitle.textContent = title;
        modalText.innerHTML = text;
        modalBtn.textContent = buttonText;
        modal.style.display = 'block';
        
        modalBtn.onclick = () => {
            modal.style.display = 'none';
            if (callback) callback();
        };
    }
    
    function resetGame() {
        gridArray = new Array(16).fill(0);
        score = 0;
        addNumber();
        addNumber();
        updateGrid();
    }
    
    function showInstructions() {
        const instructionsText = `
            <strong>How to Play:</strong><br><br>
            🎯 <strong>Goal:</strong> Reach the 2048 tile!<br><br>
            ⌨️ <strong>Controls:</strong><br>
            • Use arrow keys to move tiles<br>
            • On mobile: swipe in any direction<br><br>
            🎮 <strong>Rules:</strong><br>
            • When two tiles with the same number touch, they merge into one<br>
            • After each move, a new tile appears randomly<br>
            • Game ends when the grid is full and no moves are possible<br><br>
            💡 <strong>Tips:</strong><br>
            • Keep your highest tile in a corner<br>
            • Build in one direction<br>
            • Don't rush - think ahead!
        `;
        showModal('How to Play 2048', instructionsText, 'Got it!', null);
    }
    
    // Enhanced checkWin and checkGameOver with modals
    function checkWin() {
        if (gridArray.includes(2048)) {
            showModal(
                '🎉 Congratulations!', 
                `You reached 2048!<br>Final Score: ${score}<br><br>Keep playing to beat your high score!`, 
                'Continue Playing', 
                null
            );
        }
    }
    
    function checkGameOver() {
        if (!gridArray.includes(0) && !canMove()) {
            showModal(
                '💔 Game Over', 
                `No more moves possible!<br>Final Score: ${score}<br>Best Score: ${bestScore}`, 
                'New Game', 
                resetGame
            );
        }
    }
    
    // Touch support for mobile
    let startX, startY;
    
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }
    
    function handleTouchEnd(e) {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        const minSwipeDistance = 50;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    move('left');
                } else {
                    move('right');
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) {
                    move('up');
                } else {
                    move('down');
                }
            }
        }
        
        startX = null;
        startY = null;
    }
    
    // Event listeners
    document.addEventListener('keyup', event => {
        const keyPressed = event.key.replace('Arrow', '').toLowerCase();
        move(keyPressed);
    });
    
    // Touch events
    grid.addEventListener('touchstart', handleTouchStart, { passive: true });
    grid.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Button events
    document.getElementById('restart-btn').addEventListener('click', resetGame);
    document.getElementById('how-to-play-btn').addEventListener('click', showInstructions);
    
    // Modal close events
    document.getElementById('modal-close').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    createBoard();
});
