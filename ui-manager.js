/**
 * ui-manager.js
 * * จัดการการแสดงผล UI ทั้งหมด เช่น การสลับหน้าจอ, การอัปเดตข้อความ
 */

const uiManager = (() => {
    // --- เก็บ Element ของหน้าจอต่างๆ ---
    const screens = {
        mainMenu: document.getElementById('main-menu'),
        settings: document.getElementById('settings-screen'),
        coopMenu: document.getElementById('coop-menu'),
        roomLobby: document.getElementById('room-lobby'),
        game: document.getElementById('game-screen'),
    };

    // --- เก็บ Element อื่นๆ ที่ใช้บ่อย ---
    const overlays = {
        loading: document.getElementById('loading-overlay'),
        connectionError: document.getElementById('connection-error-overlay'),
        gameOver: document.getElementById('game-over-overlay'),
    };

    const elements = {
        welcomeMessage: document.getElementById('welcome-message'),
        roomCodeDisplay: document.getElementById('room-code-display'),
        playerList: document.getElementById('player-list'),
        lobbyStatus: document.getElementById('lobby-status'),
        turnDisplay: document.getElementById('turn-display'),
        gameOverMessage: document.getElementById('game-over-message'),
        rematchStatus: document.getElementById('rematch-status'),
        rematchButtons: document.getElementById('rematch-buttons'),
        pieceSelector: document.getElementById('piece-selector'),
    };

    let activeScreen = null;

    const showScreen = (screenKey) => {
        if (!screens[screenKey]) {
            console.error(`Screen "${screenKey}" not found!`);
            return;
        }

        if (activeScreen) {
            activeScreen.classList.remove('active');
        }

        activeScreen = screens[screenKey];
        activeScreen.classList.add('active');
    };

    const hideLoading = () => {
        if (overlays.loading) {
            overlays.loading.style.opacity = '0';
            setTimeout(() => {
                overlays.loading.style.display = 'none';
            }, 500);
        }
    };
    
    const showGameOverOverlay = (message) => {
        if(elements.gameOverMessage) {
            elements.gameOverMessage.textContent = message;
        }
        if(overlays.gameOver) {
            overlays.gameOver.style.display = 'flex';
        }
        if(elements.rematchButtons) {
            elements.rematchButtons.style.display = 'flex';
        }
        if(elements.rematchStatus) {
            elements.rematchStatus.textContent = '';
        }
    };

    const hideGameOverOverlay = () => {
        if(overlays.gameOver) {
            overlays.gameOver.style.display = 'none';
        }
    };


    return {
        showScreen,
        hideLoading,
        showGameOverOverlay,
        hideGameOverOverlay,
        elements,
    };
})();
