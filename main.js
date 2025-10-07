document.addEventListener('DOMContentLoaded', () => {
    // ... (Elements และส่วนบนเหมือนเดิม) ...
    let localUid = null;
    let currentMode = null; // 'bot' or 'coop'

    // ... (initializeApp, loadUserProfile เหมือนเดิม) ...

    const setupEventListeners = () => {
        // Main Menu
        buttons.playBot.addEventListener('click', () => {
            currentMode = 'bot'; // ตั้งค่าโหมดปัจจุบัน
            uiManager.showScreen('game');
            botMode.start();
        });
        buttons.playCoop.addEventListener('click', () => {
            currentMode = 'coop'; // ตั้งค่าโหมดปัจจุบัน
            uiManager.showScreen('coopMenu');
        });
        
        // ... (Listeners อื่นๆ เหมือนเดิม) ...

        // In-Game
        buttons.rematch.addEventListener('click', () => {
            if (currentMode === 'bot') {
                botMode.rematch();
            } else if (currentMode === 'coop') {
                coopMode.requestRematch();
            }
        });
        buttons.backToMenuFromGame.addEventListener('click', () => {
            if (currentMode === 'coop') coopMode.leaveRoom();
            currentMode = null;
            uiManager.showScreen('mainMenu');
        });
        buttons.leaveGame.addEventListener('click', () => {
            if (currentMode === 'coop') coopMode.leaveRoom();
            currentMode = null;
            uiManager.showScreen('mainMenu');
        });
    };
    
    // ... (saveUsername และ initializeApp() call เหมือนเดิม) ...
});
