import { Component } from './Component.js';

/**
 * Lobby component for game setup
 */
export class Lobby extends Component {
    constructor(gameClient) {
        super(gameClient);
        this.setupForm = null;
        this.statusMessage = null;
    }

    createElement() {
        // Create status message
        this.statusMessage = this.createDiv([], {
            className: 'status-message',
            style: { display: 'none' }
        });

        // Create setup form
        this.setupForm = this.createElement('form', {
            className: 'setup-form',
            onSubmit: (e) => {
                e.preventDefault();
                this.handleSetupSubmit();
            }
        }, [
            // Name input
            this.createDiv([
                this.createElement('label', { for: 'playerName' }, ['Your Name:']),
                this.createElement('input', {
                    type: 'text',
                    id: 'playerName',
                    required: true,
                    minLength: 2,
                    maxLength: 20
                })
            ]),

            // Game code input
            this.createDiv([
                this.createElement('label', { for: 'gameCode' }, ['Game Code:']),
                this.createElement('input', {
                    type: 'text',
                    id: 'gameCode',
                    required: true,
                    minLength: 4,
                    maxLength: 10
                })
            ]),

            // Action buttons
            this.createDiv([
                this.createButton('Host Game', () => this.handleHostGame(), {
                    type: 'button',
                    className: 'host-button'
                }),
                this.createButton('Join Game', () => this.handleJoinGame(), {
                    type: 'button',
                    className: 'join-button'
                })
            ], { className: 'button-container' })
        ]);

        // Create main container
        return this.createDiv([
            this.createElement('h1', {}, ['Machi Koro']),
            this.statusMessage,
            this.setupForm
        ], { className: 'lobby' });
    }

    onMount() {
        // Set up game event handlers
        this.gameClient.on('game-hosted', (data) => this.handleGameHosted(data));
        this.gameClient.on('game-joined', (data) => this.handleGameJoined(data));
        this.gameClient.on('join-error', (data) => this.handleJoinError(data));
        this.gameClient.on('game-started', (data) => this.handleGameStarted(data));
        this.gameClient.on('player-joined', (data) => this.handlePlayerJoined(data));
        this.gameClient.on('player-left', (data) => this.handlePlayerLeft(data));
    }

    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.show(this.statusMessage);
    }

    hideStatus() {
        this.hide(this.statusMessage);
    }

    handleHostGame() {
        const playerName = document.getElementById('playerName').value.trim();
        const gameCode = document.getElementById('gameCode').value.trim();

        if (!playerName || !gameCode) {
            this.showStatus('Please enter your name and a game code', 'error');
            return;
        }

        this.gameClient.hostGame(playerName, gameCode);
        this.showStatus('Creating game...', 'info');
    }

    handleJoinGame() {
        const playerName = document.getElementById('playerName').value.trim();
        const gameCode = document.getElementById('gameCode').value.trim();

        if (!playerName || !gameCode) {
            this.showStatus('Please enter your name and the game code', 'error');
            return;
        }

        this.gameClient.joinGame(playerName, gameCode);
        this.showStatus('Joining game...', 'info');
    }

    handleGameHosted(data) {
        this.showStatus(`Game ${data.gameCode} created! Waiting for players...`, 'success');
        this.createWaitingRoom(data.game);
    }

    handleGameJoined(data) {
        this.showStatus('Joined game! Waiting for host to start...', 'success');
        this.createWaitingRoom(data.game);
    }

    handleJoinError(data) {
        this.showStatus(data.message, 'error');
    }

    handleGameStarted(data) {
        // Game started, lobby will be unmounted by parent
        this.showStatus('Game starting...', 'success');
    }

    handlePlayerJoined(data) {
        const { player, game } = data;
        this.showStatus(`${player.name} joined the game!`, 'info');
        this.updateWaitingRoom(game);
    }

    handlePlayerLeft(data) {
        const { playerId, game } = data;
        const player = game.players.find(p => p.id === playerId);
        if (player) {
            this.showStatus(`${player.name} left the game`, 'info');
        }
        this.updateWaitingRoom(game);
    }

    createWaitingRoom(game) {
        // Hide setup form
        this.hide(this.setupForm);

        // Create waiting room
        const waitingRoom = this.createDiv([
            this.createElement('h2', {}, ['Waiting Room']),
            this.createElement('p', {}, [`Game Code: ${game.gameCode}`]),
            this.createDiv([], { id: 'playerList', className: 'player-list' }),
            this.createButton('Start Game', () => this.handleStartGame(game.gameCode), {
                id: 'startButton',
                className: 'start-button'
            })
        ], { id: 'waitingRoom', className: 'waiting-room' });

        // Add waiting room after status message
        this.element.insertBefore(waitingRoom, this.statusMessage.nextSibling);
        
        // Update player list
        this.updateWaitingRoom(game);
    }

    updateWaitingRoom(game) {
        const playerList = document.getElementById('playerList');
        const startButton = document.getElementById('startButton');
        
        if (playerList && startButton) {
            // Update player list
            playerList.innerHTML = '';
            game.players.forEach(player => {
                const playerElement = this.createDiv([
                    `${player.name}${player.id === this.gameClient.getCurrentPlayerId() ? ' (You)' : ''}`
                ], { className: 'player-item' });
                playerList.appendChild(playerElement);
            });

            // Update start button
            const isHost = game.players[0]?.id === this.gameClient.getCurrentPlayerId();
            startButton.disabled = !isHost || game.players.length < 2;
            this.show(startButton);
        }
    }

    handleStartGame(gameCode) {
        this.gameClient.startGame(gameCode);
    }
} 