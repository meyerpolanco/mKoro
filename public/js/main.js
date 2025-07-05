import { setupSocketListeners, hostGame, joinGame, startGame } from '../../src/game/networking.js';

// Initialize game
function initializeGame() {
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('hostGameBtn').addEventListener('click', () => {
        const playerName = document.getElementById('playerName').value.trim();
        hostGame(playerName);
    });
    
    document.getElementById('joinGameBtn').addEventListener('click', showJoinForm);
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    
    // Game code input
    document.getElementById('gameCode').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const playerName = document.getElementById('playerName').value.trim();
            const gameCode = document.getElementById('gameCode').value.trim().toUpperCase();
            joinGame(playerName, gameCode);
        }
    });
}

function showJoinForm() {
    document.getElementById('gameCodeGroup').style.display = 'block';
    document.getElementById('joinGameBtn').textContent = 'Connect';
    document.getElementById('joinGameBtn').onclick = () => {
        const playerName = document.getElementById('playerName').value.trim();
        const gameCode = document.getElementById('gameCode').value.trim().toUpperCase();
        joinGame(playerName, gameCode);
    };
}

// Initialize the game when page loads
window.addEventListener('load', initializeGame); 