import { io } from 'socket.io-client';

/**
 * Client-side game state management and networking
 */
export class GameClient {
    constructor() {
        this.socket = null;
        this.gameState = null;
        this.eventHandlers = new Map();
    }

    /**
     * Connect to the game server
     * @returns {Promise} Resolves when connected
     */
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.socket = io();
                
                this.socket.on('connect', () => {
                    console.log('Connected to server');
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    console.error('Connection error:', error);
                    reject(error);
                });

                // Set up event handlers
                this.setupEventHandlers();
            } catch (error) {
                console.error('Failed to connect:', error);
                reject(error);
            }
        });
    }

    /**
     * Set up Socket.IO event handlers
     */
    setupEventHandlers() {
        // Game setup events
        this.socket.on('game-hosted', this.handleGameHosted.bind(this));
        this.socket.on('game-joined', this.handleGameJoined.bind(this));
        this.socket.on('join-error', this.handleJoinError.bind(this));
        this.socket.on('game-started', this.handleGameStarted.bind(this));
        
        // Game state events
        this.socket.on('game-state-update', this.handleGameStateUpdate.bind(this));
        this.socket.on('game-action', this.handleGameAction.bind(this));
        this.socket.on('game-error', this.handleGameError.bind(this));
        
        // Player events
        this.socket.on('player-joined', this.handlePlayerJoined.bind(this));
        this.socket.on('player-left', this.handlePlayerLeft.bind(this));
        
        // Game end events
        this.socket.on('game-won', this.handleGameWon.bind(this));
    }

    /**
     * Register an event handler
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    on(event, handler) {
        this.eventHandlers.set(event, handler);
    }

    /**
     * Emit an event to registered handler
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        const handler = this.eventHandlers.get(event);
        if (handler) {
            handler(data);
        }
    }

    /**
     * Host a new game
     * @param {string} playerName - Host's name
     * @param {string} gameCode - Game code
     */
    hostGame(playerName, gameCode) {
        this.socket.emit('host-game', { playerName, gameCode });
    }

    /**
     * Join an existing game
     * @param {string} playerName - Player's name
     * @param {string} gameCode - Game code to join
     */
    joinGame(playerName, gameCode) {
        this.socket.emit('join-game', { playerName, gameCode });
    }

    /**
     * Start the game
     * @param {string} gameCode - Game code
     */
    startGame(gameCode) {
        this.socket.emit('start-game', { gameCode });
    }

    /**
     * Roll dice
     * @param {Object} rollResult - Dice roll result
     */
    rollDice(rollResult) {
        if (!this.gameState) return;
        this.socket.emit('game-action', {
            gameCode: this.gameState.gameCode,
            action: 'roll-dice',
            actionData: { rollResult }
        });
    }

    /**
     * Buy a card
     * @param {string} cardType - Type of card to buy
     */
    buyCard(cardType) {
        if (!this.gameState) return;
        this.socket.emit('game-action', {
            gameCode: this.gameState.gameCode,
            action: 'buy-card',
            actionData: { cardType }
        });
    }

    /**
     * End the current turn
     */
    endTurn() {
        if (!this.gameState) return;
        this.socket.emit('game-action', {
            gameCode: this.gameState.gameCode,
            action: 'end-turn',
            actionData: {}
        });
    }

    /**
     * Get the current player's ID
     * @returns {string} Current player's socket ID
     */
    getCurrentPlayerId() {
        return this.socket?.id;
    }

    /**
     * Check if it's the current player's turn
     * @returns {boolean} Whether it's the current player's turn
     */
    isCurrentPlayerTurn() {
        if (!this.gameState) return false;
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        return currentPlayer?.id === this.getCurrentPlayerId();
    }

    // Event handlers
    handleGameHosted(data) {
        this.gameState = data.game;
        this.emit('game-hosted', data);
    }

    handleGameJoined(data) {
        this.gameState = data.game;
        this.emit('game-joined', data);
    }

    handleJoinError(data) {
        this.emit('join-error', data);
    }

    handleGameStarted(data) {
        this.gameState = data.game;
        this.emit('game-started', data);
    }

    handleGameStateUpdate(data) {
        this.gameState = data.game;
        this.emit('game-state-update', data);
    }

    handleGameAction(data) {
        this.emit('game-action', data);
    }

    handleGameError(data) {
        this.emit('game-error', data);
    }

    handlePlayerJoined(data) {
        this.gameState = data.game;
        this.emit('player-joined', data);
    }

    handlePlayerLeft(data) {
        this.gameState = data.game;
        this.emit('player-left', data);
    }

    handleGameWon(data) {
        this.gameState = data.game;
        this.emit('game-won', data);
    }
} 