/**
 * game-core.js
 * * จัดการสถานะและตรรกะหลักของเกม (Game State & Logic)
 */

const createGame = () => {
    let board;
    let currentPlayer;
    let pieces;
    let isGameOver;
    let winner;

    const pieceSizes = { small: 0, medium: 1, large: 2 };
    const sizeMap = ['small', 'medium', 'large'];

    const init = () => {
        board = Array(9).fill(null).map(() => []);
        currentPlayer = 1;
        isGameOver = false;
        winner = null;
        pieces = {
            1: { small: 3, medium: 3, large: 3 },
            2: { small: 3, medium: 3, large: 3 },
        };
    };

    const placePiece = (index, size) => {
        if (isGameOver || !isValidMove(index, size)) {
            return { success: false, reason: 'Invalid move' };
        }

        board[index].push({ player: currentPlayer, size });
        pieces[currentPlayer][size]--;

        const winResult = checkWin();
        if (winResult) {
            isGameOver = true;
            winner = winResult.winner;
        } else {
            switchPlayer();
        }

        return { success: true };
    };
    
    const isValidMove = (index, size) => {
        if (pieces[currentPlayer][size] <= 0) {
            return false;
        }
        
        const cellPieces = board[index];
        if (cellPieces.length === 0) {
            return true;
        }
        
        const topPiece = cellPieces[cellPieces.length - 1];
        const newPieceSizeValue = pieceSizes[size];
        const topPieceSizeValue = pieceSizes[topPiece.size];

        return newPieceSizeValue > topPieceSizeValue;
    };

    const switchPlayer = () => {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
    };

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

    const getState = () => ({
        board,
        currentPlayer,
        pieces,
        isGameOver,
        winner,
        checkWin
    });

    init();

    return {
        init,
        placePiece,
        getState
    };
};
