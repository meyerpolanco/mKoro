import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { GameState } from './src/game/core/GameState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static('public'));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Serve index.html for all routes to support client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store active games and player connections
const activeGames = new Map(); // gameCode -> GameState
const playerConnections = new Map(); // socketId -> { gameCode, name }

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Host game
    socket.on('host-game', ({ playerName, gameCode }) => {
        console.log(`${playerName} is hosting game ${gameCode}`);
        
        const game = new GameState(gameCode);
        const player = game.addPlayer(socket.id, playerName);
        
        activeGames.set(gameCode, game);
        playerConnections.set(socket.id, { gameCode, name: playerName });
        
        socket.join(gameCode);
        socket.emit('game-hosted', { 
            gameCode, 
            game: game.getClientState() 
        });
    });

    // Join game
    socket.on('join-game', ({ playerName, gameCode }) => {
        console.log(`${playerName} is joining game ${gameCode}`);
        
        const game = activeGames.get(gameCode);
        if (!game) {
            socket.emit('join-error', { message: 'Game not found!' });
            return;
        }
        
        if (game.started) {
            socket.emit('join-error', { message: 'Game already started!' });
            return;
        }
        
        try {
            const player = game.addPlayer(socket.id, playerName);
            playerConnections.set(socket.id, { gameCode, name: playerName });
            
            socket.join(gameCode);
            socket.emit('game-joined', { game: game.getClientState() });
            
            // Notify all players
            io.to(gameCode).emit('player-joined', { 
                player,
                game: game.getClientState()
            });
        } catch (error) {
            socket.emit('join-error', { message: error.message });
        }
    });

    // Start game
    socket.on('start-game', ({ gameCode }) => {
        const game = activeGames.get(gameCode);
        if (!game) return;
        
        const playerConnection = playerConnections.get(socket.id);
        if (!playerConnection || playerConnection.gameCode !== gameCode) return;
        
        if (game.start()) {
            io.to(gameCode).emit('game-started', { 
                game: game.getClientState() 
            });
        }
    });

    // Game actions
    socket.on('game-action', ({ gameCode, action, actionData }) => {
        const game = activeGames.get(gameCode);
        if (!game) return;
        
        try {
            switch (action) {
                case 'roll-dice': {
                    if (!game.canPerformAction(socket.id, 'roll')) {
                        throw new Error('Cannot roll dice now');
                    }
                    
                    const result = game.processRoll(actionData.rollResult);
                    
                    // Broadcast roll result and income changes
                    io.to(gameCode).emit('game-action', {
                        action: 'roll-dice',
                        actionData: {
                            ...actionData,
                            incomeResults: result
                        }
                    });
                    
                    // Send updated game state
                    io.to(gameCode).emit('game-state-update', {
                        game: game.getClientState()
                    });
                    break;
                }
                
                case 'buy-card': {
                    if (!game.canPerformAction(socket.id, 'buy')) {
                        throw new Error('Cannot buy cards now');
                    }
                    
                    const result = game.processPurchase(socket.id, actionData.cardType);
                    
                    // Broadcast purchase result
                    io.to(gameCode).emit('game-action', {
                        action: 'buy-card',
                        actionData: result
                    });
                    
                    // Check win condition
                    if (game.checkWinCondition(socket.id)) {
                        io.to(gameCode).emit('game-won', {
                            winner: socket.id,
                            game: game.getClientState()
                        });
                        return;
                    }
                    
                    // Send updated game state
                    io.to(gameCode).emit('game-state-update', {
                        game: game.getClientState()
                    });
                    break;
                }
                
                case 'end-turn': {
                    if (!game.canPerformAction(socket.id, 'buy')) {
                        throw new Error('Cannot end turn now');
                    }
                    
                    const result = game.endTurn();
                    
                    // Broadcast turn end result
                    io.to(gameCode).emit('game-action', {
                        action: 'end-turn',
                        actionData: result
                    });
                    
                    // Send updated game state
                    io.to(gameCode).emit('game-state-update', {
                        game: game.getClientState()
                    });
                    break;
                }
            }
        } catch (error) {
            // Send error only to the player who caused it
            socket.emit('game-error', {
                action,
                message: error.message
            });
        }
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        const playerConnection = playerConnections.get(socket.id);
        if (playerConnection) {
            const { gameCode } = playerConnection;
            const game = activeGames.get(gameCode);
            
            if (game) {
                game.removePlayer(socket.id);
                
                if (game.players.length === 0) {
                    // Remove empty game
                    activeGames.delete(gameCode);
                    console.log(`Game ${gameCode} removed (no players)`);
                } else {
                    // Notify remaining players
                    io.to(gameCode).emit('player-left', {
                        playerId: socket.id,
                        game: game.getClientState()
                    });
                }
            }
            
            playerConnections.delete(socket.id);
        }
        
        console.log('Player disconnected:', socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to play`);
}); 