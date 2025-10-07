// ... (ส่วนบนของ bot-mode.js เหมือนเดิม) ...

const botMode = (() => {
    let game;
    let selectedPieceSize = null;
    const player = 1;
    const bot = 2;

    const gameBoardContainer = document.getElementById('game-board-container');
    const gameBoardElement = document.getElementById('game-board');
    // ... (DOM elements อื่นๆ เหมือนเดิม) ...

    const start = () => {
        game = createGame();
        selectedPieceSize = null;
        uiManager.hideGameOverOverlay();
        renderBoard();
        updatePieceSelector();
        updateTurnDisplay();
        setupEventListeners();
    };
    
    // เพิ่มฟังก์ชัน rematch
    const rematch = () => {
        start(); // เริ่มเกมใหม่ทั้งหมด
    };
    
    // ... (ส่วน Event Listeners และ handle moves เหมือนเดิม) ...

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
            // ... (เหมือนเดิม) ...
        }
    };
    
    // ... (ส่วน renderBoard, updatePieceSelector, updateTurnDisplay เหมือนเดิม) ...
    
    // เพิ่มฟังก์ชันวาดเส้น
    const drawWinningLine = (line) => {
        const container = document.getElementById('winning-line-container') || document.createElement('div');
        container.id = 'winning-line-container';
        container.innerHTML = ''; // Clear old line

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
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        lineElement.style.width = `${length}px`;
        lineElement.style.top = `${startY - (lineElement.offsetHeight / 2)}px`;
        lineElement.style.left = `${startX}px`;
        lineElement.style.transform = `rotate(${angle}deg)`;
        
        container.appendChild(lineElement);
        gameBoardContainer.appendChild(container);
    };

    return {
        start,
        rematch // ส่งออกฟังก์ชัน rematch
    };
})();
