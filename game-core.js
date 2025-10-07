/**
 * game-core.js
 * * จัดการสถานะและตรรกะหลักของเกม (Game State & Logic)
 */

const createGame = () => {
    // --- สถานะของเกม (Game State) ---
    let board;          // สถานะของแต่ละช่องในกระดาน
    let currentPlayer;  // ผู้เล่นปัจจุบัน (1 หรือ 2)
    let pieces;         // จำนวนหมากที่เหลืออยู่ของผู้เล่น
    let isGameOver;     // เกมจบแล้วหรือยัง
    let winner;         // ผู้ชนะ (null, 1, 2, หรือ 'draw')

    const pieceSizes = { small: 0, medium: 1, large: 2 };

    // --- ฟังก์ชันสำหรับเริ่มเกมใหม่ ---
    const init = () => {
        // สร้างกระดาน 3x3 ที่ทุกช่องเป็น array ว่างเปล่า (สำหรับเก็บหมากซ้อนกัน)
        board = Array(9).fill(null).map(() => []);
        
        currentPlayer = 1;
        isGameOver = false;
        winner = null;
        
        // ผู้เล่นแต่ละคนมีหมากขนาดละ 3 ตัว
        pieces = {
            1: { small: 3, medium: 3, large: 3 },
            2: { small: 3, medium: 3, large: 3 },
        };
    };

    // --- ฟังก์ชันสำหรับวางหมาก ---
    const placePiece = (index, size) => {
        if (isGameOver || !isValidMove(index, size)) {
            return { success: false, reason: 'Invalid move' };
        }

        // วางหมากลงบนสุดของช่องนั้น
        board[index].push({ player: currentPlayer, size });
        pieces[currentPlayer][size]--;

        // ตรวจสอบผลลัพธ์ของเกม
        const winResult = checkWin();
        if (winResult) {
            isGameOver = true;
            winner = winResult.winner;
        } else if (isBoardFull()) {
            isGameOver = true;
            winner = 'draw';
        } else {
            // สลับผู้เล่นถ้าเกมยังไม่จบ
            switchPlayer();
        }

        return { success: true };
    };
    
    // --- ตรวจสอบว่าสามารถลงหมากได้หรือไม่ ---
    const isValidMove = (index, size) => {
        // เช็คว่ามีหมากขนาดนี้เหลือหรือไม่
        if (pieces[currentPlayer][size] <= 0) {
            return false;
        }
        
        const cellPieces = board[index];
        // ถ้าช่องว่างเปล่า สามารถลงได้เลย
        if (cellPieces.length === 0) {
            return true;
        }
        
        // ถ้าช่องไม่ว่าง ต้องลงหมากที่ใหญ่กว่าตัวบนสุดเท่านั้น
        const topPiece = cellPieces[cellPieces.length - 1];
        const newPieceSizeValue = pieceSizes[size];
        const topPieceSizeValue = pieceSizes[topPiece.size];

        return newPieceSizeValue > topPieceSizeValue;
    };

    // --- สลับตาผู้เล่น ---
    const switchPlayer = () => {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
    };

    // --- ตรวจสอบการชนะ ---
    const checkWin = () => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            
            const topPieceA = board[a].length > 0 ? board[a][board[a].length - 1] : null;
            const topPieceB = board[b].length > 0 ? board[b][board[b].length - 1] : null;
            const topPieceC = board[c].length > 0 ? board[c][board[c].length - 1] : null;

            if (topPieceA && topPieceB && topPieceC &&
                topPieceA.player === topPieceB.player &&
                topPieceA.player === topPieceC.player) {
                return { winner: topPieceA.player, line };
            }
        }
        return null;
    };

    // --- ตรวจสอบว่ากระดานเต็มหรือยัง ---
    const isBoardFull = () => {
        // ตรรกะนี้อาจจะต้องซับซ้อนกว่านี้ แต่ในเบื้องต้นคือดูว่าไม่มีช่องให้ลงแล้ว
        // ในเกมนี้ กระดานไม่สามารถ "เต็ม" ได้จริงๆ เพราะลงทับได้
        // ดังนั้นเราจะเช็คจากจำนวนหมากที่ใช้ไปทั้งหมด
        const totalPiecesUsed = Object.values(pieces[1]).reduce((a, b) => a + b, 0) + 
                                Object.values(pieces[2]).reduce((a, b) => a + b, 0);
        return totalPiecesUsed === 0; // ไม่มีใครมีหมากเหลือแล้ว
    };

    // --- ส่งสถานะปัจจุบันของเกมออกไป ---
    const getState = () => ({
        board,
        currentPlayer,
        pieces,
        isGameOver,
        winner,
        checkWin // ส่งฟังก์ชัน checkWin ออกไปด้วย
    });

    // เริ่มต้นเกมเมื่อสร้าง object
    init();

    return {
        init,
        placePiece,
        getState
    };
};
