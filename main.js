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
        reset: document.getElementById('reset-button'),
    };
    const inputs = {
        changeUsername: document.getElementById('change-username-input'),
        roomCode: document.getElementById('room-code-input'),
    };
    const welcomeMessage = document.getElementById('welcome-message');
    const loadingPercentage = document.getElementById('loading-percentage');

    let localUid = null;
    let currentMode = null;
    
    // --- Initialization with Loading Simulation ---
    const initializeApp = () => {
        let progress = 0;
        let authCompleted = false;

        // 1. Simulate loading progress (more stable version)
        const progressInterval = setInterval(() => {
            if (progress < 90 && !authCompleted) {
                progress++;
                if (loadingPercentage) {
                    loadingPercentage.textContent = `กำลังเริ่มต้น ${progress}%`;
                }
            } else {
                clearInterval(progressInterval);
            }
        }, 30); // Speed of progress bar

        // 2. Set a timeout for loading
        const timeoutId = setTimeout(() => {
            if (!authCompleted) {
                if(buttons.reset) buttons.reset.style.display = 'inline-flex';
                if(loadingPercentage) loadingPercentage.textContent = 'การเชื่อมต่อช้ากว่าปกติ';
                clearInterval(progressInterval);
            }
        }, 10000); // 10 seconds

        // 3. Start actual Firebase authentication
        firebase.auth().signInAnonymously()
            .then(() => {
                firebase.auth().onAuthStateChanged(user => {
                    if (user && !authCompleted) {
                        authCompleted = true;
                        
                        clearTimeout(timeoutId);
                        clearInterval(progressInterval);

                        if(loadingPercentage) loadingPercentage.textContent = 'สำเร็จ 100%';
                        
                        localUid = user.uid;
                        if(typeof coopMode !== 'undefined') coopMode.init(localUid);
                        loadUserProfile();
                        setupEventListeners();
                        
                        setTimeout(() => {
                            uiManager.hideLoading();
                            uiManager.showScreen('mainMenu');
                        }, 500);
                    }
                });
            })
            .catch(error => {
                console.error("Firebase Auth Error:", error);
                clearTimeout(timeoutId);
                clearInterval(progressInterval);
                document.getElementById('connection-error-overlay').style.display = 'flex';
            });
    };

    const loadUserProfile = () => {
        let username = localStorage.getItem('username');
        if (!username) {
            username = `Player${generateRandomId(4)}`;
            localStorage.setItem('username', username);
        }
        if (welcomeMessage) welcomeMessage.textContent = `ยินดีต้อนรับ, ${username}!`;
        if (inputs.changeUsername) inputs.changeUsername.value = username;
    };

    // --- Event Listeners Setup ---
    const setupEventListeners = () => {
        if(buttons.playBot) buttons.playBot.addEventListener('click', () => {
            currentMode = 'bot';
            uiManager.showScreen('game');
            botMode.start();
        });
        if(buttons.playCoop) buttons.playCoop.addEventListener('click', () => {
            currentMode = 'coop';
            uiManager.showScreen('coopMenu');
        });
        if(buttons.settings) buttons.settings.addEventListener('click', () => uiManager.showScreen('settings'));
        if(buttons.backToMainFromSettings) buttons.backToMainFromSettings.addEventListener('click', () => uiManager.showScreen('mainMenu'));
        if(buttons.saveSettings) buttons.saveSettings.addEventListener('click', saveUsername);
        if(buttons.backToMainFromCoop) buttons.backToMainFromCoop.addEventListener('click', () => uiManager.showScreen('mainMenu'));
        if(buttons.createRoom) buttons.createRoom.addEventListener('click', () => coopMode.createRoom());
        if(buttons.joinRoom) buttons.joinRoom.addEventListener('click', () => {
            const code = inputs.roomCode.value;
            if (code) coopMode.joinRoom(code);
        });
        if(buttons.leaveRoom) buttons.leaveRoom.addEventListener('click', coopMode.leaveRoom);
        if(buttons.ready) buttons.ready.addEventListener('click', coopMode.setReady);
        if(buttons.copyRoomCode) buttons.copyRoomCode.addEventListener('click', () => {
             const roomCode = document.getElementById('room-code-display').textContent;
             navigator.clipboard.writeText(roomCode).then(() => showToast(`คัดลอกรหัส: ${roomCode}`));
        });
        if(buttons.rematch) buttons.rematch.addEventListener('click', () => {
            if (currentMode === 'bot') botMode.rematch();
            else if (currentMode === 'coop') coopMode.requestRematch();
        });
        if(buttons.backToMenuFromGame) buttons.backToMenuFromGame.addEventListener('click', () => {
            if (currentMode === 'coop') coopMode.leaveRoom();
            currentMode = null;
            uiManager.showScreen('mainMenu');
        });
        if(buttons.leaveGame) buttons.leaveGame.addEventListener('click', () => {
            if (currentMode === 'coop') coopMode.leaveRoom();
            currentMode = null;
            uiManager.showScreen('mainMenu');
        });
        if(buttons.reset) buttons.reset.addEventListener('click', () => window.location.reload());
    };
    
    const saveUsername = () => {
        // ... (The rest of the file is the same as before)
        const newUsername = inputs.changeUsername.value.trim();
        const errorEl = document.getElementById('change-username-error');
        if (newUsername.length >= 3 && newUsername.length <= 12 && /^[a-zA-Z0-9]+$/.test(newUsername)) {
            localStorage.setItem('username', newUsername);
            if (welcomeMessage) welcomeMessage.textContent = `ยินดีต้อนรับ, ${newUsername}!`;
            showToast('บันทึกชื่อใหม่แล้ว!');
            if (errorEl) errorEl.textContent = '';
            uiManager.showScreen('mainMenu');
        } else {
            if (errorEl) errorEl.textContent = 'ชื่อต้องเป็นอังกฤษ/ตัวเลข 3-12 ตัว';
        }
    };
    
    // --- Start the App ---
    initializeApp();
});
