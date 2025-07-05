import { Component } from './Component.js';
import { CARD_DEFINITIONS, LANDMARK_DEFINITIONS } from '../core/cards.js';

/**
 * Game board component that displays the game state
 */
export class GameBoard extends Component {
    constructor(gameClient) {
        super(gameClient);
        this.diceContainer = null;
        this.playersContainer = null;
        this.actionsContainer = null;
        this.logContainer = null;
    }

    createElement() {
        // Create main containers
        this.diceContainer = this.createDiv([], { className: 'dice-container' });
        this.playersContainer = this.createDiv([], { className: 'players-container' });
        this.actionsContainer = this.createDiv([], { className: 'actions-container' });
        this.logContainer = this.createDiv([], { className: 'log-container' });

        // Create dice display
        const dice1 = this.createElement('span', { id: 'dice1', className: 'dice' });
        const dice2 = this.createElement('span', { id: 'dice2', className: 'dice' });
        const diceTotal = this.createElement('span', { id: 'diceTotal', className: 'dice-total' });
        this.diceContainer.appendChild(this.createDiv([dice1, dice2, diceTotal], { id: 'diceResult' }));

        // Create action buttons
        const rollButton = this.createButton('Roll Dice', () => this.handleRollDice(), {
            id: 'rollDiceBtn',
            className: 'action-button'
        });
        const endTurnButton = this.createButton('End Turn', () => this.handleEndTurn(), {
            id: 'endTurnBtn',
            className: 'action-button'
        });
        this.actionsContainer.appendChild(rollButton);
        this.actionsContainer.appendChild(endTurnButton);

        // Create main board
        return this.createDiv([
            this.diceContainer,
            this.playersContainer,
            this.actionsContainer,
            this.logContainer
        ], { className: 'game-board' });
    }

    onMount() {
        // Set up game event handlers
        this.gameClient.on('game-state-update', (data) => this.update(data.game));
        this.gameClient.on('game-action', (data) => this.handleGameAction(data));
        this.gameClient.on('game-error', (data) => this.handleGameError(data));
    }

    update(gameState) {
        if (!gameState) return;

        // Update dice display
        if (gameState.lastRoll) {
            document.getElementById('dice1').textContent = gameState.lastRoll.dice1;
            if (gameState.lastRoll.dice2) {
                document.getElementById('dice2').style.display = 'inline-block';
                document.getElementById('dice2').textContent = gameState.lastRoll.dice2;
            } else {
                document.getElementById('dice2').style.display = 'none';
            }
            document.getElementById('diceTotal').textContent = gameState.lastRoll.total;
            document.getElementById('diceResult').style.display = 'block';
        } else {
            document.getElementById('diceResult').style.display = 'none';
        }

        // Update players
        this.playersContainer.innerHTML = '';
        gameState.players.forEach((player, index) => {
            const isCurrentPlayer = index === gameState.currentPlayerIndex;
            const playerElement = this.createPlayerDisplay(player, isCurrentPlayer);
            this.playersContainer.appendChild(playerElement);
        });

        // Update action buttons
        const isCurrentPlayer = this.gameClient.isCurrentPlayerTurn();
        const rollButton = document.getElementById('rollDiceBtn');
        const endTurnButton = document.getElementById('endTurnBtn');

        if (isCurrentPlayer) {
            rollButton.disabled = gameState.phase !== 'roll';
            endTurnButton.disabled = gameState.phase !== 'buy';
            this.show(this.actionsContainer);
        } else {
            this.hide(this.actionsContainer);
        }
    }

    createPlayerDisplay(player, isCurrentPlayer) {
        // Create buildings display
        const buildingsDiv = this.createDiv([], { className: 'buildings' });
        Object.entries(player.buildings).forEach(([cardType, count]) => {
            if (count > 0) {
                const card = CARD_DEFINITIONS[cardType];
                const cardElement = this.createDiv([
                    `${card.name} (${count})`,
                    this.createElement('span', { className: 'card-info' }, [
                        `[${card.activation.join(',')}] ${card.effect}`
                    ])
                ], {
                    className: `card ${card.color}`,
                    onclick: () => this.handleCardClick(cardType)
                });
                buildingsDiv.appendChild(cardElement);
            }
        });

        // Create landmarks display
        const landmarksDiv = this.createDiv([], { className: 'landmarks' });
        Object.entries(player.landmarks).forEach(([landmarkType, built]) => {
            const landmark = LANDMARK_DEFINITIONS[landmarkType];
            const landmarkElement = this.createDiv([
                landmark.name,
                this.createElement('span', { className: 'card-info' }, [
                    `[${landmark.cost} coins] ${landmark.effect}`
                ])
            ], {
                className: `landmark ${built ? 'built' : 'unbuilt'}`,
                onclick: () => this.handleCardClick(landmarkType)
            });
            landmarksDiv.appendChild(landmarkElement);
        });

        // Create player container
        return this.createDiv([
            this.createDiv([
                `${player.name} (${player.coins} coins)`,
                isCurrentPlayer ? ' - Current Turn' : ''
            ], { className: 'player-header' }),
            buildingsDiv,
            landmarksDiv
        ], {
            className: `player ${isCurrentPlayer ? 'current-player' : ''}`
        });
    }

