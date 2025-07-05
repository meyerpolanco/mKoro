import { gameState, getCurrentPlayer, isCurrentPlayer, checkWinCondition } from './state.js';
import { cardDefinitions, landmarkDefinitions } from './cards.js';
import { emitGameAction } from './networking.js';

export function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('connectionStatus');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
    
    // Auto-hide after 3 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}

export function addLogEntry(message, type = 'game-event') {
    const logDiv = document.getElementById('gameLog');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

export function showLobby() {
    document.getElementById('playersWaiting').style.display = 'block';
    if (gameState.isHost) {
        document.getElementById('startGameBtn').style.display = 'block';
    }
    updatePlayersList();
}

export function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        playerDiv.innerHTML = `
            <strong>${player.name}</strong> ${player.id === 'host' ? '(Host)' : ''}
        `;
        playersList.appendChild(playerDiv);
    });
}

export function handleGameStarted(data) {
    gameState.gameStarted = true;
    gameState.currentPlayerIndex = 0;
    gameState.turn = 1;
    gameState.phase = 'roll';
    
    // Hide connection panel and show game board
    document.getElementById('connectionPanel').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';
    
    updateGameDisplay();
    addLogEntry('Game started!', 'game-event');
}

export function updateGameDisplay() {
    // Update game info
    document.getElementById('currentPlayer').textContent = getCurrentPlayer().name;
    document.getElementById('turnNumber').textContent = gameState.turn;
    document.getElementById('gamePhase').textContent = gameState.phase === 'roll' ? 'Roll Dice' : 'Buy Cards';

    // Update players list
    updateGamePlayersList();
    
    // Update player's buildings and landmarks
    updatePlayerBuildings();
    updatePlayerLandmarks();
    
    // Update available cards
    updateAvailableCards();
    
    // Update UI elements based on current player and phase
    const rollDiceBtn = document.getElementById('rollDiceBtn');
    const turnActions = document.getElementById('turnActions');
    
    if (rollDiceBtn) {
        rollDiceBtn.disabled = !isCurrentPlayer() || gameState.phase !== 'roll';
    }
    
    if (turnActions) {
        turnActions.style.display = (gameState.phase === 'buy' && isCurrentPlayer()) ? 'block' : 'none';
    }
    
    // Update skip button visibility
    updateSkipButton();
}

export function updateGamePlayersList() {
    const playersList = document.getElementById('gamePlayersList');
    playersList.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        if (index === gameState.currentPlayerIndex) {
            playerDiv.classList.add('current-player');
        }
        
        const landmarkCount = Object.values(player.landmarks).filter(built => built).length;
        
        playerDiv.innerHTML = `
            <div class="player-stats">
                <div><strong>${player.name}</strong></div>
                <div>💰 ${player.coins}</div>
                <div>🏛️ ${landmarkCount}/4</div>
            </div>
        `;
        playersList.appendChild(playerDiv);
    });
}

export function updatePlayerBuildings() {
    const buildingsDiv = document.getElementById('playerBuildings');
    buildingsDiv.innerHTML = '';
    
    const currentPlayer = getCurrentPlayer();
    Object.entries(currentPlayer.buildings).forEach(([cardType, count]) => {
        if (count > 0) {
            const card = cardDefinitions[cardType];
            if (card) {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                cardDiv.innerHTML = `
                    <div class="card-name">${card.name}</div>
                    <div class="card-cost">Count: ${count}</div>
                    <div class="card-effect">${card.effect}</div>
                `;
                buildingsDiv.appendChild(cardDiv);
            }
        }
    });
}

export function updatePlayerLandmarks() {
    const landmarksDiv = document.getElementById('playerLandmarks');
    landmarksDiv.innerHTML = '';
    
    const currentPlayer = getCurrentPlayer();
    Object.entries(currentPlayer.landmarks).forEach(([landmarkType, built]) => {
        const landmark = landmarkDefinitions[landmarkType];
        if (landmark) {
            const landmarkDiv = document.createElement('div');
            landmarkDiv.className = 'card';
            if (built) {
                landmarkDiv.classList.add('selected');
            }
            landmarkDiv.innerHTML = `
                <div class="card-name">${landmark.name}</div>
                <div class="card-cost">💰 ${landmark.cost}</div>
                <div class="card-effect">${landmark.effect}</div>
            `;
            
            if (!built && gameState.phase === 'buy' && isCurrentPlayer()) {
                landmarkDiv.onclick = () => buyCard(landmarkType);
            }
            
            landmarksDiv.appendChild(landmarkDiv);
        }
    });
}

