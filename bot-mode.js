/**
 * bot-mode.js
 * * จัดการการเล่นในโหมดเล่นกับบอท (Player vs AI)
 */

const botMode = (() => {
    let game; // ตัวแปรเก็บ object ของเกมที่สร้างจาก game-core
    let selectedPieceSize = null; // ขนาดหมากที่ผู้เล่นเลือก
    const player = 1; // ผู้เล่นคือ P1 เสมอ
    const bot = 2;    // บอทคือ P2 เสมอ

    // --- DOM Elements ---
    const gameBoardElement = document.getElementById('game-board');
    const pieceOptions = document.querySelectorAll('.piece-option');
    const pieceLabels = {
        small: document.querySelector('.piece-option[data-size="small"] + .piece-label'),
        medium: document.querySelector('.piece-option[data-size="medium"] + .piece-label'),
        large: document.querySelector('.piece-option[data-size="large"] + .piece-label'),
    };

    /**
     * เริ่มเกมโหมดเล่นกับบอท
     */
    const start = () => {
        game = createGame(); // สร้างเกมใหม่จาก Core
        selectedPieceSize = null;
        uiManager.hideGameOverOverlay();
        renderBoard();
        updatePieceSelector();
        updateTurnDisplay();
        setupEventListeners();
    };

    /**
     * ตั้งค่า Event Listener สำหรับการคลิก
     */
    const setupEventListeners = () => {
        // ล้าง event เก่าออกก่อนเพื่อป้องกันการทำงานซ้ำซ้อน
        gameBoardElement.removeEventListener('click', handleCellClick);
        gameBoardElement.addEventListener('click', handleCellClick);

        pieceOptions.forEach(option => {
            option.removeEventListener('click', handlePieceSelection);
            option.addEventListener('click', handlePieceSelection);
        });
    };
    
    /**
     * จัดการเมื่อผู้เล่นเลือกขนาดหมาก
     */
    const handlePieceSelection = (event) => {
        pieceOptions.forEach(opt => opt.classList.remove('selected'));
        const selectedOption = event.currentTarget;
        selectedOption.classList.add('selected');
        selectedPieceSize = selectedOption.dataset.size;
    };

    /**
     * จัดการเมื่อผู้เล่นคลิกที่ช่องบนกระดาน
     */
    const handleCellClick = (event) => {
        const cell = event.target.closest('.cell');
        if (!cell || game.getState().currentPlayer !== player || !selectedPieceSize) {
            if (!selectedPieceSize) showToast('กรุณาเลือกขนาดหมากของคุณ');
            return;
        }

        const cellIndex = parseInt(cell.dataset.index);
        const result = game.placePiece(cellIndex, selectedPieceSize);

        if (result.success) {
            renderBoard();
            updatePieceSelector();
            checkGameState();
        } else {
            showToast('ไม่สามารถวางหมากตรงนี้ได้!');
        }
    };
    
    /**
     * ทำให้บอทตัดสินใจและเดิน
     */
    const handleBotMove = () => {
        if (game.getState().isGameOver) return;

        // AI Logic: พยายามหาตาเดินที่ดีที่สุด (ตอนนี้เป็นแบบสุ่มอย่างง่าย)
        const { index, size } = findBestMove();
        
        if (index !== null) {
            game.placePiece(index, size);
            setTimeout(() => {
                renderBoard();
                checkGameState();
            }, 500); // หน่วงเวลาให้ดูเหมือนบอทกำลังคิด
        }
    };
    
    /**
     * AI สำหรับหาตาเดิน (Logic แบบง่าย)
     * 1. หาตาที่เดินแล้วชนะ
     * 2. หาทางกันไม่ให้ผู้เล่นชนะในตาถัดไป
     * 3. ถ้าไม่มี เดินแบบสุ่ม
     */
    const findBestMove = () => {
        const availableMoves = [];
        const botPieces = game.getState().pieces[bot];

        for (let i = 0; i < 9; i++) {
            for (const size of ['large', 'medium', 'small']) {
                if (botPieces[size] > 0) {
                     // สร้างเกมจำลองเพื่อทดสอบการเดิน
                    const tempGame = { ...game }; 
                    const isValid = tempGame.placePiece.toString().includes('isValidMove') ? 
                        game.getState().board[i].length === 0 || 
                        pieceSizes[size] > pieceSizes[game.getState().board[i][game.getState().board[i].length - 1].size] : true;

                    if(isValid) {
                        availableMoves.push({ index: i, size });
                    }
                }
            }
        }
        // ตอนนี้สุ่มไปก่อน
        if (availableMoves.length > 0) {
            return shuffleArray(availableMoves)[0];
        }
        return { index: null, size: null }; // ไม่มีตาเดินแล้ว
    };


    /**
     * ตรวจสอบสถานะของเกมหลังการเดินแต่ละครั้ง
     */
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
            drawWinningLine();
        } else {
            updateTurnDisplay();
            if (state.currentPlayer === bot) {
                setTimeout(handleBotMove, 1000); // หน่วงเวลาก่อนบอทเดิน
            }
        }
    };
    
    /**
     * แสดงผลกระดานเกมตามสถานะล่าสุด
     */
    const renderBoard = () => {
        const state = game.getState();
        gameBoardElement.innerHTML = ''; //ล้างกระดานเก่า
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

    /**
     * อัปเดต UI ส่วนเลือกหมากให้แสดงจำนวนที่เหลือของผู้เล่นปัจจุบัน
     */
    const updatePieceSelector = () => {
        const state = game.getState();
        // ซ่อน/แสดงตัวเลือกตามตาของผู้เล่น
        uiManager.elements.pieceSelector.style.visibility = state.currentPlayer === player ? 'visible' : 'hidden';
        
        if (state.currentPlayer === player) {
            const playerPieces = state.pieces[player];
            pieceLabels.small.textContent = `เล็ก (${playerPieces.small})`;
            pieceLabels.medium.textContent = `กลาง (${playerPieces.medium})`;
            pieceLabels.large.textContent = `ใหญ่ (${playerPieces.large})`;

            // ทำให้ตัวเลือกที่หมากหมดแล้วกดไม่ได้
            document.querySelector('.piece-option[data-size="small"]').style.opacity = playerPieces.small > 0 ? '1' : '0.5';
            document.querySelector('.piece-option[data-size="medium"]').style.opacity = playerPieces.medium > 0 ? '1' : '0.5';
            document.querySelector('.piece-option[data-size="large"]').style.opacity = playerPieces.large > 0 ? '1' : '0.5';
        }
    };

    /**
     * อัปเดตข้อความแสดงตาเดิน
     */
    const updateTurnDisplay = () => {
        const state = game.getState();
        if (state.isGameOver) {
            uiManager.elements.turnDisplay.textContent = '';
        } else {
            uiManager.elements.turnDisplay.textContent = state.currentPlayer === player ? 'ตาของคุณ' : 'ตของบอท...';
        }
    };

    /**
     * วาดเส้นเมื่อมีผู้ชนะ
     */
    const drawWinningLine = () => {
        // (ส่วนนี้ซับซ้อน สามารถเพิ่มเติมทีหลังได้)
    };


    return {
        start,
    };
})();
