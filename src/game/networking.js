import { gameState, getCurrentPlayer, createPlayer } from './state.js';
import { updateGameDisplay, showStatus, addLogEntry, showLobby, handleGameStarted, handleDiceRoll, handleCardPurchase, handleTurnEnd } from './ui.js';

let socket = null;
let isConnected = false;

// WebRTC connections for star topology
let connections = new Map(); // playerId -> RTCPeerConnection
let isHost = false;
let hostConnection = null;

export function setupSocketListeners() {
    if (!socket) return;
    
    socket.on('connect', () => {
        console.log('Connected to server');
        isConnected = true;
        gameState.playerId = socket.id;
        showStatus('Connected to server!', 'success');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        isConnected = false;
        showStatus('Disconnected from server', 'error');
    });
    
    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        showStatus('Connection error: ' + error.message, 'error');
    });
    
    socket.on('game-hosted', (data) => {
        console.log('Game hosted successfully:', data);
        gameState.gameCode = data.gameCode;
        gameState.players = data.game.players;
        gameState.isHost = true;
        isHost = true;
        
        showStatus(`Game created! Share this code: ${data.gameCode}`, 'success');
        showLobby();
    });
    
    socket.on('game-joined', (data) => {
        console.log('Joined game successfully:', data);
        gameState.gameCode = data.game.id;
        gameState.players = data.game.players;
        gameState.isHost = false;
        isHost = false;
        
        showStatus('Connected to game!', 'success');
        showLobby();
    });
    
    socket.on('join-error', (data) => {
        showStatus(data.message, 'error');
    });
    
    socket.on('player-joined', (data) => {
        console.log('Player joined:', data);
        gameState.players = data.players;
        updateGameDisplay();
        addLogEntry(`${data.player.name} joined the game`, 'game-event');
    });
    
    socket.on('player-left', (data) => {
        console.log('Player left:', data);
        gameState.players = data.players;
        updateGameDisplay();
        addLogEntry('A player left the game', 'game-event');
    });
    
    socket.on('game-started', (data) => {
        console.log('Game started:', data);
        gameState = { ...gameState, ...data.game };
        gameState.gameStarted = true;
        handleGameStarted(data);
    });
    
    socket.on('game-action', (data) => {
        console.log('Received game action:', data);
        handleGameAction(data.action, data.actionData);
    });
    
    socket.on('game-state-update', (data) => {
        console.log('Game state updated from server:', data);
        gameState = { ...gameState, ...data.game };
        updateGameDisplay();
    });
}

export function handleGameAction(action, actionData) {
    switch (action) {
        case 'roll-dice':
            handleDiceRoll(actionData.rollResult);
            break;
        case 'buy-card':
            handleCardPurchase(actionData);
            break;
        case 'end-turn':
            handleTurnEnd();
            break;
        default:
            console.log('Unknown action:', action);
    }
}

export async function hostGame(playerName) {
    if (!playerName) {
        showStatus('Please enter your name', 'error');
        return;
    }

    if (!socket) {
        try {
            socket = io();
            setupSocketListeners();
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Failed to connect to server:', error);
            showStatus('Failed to connect to server', 'error');
            return;
        }
    }

    if (!isConnected) {
        showStatus('Not connected to server. Please try again.', 'error');
        return;
    }

    const gameCode = generateGameCode();
    showStatus('Creating game...', 'info');
    socket.emit('host-game', { playerName, gameCode });
}

export async function joinGame(playerName, gameCode) {
    if (!playerName || !gameCode) {
        showStatus('Please enter your name and game code', 'error');
        return;
    }

    if (!socket) {
        socket = io();
        setupSocketListeners();
    }

    showStatus('Connecting to game...', 'info');
    socket.emit('join-game', { playerName, gameCode });
}

export function startGame() {
    if (gameState.players.length < 2) {
        showStatus('Need at least 2 players to start', 'error');
        return;
    }

    if (isHost && socket) {
        socket.emit('start-game', { gameCode: gameState.gameCode });
    }
}

export function emitGameAction(action, actionData) {
    if (socket) {
        socket.emit('game-action', {
            gameCode: gameState.gameCode,
            action,
            actionData
        });
    }
} 