const coopMode = (() => {
    // ... (State Variables เหมือนเดิม) ...
    
    const init = (uid) => {
        localPlayerId = uid;
    };

    const createRoom = async () => {
        const roomId = generateRandomId(4);
        const newGame = createGame();
        const initialGameState = newGame.getState();

        const players = {
            [localPlayerId]: { playerNum: 1, name: localStorage.getItem('username'), wantsRematch: false }
        };

        try {
            await db.collection('rooms').doc(roomId).set({
                players,
                gameState: initialGameState,
                status: 'waiting',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await joinRoom(roomId);
        } catch (error) {
            console.error("Error creating room: ", error);
            showToast('สร้างห้องไม่สำเร็จ');
        }
    };

    // ... (joinRoom, listenToRoomUpdates, etc. มีการปรับปรุงเล็กน้อย) ...
    // ... (ฟังก์ชันส่วนใหญ่จะคล้ายของเดิม แต่มีการเพิ่ม rematch logic)

    const listenToRoomUpdates = (roomId) => {
        if (roomUnsubscribe) roomUnsubscribe();
        
        roomUnsubscribe = db.collection('rooms').doc(roomId).onSnapshot(doc => {
            // ... (ส่วนต้นเหมือนเดิม) ...
            
            const roomData = doc.data();
            const players = roomData.players;
            
            playerNum = players[localPlayerId]?.playerNum;
            game = roomData.gameState; 

            // ตรวจสอบ rematch
            if (roomData.status === 'finished') {
                const allPlayersWantRematch = Object.values(players).length == 2 && Object.values(players).every(p => p.wantsRematch);
                if (allPlayersWantRematch) {
                    startRematchCountdown();
                } else {
                    updateRematchStatus(players);
                }
            }
            // ... (Update UI logic เหมือนเดิม) ...
        });
    };
    
    // ฟังก์ชันใหม่สำหรับ Rematch
    const requestRematch = async () => {
        if (!currentRoomId) return;
        const roomRef = db.collection('rooms').doc(currentRoomId);
        await roomRef.update({
            [`players.${localPlayerId}.wantsRematch`]: true
        });
        uiManager.elements.rematchStatus.textContent = "รอผู้เล่นอีกคน...";
    };

    const updateRematchStatus = (players) => {
        const opponent = Object.values(players).find(p => p.playerNum !== playerNum);
        if (opponent?.wantsRematch) {
            uiManager.elements.rematchStatus.textContent = "อีกฝ่ายต้องการเล่นอีกครั้ง!";
        } else {
            uiManager.elements.rematchStatus.textContent = "";
        }
    };
    
    const startRematchCountdown = () => {
        let count = 3;
        uiManager.elements.rematchButtons.style.display = 'none';
        const interval = setInterval(async () => {
            if (count > 0) {
                uiManager.elements.rematchStatus.textContent = `เริ่มเกมใหม่ใน ${count}...`;
                count--;
            } else {
                clearInterval(interval);
                uiManager.hideGameOverOverlay();
                // เฉพาะ Player 1 ที่จะ reset เกมเพื่อป้องกันการเขียนทับกัน
                if (playerNum === 1) {
                    await resetGameForRematch();
                }
            }
        }, 1000);
    };

    const resetGameForRematch = async () => {
        const newGame = createGame();
        const newState = newGame.getState();
        const roomRef = db.collection('rooms').doc(currentRoomId);
        const doc = await roomRef.get();
        const players = doc.data().players;
        
        // Reset rematch status for all players
        for (const pid in players) {
            players[pid].wantsRematch = false;
        }

        await roomRef.update({
            gameState: newState,
            status: 'playing',
            players: players
        });
    };

    // ... (ฟังก์ชันอื่นๆ ที่เหลือให้คงไว้เหมือนเดิม) ...

    return { 
        init, createRoom, joinRoom, setReady, leaveRoom, 
        requestRematch // ส่งออกฟังก์ชัน rematch
    };
})();
