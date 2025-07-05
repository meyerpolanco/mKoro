# 🏠 Machi Koro - Online Multiplayer

A real-time multiplayer version of the popular board game Machi Koro, built with Node.js, Socket.IO, and vanilla JavaScript.

## 🚀 Features

- **Real-time multiplayer**: Play with friends online from different devices
- **Live game synchronization**: All players see the same game state in real-time
- **Game code sharing**: Simple code-based game joining system
- **Full game mechanics**: All original Machi Koro rules implemented
- **Responsive design**: Works on desktop and mobile devices

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project files**
   ```bash
   # If you have the files locally, navigate to the project directory
   cd mKoro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open the game**
   - Open your web browser
   - Go to `http://localhost:3000`
   - The game will load automatically

## 🎮 How to Play

### Hosting a Game
1. Enter your name in the "Your Name" field
2. Click "Host New Game"
3. A game code will be generated (e.g., "ABC123")
4. Share this code with your friends

### Joining a Game
1. Enter your name in the "Your Name" field
2. Click "Join Game"
3. Enter the game code provided by the host
4. Click "Connect"

### Playing the Game
1. Once all players have joined, the host clicks "Start Game"
2. Players take turns rolling dice and collecting income
3. Use your coins to buy buildings and landmarks
4. First player to build all 4 landmarks wins!

## 🌐 Online Play

### Local Network (Same WiFi)
- All players on the same WiFi network can connect using the host's local IP address
- Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Other players connect to `http://[YOUR_IP]:3000`

### Internet Play (Different Networks)
To play with friends over the internet, you'll need to:

1. **Deploy to a hosting service** (recommended options):
   - **Heroku**: Free tier available
   - **Railway**: Free tier available
   - **Render**: Free tier available
   - **Vercel**: Free tier available

2. **Or use a tunneling service**:
   - **ngrok**: `npx ngrok http 3000`
   - **localtunnel**: `npx localtunnel --port 3000`

## 🔧 Development

### Project Structure
```
mKoro/
├── index.html          # Main game interface
├── server.js           # Node.js server with Socket.IO
├── package.json        # Dependencies and scripts
├── test.html           # Testing utilities
└── README.md           # This file
```

### Key Technologies
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO
- **Game Logic**: Custom implementation of Machi Koro rules

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon to automatically restart the server when files change.

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to server"**
- Make sure the server is running (`npm start`)
- Check that port 3000 is not in use
- Try a different port: `PORT=3001 npm start`

**"Game not found"**
- Verify the game code is correct
- Check that the host is still online
- Try hosting a new game

**"Player disconnected"**
- Players may disconnect if they close their browser or lose internet
- The game continues with remaining players
- Disconnected players can rejoin with the same code

### Debug Mode
Click the "Debug Info" button to see connection status and game state information.

## 📝 Game Rules

Machi Koro is a city-building card game where players:
1. Roll dice to activate buildings and earn coins
2. Use coins to buy new buildings and landmarks
3. First player to build all 4 landmarks wins

### Building Types
- **Blue Buildings**: Activate on anyone's turn
- **Green Buildings**: Activate only on your turn
- **Red Buildings**: Take coins from the active player
- **Landmarks**: Special abilities and win condition

## 🤝 Contributing

Feel free to contribute improvements, bug fixes, or new features!

## 📄 License

This project is open source and available under the MIT License.