    handleRollDice() {
        const currentPlayer = this.gameClient.gameState.players[this.gameClient.gameState.currentPlayerIndex];
        const hasTwoDice = currentPlayer.landmarks['train-station'];
        
        // Roll dice
        const dice1 = Math.floor(Math.random() * 6) + 1;
        let dice2 = null;
        
        if (hasTwoDice) {
            const useTwoDice = confirm('Would you like to roll 2 dice?');
            if (useTwoDice) {
                dice2 = Math.floor(Math.random() * 6) + 1;
            }
        }
        
        const total = dice2 ? dice1 + dice2 : dice1;
        const isDouble = dice2 && dice1 === dice2;
        
        this.gameClient.rollDice({ dice1, dice2, total, isDouble });
    }

    handleEndTurn() {
        this.gameClient.endTurn();
    }

    handleCardClick(cardType) {
        if (!this.gameClient.isCurrentPlayerTurn()) return;
        if (this.gameClient.gameState.phase !== 'buy') return;

        const card = CARD_DEFINITIONS[cardType] || LANDMARK_DEFINITIONS[cardType];
        if (!card) return;

        const currentPlayer = this.gameClient.gameState.players[this.gameClient.gameState.currentPlayerIndex];
        if (currentPlayer.coins < card.cost) {
            this.addLogEntry('Not enough coins!', 'error');
            return;
        }

        this.gameClient.buyCard(cardType);
    }

    handleGameAction(data) {
        switch (data.action) {
            case 'roll-dice': {
                const { rollResult, incomeResults } = data.actionData;
                this.addLogEntry(
                    `Rolled ${rollResult.total}${rollResult.isDouble ? ' (Double!)' : ''}`,
                    'dice'
                );
                
                // Log income results
                if (incomeResults?.incomeLog) {
                    incomeResults.incomeLog.forEach(log => {
                        const player = this.gameClient.gameState.players.find(p => p.id === log.playerId);
                        if (!player) return;

                        switch (log.type) {
                            case 'blue':
                                this.addLogEntry(
                                    `${player.name} got ${log.income} coins from ${log.cardName}`,
                                    'income'
                                );
                                break;
                            case 'green':
                                this.addLogEntry(
                                    `${player.name} got ${log.income} coins from ${log.cardName}`,
                                    'income'
                                );
                                break;
                            case 'red':
                                const target = this.gameClient.gameState.players.find(p => p.id === log.targetId);
                                if (target) {
                                    this.addLogEntry(
                                        `${player.name} took ${log.income} coins from ${target.name} (${log.cardName})`,
                                        'income'
                                    );
                                }
                                break;
                        }
                    });
                }
                break;
            }
            case 'buy-card': {
                const { cardName, newCoins } = data.actionData;
                const player = this.gameClient.gameState.players[this.gameClient.gameState.currentPlayerIndex];
                this.addLogEntry(`${player.name} bought ${cardName}`, 'purchase');
                break;
            }
            case 'end-turn': {
                const { extraTurn, nextPlayer } = data.actionData;
                if (extraTurn) {
                    this.addLogEntry('Extra turn from Amusement Park!', 'turn');
                } else if (nextPlayer) {
                    this.addLogEntry(`${nextPlayer.name}'s turn`, 'turn');
                }
                break;
            }
        }
    }

    handleGameError(data) {
        this.addLogEntry(data.message, 'error');
    }

    addLogEntry(message, type = 'info') {
        const entry = this.createDiv([message], {
            className: `log-entry ${type}`
        });
        this.logContainer.appendChild(entry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;

        // Keep log size manageable
        while (this.logContainer.children.length > 50) {
            this.logContainer.removeChild(this.logContainer.firstChild);
        }
    }
} 