export function updateAvailableCards() {
    const cardsDiv = document.getElementById('availableCards');
    cardsDiv.innerHTML = '';
    
    Object.entries(cardDefinitions).forEach(([cardType, card]) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        
        const currentPlayer = getCurrentPlayer();
        const canAfford = currentPlayer.coins >= card.cost;
        const canBuy = gameState.phase === 'buy' && isCurrentPlayer() && canAfford;
        
        if (!canAfford) {
            cardDiv.classList.add('unavailable');
        }
        
        cardDiv.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-cost">💰 ${card.cost}</div>
            <div class="card-effect">${card.effect}</div>
        `;
        
        if (canBuy) {
            cardDiv.onclick = () => buyCard(cardType);
        }
        
        cardsDiv.appendChild(cardDiv);
    });
}

export function updateSkipButton() {
    const skipButton = document.getElementById('skipTurnBtn');
    if (skipButton) {
        skipButton.style.display = (gameState.phase === 'buy' && isCurrentPlayer()) ? 'inline-block' : 'none';
    }
}

export function handleDiceRoll(rollResult) {
    gameState.lastRoll = rollResult;

    // Update dice display
    document.getElementById('dice1').textContent = rollResult.dice1;
    if (rollResult.dice2) {
        document.getElementById('dice2').style.display = 'inline-block';
        document.getElementById('dice2').textContent = rollResult.dice2;
    } else {
        document.getElementById('dice2').style.display = 'none';
    }
    document.getElementById('diceTotal').textContent = rollResult.total;
    document.getElementById('diceResult').style.display = 'block';

    addLogEntry(`${getCurrentPlayer().name} rolled ${rollResult.total}`, 'player-action');

    // Process income phase
    processIncome();
    
    // Move to buy phase
    gameState.phase = 'buy';
    document.getElementById('rollDiceBtn').disabled = true;
    document.getElementById('turnActions').style.display = 'block';
    
    updateGameDisplay();
}

export function handleCardPurchase(actionData) {
    const currentPlayer = getCurrentPlayer();
    currentPlayer.coins = actionData.newCoins;
    
    if (actionData.isLandmark) {
        currentPlayer.landmarks[actionData.cardType] = true;
    } else {
        currentPlayer.buildings[actionData.cardType] = (currentPlayer.buildings[actionData.cardType] || 0) + 1;
    }

    addLogEntry(`${currentPlayer.name} bought ${actionData.cardName}`, 'player-action');
    
    // Check for win condition
    if (checkWinCondition(currentPlayer)) {
        addLogEntry(`${currentPlayer.name} wins!`, 'game-event');
        showStatus(`${currentPlayer.name} wins!`, 'success');
        return;
    }

    // End turn
    handleTurnEnd();
}

export function handleTurnEnd() {
    // Check for amusement park double roll
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer.landmarks['amusement-park'] && gameState.lastRoll.isDouble) {
        addLogEntry(`${currentPlayer.name} gets another turn (doubles + amusement park)!`, 'game-event');
        gameState.phase = 'roll';
        document.getElementById('rollDiceBtn').disabled = false;
        document.getElementById('turnActions').style.display = 'none';
        updateGameDisplay();
        return;
    }

    // Next player
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    if (gameState.currentPlayerIndex === 0) {
        gameState.turn++;
    }
    
    // Reset to roll phase
    gameState.phase = 'roll';
    gameState.lastRoll = null;
    
    // Reset UI elements
    document.getElementById('rollDiceBtn').disabled = false;
    document.getElementById('rollDiceBtn').style.display = 'block';
    document.getElementById('turnActions').style.display = 'none';
    document.getElementById('diceResult').style.display = 'none';
    document.getElementById('diceOptions').style.display = 'none';
    
    updateGameDisplay();
}

function processIncome() {
    const roll = gameState.lastRoll.total;
    
    // Process all players for blue cards (everyone gets income)
    gameState.players.forEach(player => {
        Object.entries(player.buildings).forEach(([cardType, count]) => {
            if (count > 0) {
                const card = cardDefinitions[cardType];
                if (card && card.color === 'blue' && card.activation.includes(roll)) {
                    let income = card.income * count;
                    player.coins += income;
                    addLogEntry(`${player.name} earned ${income} coins from ${card.name}`, 'game-event');
                }
            }
        });
    });

    // Process current player for green cards
    const currentPlayer = getCurrentPlayer();
    Object.entries(currentPlayer.buildings).forEach(([cardType, count]) => {
        if (count > 0) {
            const card = cardDefinitions[cardType];
            if (card && card.color === 'green' && card.activation.includes(roll)) {
                let income = card.income * count;
                
                // Special handling for factories
                if (cardType === 'cheese-factory') {
                    income = (currentPlayer.buildings['ranch'] || 0) * 3;
                } else if (cardType === 'furniture-factory') {
                    income = (currentPlayer.buildings['forest'] || 0) * 3;
                }
                
                currentPlayer.coins += income;
                addLogEntry(`${currentPlayer.name} earned ${income} coins from ${card.name}`, 'game-event');
            }
        }
    });

    // Process red cards (restaurants) - take from current player
    gameState.players.forEach(player => {
        if (player.id === getCurrentPlayer().id) return;
        
        Object.entries(player.buildings).forEach(([cardType, count]) => {
            if (count > 0) {
                const card = cardDefinitions[cardType];
                if (card && card.color === 'red' && card.activation.includes(roll)) {
                    let income = card.income * count;
                    const taken = Math.min(income, currentPlayer.coins);
                    currentPlayer.coins -= taken;
                    player.coins += taken;
                    addLogEntry(`${player.name} took ${taken} coins from ${currentPlayer.name} (${card.name})`, 'game-event');
                }
            }
        });
    });
}

export function buyCard(cardType) {
    if (!isCurrentPlayer()) {
        showStatus('It\'s not your turn!', 'error');
        return;
    }

    if (gameState.phase !== 'buy') {
        showStatus('Not the right phase to buy cards!', 'error');
        return;
    }

    const currentPlayer = getCurrentPlayer();
    const card = cardDefinitions[cardType] || landmarkDefinitions[cardType];
    
    if (!card) return;

    if (currentPlayer.coins < card.cost) {
        showStatus('Not enough coins!', 'error');
        return;
    }

    const isLandmark = !!landmarkDefinitions[cardType];
    const newCoins = currentPlayer.coins - card.cost;

    emitGameAction('buy-card', {
        cardType,
        cardName: card.name,
        newCoins,
        isLandmark
    });
} 