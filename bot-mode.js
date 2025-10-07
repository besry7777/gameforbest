/**
 * bot-mode.js
 * * จัดการการเล่นในโหมดเล่นกับบอท (Player vs AI)
 */

const botMode = (() => {
    let game;
    let selectedPieceSize = null;
    const player = 1;
    const bot = 2;

    const gameBoardContainer = document.getElementById('game-board-container');
    const gameBoardElement = document.getElementById('game-board');
    const pieceOptions = document.querySelectorAll('.piece-option');
    const pieceLabels = {
        small: document.querySelector('.piece-option[data-size="small"] + .piece-label'),
        medium: document.querySelector('.piece-option[data-size="medium"] + .piece-label'),
        large: document.querySelector('.piece-option[data-size="large"] + .piece-label'),
    };

    const start = () => {
        game = createGame();
        selectedPieceSize = null;
        uiManager.hideGameOverOverlay();
        renderBoard();
        updatePieceSelector();
        updateTurnDisplay();
        setupEventListeners();
    };
    
    const rematch = () => {
        start();
    };

    const setupEventListeners = () => {
        gameBoardElement.removeEventListener('click', handleCellClick);
        gameBoardElement.addEventListener('click', handleCellClick);

        pieceOptions.forEach(option => {
            option.removeEventListener('click', handlePieceSelection);
            option.addEventListener('click', handlePieceSelection);
        });
    };
    
    const handlePieceSelection = (event) => {
        const selectedOption = event.currentTarget;
        if (selectedOption.classList.contains('disabled')) return;

        pieceOptions.forEach(opt => opt.classList.remove('selected'));
        selectedOption.classList.add('selected');
        selectedPieceSize = selectedOption.dataset.size;
    };

    const handleCellClick = (event) => {
        const cell = event.target.closest('.cell');
        if (!cell || game.getState().currentPlayer !== player) return;

        if (!selectedPieceSize) {
            showToast('กรุณาเลือกขนาดหมากของคุณ');
            return;
        }

        const cellIndex = parseInt(cell.dataset.index);
        const result = game.placePiece(cellIndex, selectedPieceSize);

        if (result.success) {
            selectedPieceSize = null;
            pieceOptions.forEach(opt => opt.classList.remove('selected'));
            renderBoard();
            updatePieceSelector();
            checkGameState();
        } else {
            showToast('ไม่สามารถวางหมากตรงนี้ได้!');
        }
    };
    
    const handleBotMove = () => {
        if (game.getState().isGameOver) return;

        const { index, size } = findBestMoveForBot();
        
        if (index !== null) {
            game.placePiece(index, size);
            renderBoard();
            checkGameState();
        }
    };
    
    const findBestMoveForBot = () => {
        const availableMoves = [];
        const botPieces = game.getState().pieces[bot];
        const board = game.getState().board;

        for (let i = 0; i < 9; i++) {
            for (const size of ['large', 'medium', 'small']) {
                if (botPieces[size] > 0) {
                    const cellPieces = board[i];
                    const topPiece = cellPieces.length > 0 ? cellPieces[cellPieces.length - 1] : null;
                    if (!topPiece || {small:0, medium:1, large:2}[size] > {small:0, medium:1, large:2}[topPiece.size]) {
                        availableMoves.push({ index: i, size });
                    }
                }
            }
        }
        
        if (availableMoves.length > 0) {
            return shuffleArray(availableMoves)[0];
        }
        return { index: null, size: null };
    };

    const checkGameState = () => {
        const state = game.getState();
        if (state.isGameOver) {
            let message = '';
            if (state.winner === 'draw') {
                message = 'เสมอ!';
            } else if (state.winner === player) {
                message = 'คุณชนะ!';
            } else {
                message = 'คุณแพ้!';
            }
            uiManager.showGameOverOverlay(message);
            
            const winInfo = state.checkWin();
            if (winInfo) {
                drawWinningLine(winInfo.line);
            }
        } else {
            updateTurnDisplay();
            if (state.currentPlayer === bot) {
                setTimeout(handleBotMove, 1200);
            }
        }
    };
    
    const renderBoard = () => {
        const state = game.getState();
        gameBoardElement.innerHTML = '';
        if (document.getElementById('winning-line-container')) {
            document.getElementById('winning-line-container').remove();
        }

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;

            const piecesInCell = state.board[i];
            piecesInCell.forEach(piece => {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece piece-p${piece.player} piece-${piece.size}`;
                cell.appendChild(pieceElement);
            });
            gameBoardElement.appendChild(cell);
        }
    };

    const updatePieceSelector = () => {
        const state = game.getState();
        uiManager.elements.pieceSelector.style.visibility = state.currentPlayer === player ? 'visible' : 'hidden';
        
        if (state.currentPlayer === player) {
            const playerPieces = state.pieces[player];
            pieceLabels.small.textContent = `เล็ก (${playerPieces.small})`;
            pieceLabels.medium.textContent = `กลาง (${playerPieces.medium})`;
            pieceLabels.large.textContent = `ใหญ่ (${playerPieces.large})`;

            Object.keys(playerPieces).forEach(size => {
                const optionEl = document.querySelector(`.piece-option[data-size="${size}"]`);
                if(playerPieces[size] > 0) {
                    optionEl.classList.remove('disabled');
                } else {
                    optionEl.classList.add('disabled');
                }
            });
        }
    };

    const updateTurnDisplay = () => {
        const state = game.getState();
        if (state.isGameOver) {
            uiManager.elements.turnDisplay.textContent = '';
        } else {
            uiManager.elements.turnDisplay.textContent = state.currentPlayer === player ? 'ตาของคุณ' : 'ตาของบอท...';
        }
    };

    const drawWinningLine = (line) => {
        const container = document.createElement('div');
        container.id = 'winning-line-container';

        const boardRect = gameBoardElement.getBoundingClientRect();
        const lineElement = document.createElement('div');
        lineElement.className = 'winning-line';

        const startCell = gameBoardElement.children[line[0]];
        const endCell = gameBoardElement.children[line[2]];

        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();
        
        const startX = startRect.left + startRect.width / 2 - boardRect.left;
        const startY = startRect.top + startRect.height / 2 - boardRect.top;
        const endX = endRect.left + endRect.width / 2 - boardRect.left;
        const endY = endRect.top + endRect.height / 2 - boardRect.top;

        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) + startRect.width * 0.6;

        lineElement.style.width = `${length}px`;
        lineElement.style.top = `${startY - 6}px`;
        lineElement.style.left = `${startX - (startRect.width * 0.3)}px`;
        lineElement.style.transform = `rotate(${angle}deg)`;
        
        container.appendChild(lineElement);
        gameBoardContainer.appendChild(container);
    };

    return {
        start,
        rematch
    };
})();
