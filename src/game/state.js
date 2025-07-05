// Game state management
export const gameState = {
    players: [],
    currentPlayerIndex: 0,
    turn: 1,
    phase: 'roll', // roll, income, buy
    lastRoll: null,
    deck: [],
    isHost: false,
    gameStarted: false,
    playerId: null,
    gameCode: null
};

export function createPlayer(name, id) {
    return {
        id: id,
        name: name,
        coins: 3,
        buildings: {
            'wheat-field': 1,
            'bakery': 1
        },
        landmarks: {
            'train-station': false,
            'shopping-mall': false,
            'amusement-park': false,
            'radio-tower': false
        }
    };
}

export function getCurrentPlayer() {
    return gameState.players[gameState.currentPlayerIndex];
}

export function isCurrentPlayer() {
    return getCurrentPlayer().id === gameState.playerId;
}

export function checkWinCondition(player) {
    return Object.values(player.landmarks).every(built => built);
}

export function generateGameCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
} 