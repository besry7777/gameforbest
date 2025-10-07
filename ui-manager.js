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

    /**
     * ฟังก์ชันหลักสำหรับสลับหน้าจอ
     * @param {string} screenKey Key ของหน้าจอที่ต้องการแสดง (เช่น 'mainMenu', 'game')
     */
    const showScreen = (screenKey) => {
        const newScreen = screens[screenKey];

        if (!newScreen) {
            console.error(`Screen "${screenKey}" not found in HTML or ui-manager!`);
            return;
        }

        // ซ่อนหน้าจอปัจจุบัน
        if (activeScreen) {
            activeScreen.classList.remove('active');
        }

        // แสดงหน้าจอใหม่
        newScreen.classList.add('active');
        activeScreen = newScreen;
    };

    /**
     * ซ่อน Loading Overlay
     */
    const hideLoading = () => {
        if (overlays.loading) {
            overlays.loading.style.opacity = '0';
            setTimeout(() => {
                overlays.loading.style.display = 'none';
            }, 500); // รอให้ animation opacity จบก่อน
        } else {
            console.error('Loading overlay element not found!');
        }
    };
    
    /**
     * แสดง Overlay ตอนจบเกม
     * @param {string} message ข้อความที่จะแสดง (เช่น "คุณชนะ!")
     */
    const showGameOverOverlay = (message) => {
        if (elements.gameOverMessage) {
            elements.gameOverMessage.textContent = message;
        }
        if (elements.rematchButtons) {
            elements.rematchButtons.style.display = 'flex';
        }
         if (elements.rematchStatus) {
            elements.rematchStatus.textContent = '';
        }
        if (overlays.gameOver) {
            overlays.gameOver.style.display = 'flex';
        }
    };

    /**
     * ซ่อน Overlay ตอนจบเกม
     */
    const hideGameOverOverlay = () => {
        if (overlays.gameOver) {
            overlays.gameOver.style.display = 'none';
        }
    };

    // --- ส่งออกฟังก์ชันและตัวแปรเพื่อให้ไฟล์อื่นเรียกใช้ได้ ---
    return {
        showScreen,
        hideLoading,
        showGameOverOverlay,
        hideGameOverOverlay,
        elements,
    };
})();
