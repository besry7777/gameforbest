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
        reset: document.getElementById('reset-button'), // เพิ่มปุ่มรีเซ็ต
    };
    const inputs = {
        changeUsername: document.getElementById('change-username-input'),
        roomCode: document.getElementById('room-code-input'),
    };
    const welcomeMessage = document.getElementById('welcome-message');
    const loadingPercentage = document.getElementById('loading-percentage'); // Element เปอร์เซ็นต์

    let localUid = null;
    let currentMode = null;
    
    // --- Initialization with Loading Simulation ---
    const initializeApp = () => {
        let progress = 0;
        let authCompleted = false;

        // 1. Simulate loading progress
        const progressInterval = setInterval(() => {
            if (progress < 90 && !authCompleted) {
                progress += Math.floor(Math.random() * 5) + 1;
                if (progress > 90) progress = 90;
                loadingPercentage.textContent = `กำลังเริ่มต้น ${progress}%`;
            }
        }, 200);

        // 2. Set a timeout for loading
        const timeoutId = setTimeout(() => {
            if (!authCompleted) {
                buttons.reset.style.display = 'inline-flex';
                loadingPercentage.textContent = 'การเชื่อมต่อช้ากว่าปกติ';
                clearInterval(progressInterval); // หยุดโหลดเปอร์เซ็นต์
            }
        }, 10000); // 10 วินาที

        // 3. Start actual Firebase authentication
        firebase.auth().signInAnonymously()
            .then(() => {
                firebase.auth().onAuthStateChanged(user => {
                    if (user && !authCompleted) {
                        authCompleted = true;
                        
                        // Clear timeout and interval
                        clearTimeout(timeoutId);
                        clearInterval(progressInterval);

                        // Complete the loading bar
                        loadingPercentage.textContent = 'สำเร็จ 100%';
                        
                        localUid = user.uid;
                        coopMode.init(localUid);
                        loadUserProfile();
                        setupEventListeners();
                        
                        // Wait a bit before hiding loading screen
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
        welcomeMessage.textContent = `ยินดีต้อนรับ, ${username}!`;
        inputs.changeUsername.value = username;
    };

    // --- Event Listeners Setup ---
    const setupEventListeners = () => {
        // Main Menu
        buttons.playBot.addEventListener('click', () => {
            currentMode = 'bot';
            uiManager.showScreen('game');
            botMode.start();
        });
        buttons.playCoop.addEventListener('click', () => {
            currentMode = 'coop';
            uiManager.showScreen('coopMenu');
        });
        buttons.settings.addEventListener('click', () => uiManager.showScreen('settings'));
        
        // Settings
        buttons.backToMainFromSettings.addEventListener('click', () => uiManager.showScreen('mainMenu'));
        buttons.saveSettings.addEventListener('click', saveUsername);

        // Co-op Menu
        buttons.backToMainFromCoop.addEventListener('click', () => uiManager.showScreen('mainMenu'));
        buttons.createRoom.addEventListener('click', () => coopMode.createRoom(localUid));
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

        // Reset Button
        buttons.reset.addEventListener('click', () => {
            window.location.reload();
        });
    };
    
    // --- Functions ---
    const saveUsername = () => {
        const newUsername = inputs.changeUsername.value.trim();
        const errorEl = document.getElementById('change-username-error');
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
