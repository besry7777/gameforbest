/**
 * main.js
 * * ไฟล์หลักสำหรับเริ่มต้นการทำงานทั้งหมด, จัดการ Event Listener หลัก และควบคุมการทำงานโดยรวม
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const buttons = {
        playBot: document.getElementById('play-bot-btn'),
        playCoop: document.getElementById('play-coop-btn'),
        settings: document.getElementById('settings-btn'),
        backToMainFromSettings: document.getElementById('back-to-main-from-settings-btn'),
        saveSettings: document.getElementById('save-settings-btn'),
        
        createRoom: document.getElementById('create-room-btn'),
        joinRoom: document.getElementById('join-room-btn'),
        backToMainFromCoop: document.getElementById('back-to-main-from-coop-btn'),
        
        copyRoomCode: document.getElementById('copy-room-code-btn'),
        ready: document.getElementById('ready-btn'),
        leaveRoom: document.getElementById('leave-room-btn'),

        rematch: document.getElementById('rematch-btn'),
        backToMenuFromGame: document.getElementById('back-to-menu-from-game-btn'),
        leaveGame: document.getElementById('leave-game-btn'),
    };
    const inputs = {
        changeUsername: document.getElementById('change-username-input'),
        roomCode: document.getElementById('room-code-input'),
    };
    const welcomeMessage = document.getElementById('welcome-message');

    let localUid = null;
    
    // --- Initialization ---
    const initializeApp = async () => {
        try {
            // 1. Firebase Authentication
            await firebase.auth().signInAnonymously();
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    localUid = user.uid;
                    coopMode.init(localUid); // Initialize coop mode with user id
                    
                    // 2. Load User Profile
                    loadUserProfile();

                    // 3. Setup Event Listeners
                    setupEventListeners();
                    
                    // 4. Show Main Menu
                    uiManager.hideLoading();
                    uiManager.showScreen('mainMenu');
                }
            });
        } catch (error) {
            console.error("Firebase Auth Error:", error);
            document.getElementById('connection-error-overlay').style.display = 'flex';
        }
    };

    const loadUserProfile = () => {
        let username = localStorage.getItem('username');
        if (!username) {
            username = `Player${generateRandomId(4)}`;
            localStorage.setItem('username', username);
        }
        welcomeMessage.textContent = `ยินดีต้อนรับ, ${username}!`;
        inputs.changeUsername.value = username;
    };

    // --- Event Listeners Setup ---
    const setupEventListeners = () => {
        // Main Menu
        buttons.playBot.addEventListener('click', () => {
            uiManager.showScreen('game');
            botMode.start();
        });
        buttons.playCoop.addEventListener('click', () => uiManager.showScreen('coopMenu'));
        buttons.settings.addEventListener('click', () => uiManager.showScreen('settings'));
        
        // Settings
        buttons.backToMainFromSettings.addEventListener('click', () => uiManager.showScreen('mainMenu'));
        buttons.saveSettings.addEventListener('click', saveUsername);

        // Co-op Menu
        buttons.backToMainFromCoop.addEventListener('click', () => uiManager.showScreen('mainMenu'));
        buttons.createRoom.addEventListener('click', coopMode.createRoom);
        buttons.joinRoom.addEventListener('click', () => {
            const code = inputs.roomCode.value;
            if (code) coopMode.joinRoom(code);
        });

        // Room Lobby
        buttons.leaveRoom.addEventListener('click', coopMode.leaveRoom);
        buttons.ready.addEventListener('click', coopMode.setReady);
        buttons.copyRoomCode.addEventListener('click', () => {
             const roomCode = document.getElementById('room-code-display').textContent;
             navigator.clipboard.writeText(roomCode).then(() => showToast(`คัดลอกรหัส: ${roomCode}`));
        });

        // In-Game
        buttons.backToMenuFromGame.addEventListener('click', () => uiManager.showScreen('mainMenu'));
        buttons.leaveGame.addEventListener('click', () => {
            // Implement leave/surrender logic if needed, for now just go to menu
            uiManager.showScreen('mainMenu');
        });
    };
    
    // --- Functions ---
    const saveUsername = () => {
        const newUsername = inputs.changeUsername.value.trim();
        const errorEl = document.getElementById('change-username-error');
        // Simple validation
        if (newUsername.length >= 3 && newUsername.length <= 12 && /^[a-zA-Z0-9]+$/.test(newUsername)) {
            localStorage.setItem('username', newUsername);
            welcomeMessage.textContent = `ยินดีต้อนรับ, ${newUsername}!`;
            showToast('บันทึกชื่อใหม่แล้ว!');
            errorEl.textContent = '';
            uiManager.showScreen('mainMenu');
        } else {
            errorEl.textContent = 'ชื่อต้องเป็นอังกฤษ/ตัวเลข 3-12 ตัว';
        }
    };
    
    // --- Start the App ---
    initializeApp();
});
