const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static('.'));

// Store active games
const activeGames = new Map();
const connectedPlayers = new Map();

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Handle game hosting
    socket.on('host-game', (data) => {
        const { playerName, gameCode } = data;
        
        // Create new game
        const game = {
            id: gameCode,
            host: socket.id,
            players: [{
                id: socket.id,
                name: playerName,
                coins: 3,
                buildings: { 'wheat-field': 1, 'bakery': 1 },
                landmarks: {
                    'train-station': false,
                    'shopping-mall': false,
                    'amusement-park': false,
                    'radio-tower': false
                }
            }],
            started: false,
            currentPlayerIndex: 0,
            turn: 1,
            phase: 'roll',
            lastRoll: null
        };
        
        activeGames.set(gameCode, game);
        connectedPlayers.set(socket.id, { gameCode, playerName });
        
        socket.join(gameCode);
        socket.emit('game-hosted', { gameCode, game });
        
        console.log(`Game hosted: ${gameCode} by ${playerName}`);
    });

    // Handle joining games
    socket.on('join-game', (data) => {
        const { playerName, gameCode } = data;
        
        const game = activeGames.get(gameCode);
        if (!game) {
            socket.emit('join-error', { message: 'Game not found!' });
            return;
        }
        
        if (game.started) {
            socket.emit('join-error', { message: 'Game already started!' });
            return;
        }
        
        // Add player to game
        const newPlayer = {
            id: socket.id,
            name: playerName,
            coins: 3,
            buildings: { 'wheat-field': 1, 'bakery': 1 },
            landmarks: {
                'train-station': false,
                'shopping-mall': false,
                'amusement-park': false,
                'radio-tower': false
            }
        };
        
        game.players.push(newPlayer);
        connectedPlayers.set(socket.id, { gameCode, playerName });
        
        socket.join(gameCode);
        socket.emit('game-joined', { game });
        
        // Notify all players in the game
        io.to(gameCode).emit('player-joined', { 
            player: newPlayer, 
            players: game.players 
        });
        
        console.log(`${playerName} joined game ${gameCode}`);
    });

    // Handle starting games
    socket.on('start-game', (data) => {
        const { gameCode } = data;
        const game = activeGames.get(gameCode);
        
        if (game && game.host === socket.id) {
            game.started = true;
            io.to(gameCode).emit('game-started', { game });
            console.log(`Game ${gameCode} started`);
        }
    });

    // Handle game actions
    socket.on('game-action', (data) => {
        const { gameCode, action, actionData } = data;
        const game = activeGames.get(gameCode);
        
        if (game) {
            console.log(`Game action: ${action} in game ${gameCode}`);
            
            // Update game state based on action
            if (action === 'roll-dice') {
                game.lastRoll = actionData.rollResult;
                game.phase = 'buy';
                console.log(`Dice rolled: ${actionData.rollResult.total}`);
            } else if (action === 'buy-card') {
                // Update player state
                const player = game.players.find(p => p.id === socket.id);
                if (player) {
                    player.coins = actionData.newCoins;
                    if (actionData.isLandmark) {
                        player.landmarks[actionData.cardType] = true;
                        console.log(`${player.name} bought landmark: ${actionData.cardType}`);
                    } else {
                        player.buildings[actionData.cardType] = (player.buildings[actionData.cardType] || 0) + 1;
                        console.log(`${player.name} bought building: ${actionData.cardType}`);
                    }
                }
            } else if (action === 'end-turn') {
                game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
                if (game.currentPlayerIndex === 0) {
                    game.turn++;
                }
                game.phase = 'roll';
                console.log(`Turn ended, next player: ${game.players[game.currentPlayerIndex]?.name}`);
            }
            
            // Broadcast action to all players in the game (including sender)
            io.to(gameCode).emit('game-action', { action, actionData });
            
            // Broadcast updated game state
            io.to(gameCode).emit('game-state-update', { game });
        } else {
            console.log(`Game not found: ${gameCode}`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        
        const playerInfo = connectedPlayers.get(socket.id);
        if (playerInfo) {
            const game = activeGames.get(playerInfo.gameCode);
            if (game) {
                // Remove player from game
                game.players = game.players.filter(p => p.id !== socket.id);
                
                if (game.players.length === 0) {
                    // No players left, remove game
                    activeGames.delete(playerInfo.gameCode);
                    console.log(`Game ${playerInfo.gameCode} removed (no players)`);
                } else {
                    // Notify remaining players
                    io.to(playerInfo.gameCode).emit('player-left', { 
                        playerId: socket.id, 
                        players: game.players 
                    });
                }
            }
            
            connectedPlayers.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to play`);
    if (process.env.PORT) {
        console.log(`Deployed to cloud service on port ${PORT}`);
    }
}); 