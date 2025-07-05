import { Component } from './Component.js';
import { Lobby } from './Lobby.js';
import { GameBoard } from './GameBoard.js';
import { GameClient } from '../client/GameClient.js';

/**
 * Main game application component
 */
export class GameApp extends Component {
    constructor() {
        const gameClient = new GameClient();
        super(gameClient);
        
        this.lobby = new Lobby(gameClient);
        this.gameBoard = new GameBoard(gameClient);
        this.currentView = null;
    }

    async onCreate() {
        try {
            // Connect to game server
            await this.gameClient.connect();
            
            // Show lobby
            this.showLobby();
            
            // Set up game event handlers
            this.gameClient.on('game-started', () => this.showGameBoard());
            this.gameClient.on('game-won', (data) => this.handleGameWon(data));
        } catch (error) {
            console.error('Failed to connect:', error);
            this.showError('Failed to connect to game server. Please refresh and try again.');
        }
    }

    createElement() {
        return this.createDiv([], { className: 'game-app' });
    }

    onMount() {
        this.onCreate();
    }

    showLobby() {
        if (this.currentView) {
            this.currentView.unmount();
        }
        this.lobby.mount(this.element);
        this.currentView = this.lobby;
    }

    showGameBoard() {
        if (this.currentView) {
            this.currentView.unmount();
        }
        this.gameBoard.mount(this.element);
        this.currentView = this.gameBoard;
    }

    showError(message) {
        const errorElement = this.createDiv([
            this.createElement('h2', {}, ['Error']),
            this.createElement('p', {}, [message]),
            this.createButton('Refresh', () => window.location.reload(), {
                className: 'error-button'
            })
        ], { className: 'error-screen' });

        if (this.currentView) {
            this.currentView.unmount();
        }
        this.element.appendChild(errorElement);
    }

    handleGameWon(data) {
        const winner = this.gameClient.gameState.players.find(p => p.id === data.winner);
        if (!winner) return;

        const winScreen = this.createDiv([
            this.createElement('h2', {}, ['Game Over!']),
            this.createElement('p', {}, [`${winner.name} has won!`]),
            this.createButton('Play Again', () => window.location.reload(), {
                className: 'win-button'
            })
        ], { className: 'win-screen' });

        this.element.appendChild(winScreen);
    }
} 