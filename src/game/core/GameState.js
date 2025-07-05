import { CARD_DEFINITIONS, LANDMARK_DEFINITIONS } from './cards.js';

/**
 * Core game state management
 * This class handles all game logic and state mutations
 * It is used by the server as the single source of truth
 */
export class GameState {
    constructor(gameCode) {
        this.gameCode = gameCode;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.turn = 1;
        this.phase = 'waiting'; // waiting, roll, buy
        this.lastRoll = null;
        this.started = false;
    }

    /**
     * Add a new player to the game
     * @param {string} id - Player's socket ID
     * @param {string} name - Player's display name
     * @returns {Object} The created player object
     */
    addPlayer(id, name) {
        if (this.started) {
            throw new Error('Cannot add player to started game');
        }

        const player = {
            id,
            name,
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

        this.players.push(player);
        return player;
    }

    /**
     * Remove a player from the game
     * @param {string} playerId - Player's socket ID
     */
    removePlayer(playerId) {
        const index = this.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            this.players.splice(index, 1);
            // Adjust currentPlayerIndex if needed
            if (this.currentPlayerIndex >= this.players.length) {
                this.currentPlayerIndex = 0;
            }
        }
    }

    /**
     * Start the game if enough players are present
     * @returns {boolean} Whether the game was started
     */
    start() {
        if (this.players.length < 2) {
            return false;
        }
        this.started = true;
        this.phase = 'roll';
        return true;
    }

    /**
     * Get the current player
     * @returns {Object} Current player object
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Check if a player can perform an action
     * @param {string} playerId - Player's socket ID
     * @param {string} action - Action type (roll, buy)
     * @returns {boolean} Whether the action is allowed
     */
    canPerformAction(playerId, action) {
        if (!this.started) return false;
        
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== playerId) return false;

