/**
 * coop-mode.js
 * * จัดการการเล่นในโหมดออนไลน์ (Player vs Player) โดยใช้ Firebase
 */

const coopMode = (() => {
    let game;
    let localPlayerId = null;
    let playerNum = null; // 1 or 2
    let currentRoomId = null;
    let roomUnsubscribe = null; // Function to stop listening to room updates

    // --- DOM Elements ---
    const gameBoardElement = document.getElementById('game-board');
    const pieceOptions = document.querySelectorAll('.piece-option');
    const pieceLabels = {
        small: document.querySelector('.piece-option[data-size="small"] + .piece-label'),
        medium: document.querySelector('.piece-option[data-size="medium"] + .piece-label'),
        large: document.querySelector('.piece-option[data-size="large"] + .piece-label'),
    };
    let selectedPieceSize = null;

    const init = (uid) => {
        localPlayerId = uid;
    };

    const createRoom = async () => {
        const roomId = generateRandomId(4);
        const newGame = createGame();
        const initialGameState = newGame.getState();

        try {
            await db.collection('rooms').doc(roomId).set({
                players: { [localPlayerId]: { playerNum: 1, name: localStorage.getItem('username'), ready: false } },
                gameState: initialGameState,
                status: 'waiting', // waiting, playing, finished
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await joinRoom(roomId);
        } catch (error) {
            console.error("Error creating room: ", error);
            showToast('สร้างห้องไม่สำเร็จ');
        }
    };

    const joinRoom = async (roomId) => {
        roomId = roomId.toUpperCase();
        const roomRef = db.collection('rooms').doc(roomId);

        try {
            const doc = await roomRef.get();
            if (!doc.exists) {
                showToast('ไม่พบห้องนี้');
                return;
            }

            const roomData = doc.data();
            const players = roomData.players || {};
            if (Object.keys(players).length >= 2 && !players[localPlayerId]) {
                showToast('ห้องเต็มแล้ว');
                return;
            }

            if (!players[localPlayerId]) {
                await roomRef.update({
                    [`players.${localPlayerId}`]: { playerNum: 2, name: localStorage.getItem('username'), ready: false }
                });
            }
            
            currentRoomId = roomId;
            listenToRoomUpdates(roomId);
            uiManager.showScreen('roomLobby');

        } catch (error) {
            console.error("Error joining room: ", error);
            showToast('เข้าร่วมห้องไม่สำเร็จ');
        }
    };
    
    const listenToRoomUpdates = (roomId) => {
        if (roomUnsubscribe) roomUnsubscribe(); // Stop listening to old room
        
        roomUnsubscribe = db.collection('rooms').doc(roomId).onSnapshot(doc => {
            if (!doc.exists) {
                leaveRoom();
                showToast("ห้องถูกปิดแล้ว");
                return;
            }
            const roomData = doc.data();
            const players = roomData.players;
            
            playerNum = players[localPlayerId]?.playerNum;
            game = roomData.gameState; // Sync local game state with Firestore

            // Update UI based on game status
            if (roomData.status === 'waiting') {
                updateLobbyUI(roomData);
            } else if (roomData.status === 'playing') {
                if (document.getElementById('game-screen').classList.contains('active')) {
                     updateGameUI();
                } else {
                    uiManager.showScreen('game');
                    setupGameEventListeners();
                    updateGameUI();
                }
            } else if (roomData.status === 'finished') {
                updateGameUI();
                uiManager.showGameOverOverlay(game.winner === 'draw' ? 'เสมอ!' : `ผู้เล่น ${game.winner} ชนะ!`);
            }
        }, error => {
            console.error("Error listening to room:", error);
            showToast("ขาดการเชื่อมต่อกับห้อง");
            leaveRoom();
        });
    };

    const updateLobbyUI = (roomData) => {
        uiManager.elements.roomCodeDisplay.textContent = currentRoomId;
        const playerList = uiManager.elements.playerList;
        playerList.innerHTML = '';
        for(const pid in roomData.players) {
            const p = roomData.players[pid];
            const playerDiv = document.createElement('div');
            playerDiv.textContent = `ผู้เล่น ${p.playerNum}: ${p.name} ${p.ready ? '✅' : '...'}`;
            playerList.appendChild(playerDiv);
        }
    };
    
    const setReady = async () => {
        const roomRef = db.collection('rooms').doc(currentRoomId);
        const playerReadyStatus = `players.${localPlayerId}.ready`;
        
        // Get current status to toggle
        const doc = await roomRef.get();
        const currentStatus = doc.data().players[localPlayerId].ready;

        await roomRef.update({ [playerReadyStatus]: !currentStatus });

        // Check if all players are ready to start the game
        const updatedDoc = await roomRef.get();
        const players = updatedDoc.data().players;
        if (Object.keys(players).length === 2 && Object.values(players).every(p => p.ready)) {
            await roomRef.update({ status: 'playing' });
        }
    };

    const leaveRoom = () => {
        if (roomUnsubscribe) roomUnsubscribe();
        roomUnsubscribe = null;
        currentRoomId = null;
        playerNum = null;
        uiManager.showScreen('mainMenu');
        // Logic to remove player from Firestore can be added here
    };
    
    const handlePlayerMove = async (index, size) => {
        if(game.currentPlayer !== playerNum || game.isGameOver) return;
        
        // Create a temporary game instance to validate move locally first
        const tempGame = createGame();
        Object.assign(tempGame.getState(), JSON.parse(JSON.stringify(game))); // Deep copy state

        const result = tempGame.placePiece(index, size);

        if(result.success) {
            const newState = tempGame.getState();
            await db.collection('rooms').doc(currentRoomId).update({ gameState: newState });
        } else {
            showToast("ไม่สามารถเดินตานี้ได้");
        }
    };
    
    const updateGameUI = () => {
        renderBoard();
        updateTurnDisplay();
        updatePieceSelector();
    };

    // UI functions (renderBoard, updateTurnDisplay, etc.) are very similar to bot-mode
    // but they always read from the `game` variable which is synced from Firestore.
    const renderBoard = () => {
        gameBoardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            const piecesInCell = game.board[i];
            piecesInCell.forEach(p => {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece piece-p${p.player} piece-${p.size}`;
                cell.appendChild(pieceEl);
            });
            gameBoardElement.appendChild(cell);
        }
    };
    
    const updateTurnDisplay = () => {
         uiManager.elements.turnDisplay.textContent = game.currentPlayer === playerNum ? "ตาของคุณ" : "รอคู่ต่อสู้...";
    };

    const updatePieceSelector = () => {
        uiManager.elements.pieceSelector.style.visibility = game.currentPlayer === playerNum ? 'visible' : 'hidden';
        if(game.currentPlayer === playerNum) {
            const playerPieces = game.pieces[playerNum];
            pieceLabels.small.textContent = `เล็ก (${playerPieces.small})`;
            pieceLabels.medium.textContent = `กลาง (${playerPieces.medium})`;
            pieceLabels.large.textContent = `ใหญ่ (${playerPieces.large})`;
        }
    };

    const setupGameEventListeners = () => {
        gameBoardElement.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if(cell && selectedPieceSize) {
                handlePlayerMove(parseInt(cell.dataset.index), selectedPieceSize);
            }
        });

        pieceOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                 pieceOptions.forEach(opt => opt.classList.remove('selected'));
                 e.currentTarget.classList.add('selected');
                 selectedPieceSize = e.currentTarget.dataset.size;
            });
        });
    };

    return { init, createRoom, joinRoom, setReady, leaveRoom };
})();
