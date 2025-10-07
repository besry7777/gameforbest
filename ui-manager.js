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
        gameOver: document.getElementById('game-screen-over-overlay'),
    };

    const elements = {
        welcomeMessage: document.getElementById('welcome-message'),
        roomCodeDisplay: document.getElementById('room-code-display'),
        playerList: document.getElementById('player-list'),
        lobbyStatus: document.getElementById('lobby-status'),
        turnDisplay: document.getElementById('turn-display'),
        gameOverMessage: document.getElementById('game-over-message'),
        rematchStatus: document.getElementById('rematch-status'),
        pieceSelector: document.getElementById('piece-selector'),
    };

    let activeScreen = null;

    /**
     * ฟังก์ชันหลักสำหรับสลับหน้าจอ
     * @param {string} screenKey Key ของหน้าจอที่ต้องการแสดง (เช่น 'mainMenu', 'game')
     */
    const showScreen = (screenKey) => {
        if (!screens[screenKey]) {
            console.error(`Screen "${screenKey}" not found!`);
            return;
        }

        // ซ่อนหน้าจอปัจจุบัน
        if (activeScreen) {
            activeScreen.classList.remove('active');
        }

        // แสดงหน้าจอใหม่
        activeScreen = screens[screenKey];
        activeScreen.classList.add('active');
    };

    /**
     * ซ่อน Loading Overlay
     */
    const hideLoading = () => {
        if (overlays.loading) {
            overlays.loading.style.opacity = '0';
            // ตั้งเวลาให้ transition เล่นจนจบแล้วค่อย display: none
            setTimeout(() => {
                overlays.loading.style.display = 'none';
            }, 500);
        }
    };
    
    /**
     * แสดง Overlay ตอนจบเกม
     * @param {string} message ข้อความที่จะแสดง (เช่น "คุณชนะ!")
     */
    const showGameOverOverlay = (message) => {
        if(elements.gameOverMessage) {
            elements.gameOverMessage.textContent = message;
        }
        if(overlays.gameOver) {
            overlays.gameOver.style.display = 'flex';
        }
    };

    /**
     * ซ่อน Overlay ตอนจบเกม
     */
    const hideGameOverOverlay = () => {
        if(overlays.gameOver) {
            overlays.gameOver.style.display = 'none';
        }
        if(elements.rematchStatus) {
            elements.rematchStatus.textContent = '';
        }
    };


    // --- ส่งออกฟังก์ชันและตัวแปรเพื่อให้ไฟล์อื่นเรียกใช้ได้ ---
    return {
        showScreen,
        hideLoading,
        showGameOverOverlay,
        hideGameOverOverlay,
        elements, // ส่ง elements ทั้งหมดออกไปเพื่อให้ง่ายต่อการเข้าถึงจากไฟล์อื่น
    };
})();