        switch (action) {
            case 'roll':
                return this.phase === 'roll';
            case 'buy':
                return this.phase === 'buy';
            default:
                return false;
        }
    }

    /**
     * Process a dice roll
     * @param {Object} roll - Roll result {dice1, dice2?, total, isDouble}
     * @returns {Object} Income results for all players
     */
    processRoll(roll) {
        if (this.phase !== 'roll') {
            throw new Error('Not in roll phase');
        }

        this.lastRoll = roll;
        this.phase = 'buy';

        // Track income changes to apply them atomically
        const incomeChanges = new Map();
        this.players.forEach(p => incomeChanges.set(p.id, 0));

        // Process all income effects
        const incomeLog = [];
        const currentPlayer = this.getCurrentPlayer();

        // Process in order: blue (all) -> green (current) -> red (others from current)
        this.processBlueCardIncome(roll.total, incomeChanges, incomeLog);
        this.processGreenCardIncome(roll.total, currentPlayer, incomeChanges, incomeLog);
        this.processRedCardIncome(roll.total, currentPlayer, incomeChanges, incomeLog);

        // Apply all changes atomically
        this.players.forEach(player => {
            const change = incomeChanges.get(player.id);
            if (change !== 0) {
                player.coins += change;
            }
        });

        return {
            incomeLog,
            playerStates: this.players.map(p => ({
                id: p.id,
                coins: p.coins
            }))
        };
    }

    /**
     * Process income from blue cards (activates for all players)
     */
    processBlueCardIncome(roll, incomeChanges, incomeLog) {
        this.players.forEach(player => {
            Object.entries(player.buildings).forEach(([cardType, count]) => {
                const card = CARD_DEFINITIONS[cardType];
                if (card?.color === 'blue' && card.activation.includes(roll)) {
                    const income = card.income * count;
                    incomeChanges.set(
                        player.id,
                        (incomeChanges.get(player.id) || 0) + income
                    );
                    incomeLog.push({
                        type: 'blue',
                        playerId: player.id,
                        cardName: card.name,
                        income
                    });
                }
            });
        });
    }

    /**
     * Process income from green cards (activates only for current player)
     */
    processGreenCardIncome(roll, currentPlayer, incomeChanges, incomeLog) {
        Object.entries(currentPlayer.buildings).forEach(([cardType, count]) => {
            const card = CARD_DEFINITIONS[cardType];
            if (card?.color === 'green' && card.activation.includes(roll)) {
                let income = card.income * count;

                // Handle special cases
                if (cardType === 'cheese-factory') {
                    income = (currentPlayer.buildings['ranch'] || 0) * 3;
                } else if (cardType === 'furniture-factory') {
                    income = (currentPlayer.buildings['forest'] || 0) * 3;
                }

                incomeChanges.set(
                    currentPlayer.id,
                    (incomeChanges.get(currentPlayer.id) || 0) + income
                );
                incomeLog.push({
                    type: 'green',
                    playerId: currentPlayer.id,
                    cardName: card.name,
                    income
                });
            }
        });
    }

    /**
     * Process income from red cards (other players take from current player)
     */
    processRedCardIncome(roll, currentPlayer, incomeChanges, incomeLog) {
        this.players.forEach(player => {
            if (player.id === currentPlayer.id) return;

            Object.entries(player.buildings).forEach(([cardType, count]) => {
                const card = CARD_DEFINITIONS[cardType];
                if (card?.color === 'red' && card.activation.includes(roll)) {
                    const income = card.income * count;
                    const currentPlayerTotal = currentPlayer.coins + (incomeChanges.get(currentPlayer.id) || 0);
                    const maxTake = Math.min(income, currentPlayerTotal);

                    if (maxTake > 0) {
                        incomeChanges.set(
                            currentPlayer.id,
                            (incomeChanges.get(currentPlayer.id) || 0) - maxTake
                        );
                        incomeChanges.set(
                            player.id,
                            (incomeChanges.get(player.id) || 0) + maxTake
                        );
                        incomeLog.push({
                            type: 'red',
                            playerId: player.id,
                            targetId: currentPlayer.id,
                            cardName: card.name,
                            income: maxTake
                        });
                    }
                }
            });
        });
    }

    /**
     * Process a card purchase
     * @param {string} playerId - Player's socket ID
     * @param {string} cardType - Type of card to buy
     * @returns {Object} Purchase result
     */
    processPurchase(playerId, cardType) {
        if (this.phase !== 'buy') {
            throw new Error('Not in buy phase');
        }

        const player = this.players.find(p => p.id === playerId);
        if (!player) {
            throw new Error('Player not found');
        }

        const card = CARD_DEFINITIONS[cardType] || LANDMARK_DEFINITIONS[cardType];
        if (!card) {
            throw new Error('Invalid card type');
        }

        if (player.coins < card.cost) {
            throw new Error('Not enough coins');
        }

        // Process purchase
        player.coins -= card.cost;
        if (LANDMARK_DEFINITIONS[cardType]) {
            player.landmarks[cardType] = true;
        } else {
            player.buildings[cardType] = (player.buildings[cardType] || 0) + 1;
        }

        return {
            cardType,
            cardName: card.name,
            newCoins: player.coins,
            isLandmark: !!LANDMARK_DEFINITIONS[cardType]
        };
    }

    /**
     * End the current player's turn
     * @returns {Object} Updated game state info
     */
    endTurn() {
        // Check for amusement park double roll
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer.landmarks['amusement-park'] && 
            this.lastRoll?.isDouble) {
            this.phase = 'roll';
            return {
                extraTurn: true,
                player: currentPlayer
            };
        }

        // Move to next player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        if (this.currentPlayerIndex === 0) {
            this.turn++;
        }

        this.phase = 'roll';
        this.lastRoll = null;

        return {
            extraTurn: false,
            nextPlayer: this.getCurrentPlayer()
        };
    }

    /**
     * Check if a player has won
     * @param {string} playerId - Player's socket ID
     * @returns {boolean} Whether the player has won
     */
    checkWinCondition(playerId) {
        const player = this.players.find(p => p.id === playerId);
        return player && Object.values(player.landmarks).every(built => built);
    }

    /**
     * Get a serializable game state for clients
     * @returns {Object} Game state safe for client consumption
     */
    getClientState() {
        return {
            gameCode: this.gameCode,
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            turn: this.turn,
            phase: this.phase,
            lastRoll: this.lastRoll,
            started: this.started
        };
    }
} 