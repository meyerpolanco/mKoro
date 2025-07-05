# Machi Koro Online

A web-based multiplayer implementation of the popular Machi Koro board game.

## Features

- Real-time multiplayer gameplay using Socket.IO
- Modern, responsive UI
- Game state synchronization across all players
- Support for all base game cards and landmarks
- Game lobby system with unique game codes

## Project Structure

```
machi-koro/
├── public/           # Static assets served to clients
│   ├── css/         # Stylesheets
│   │   └── styles.css
│   ├── js/          # Client-side JavaScript
│   │   └── main.js
│   └── index.html   # Main HTML file
├── src/             # Source code
│   ├── components/  # UI components
│   └── game/        # Game logic
│       ├── cards.js       # Card definitions
│       ├── networking.js  # Socket.IO client code
│       ├── state.js      # Game state management
│       └── ui.js         # UI update functions
├── server.js        # Express/Socket.IO server
├── package.json     # Project dependencies
└── README.md        # This file
```

## Prerequisites

- Node.js >= 18.0.0
- npm (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/machi-koro.git
   cd machi-koro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Game

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

For development with auto-reload:
```bash
npm run dev
```

## How to Play

1. Host a new game or join an existing one using a game code
2. Wait for at least 2 players to join
3. Host can start the game when ready
4. On your turn:
   - Roll dice (1 or 2 if you have the Train Station)
   - Collect income based on the roll
   - Buy one card or landmark (optional)

## Game Rules

### Starting Setup
- Each player starts with:
  - 3 coins
  - 1 Wheat Field (blue)
  - 1 Bakery (green)

### Landmarks
- Train Station (4 coins): Roll 1 or 2 dice
- Shopping Mall (10 coins): Restaurants and Shops earn +1 coin
- Amusement Park (16 coins): Take another turn on doubles
- Radio Tower (22 coins): Reroll dice once per turn

### Winning
Build all 4 landmarks to win the game!

## Deployment

The game is configured for deployment on Render.com. See `render.yaml` for configuration details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Machi Koro board game designed by Masao Suganuma
- Socket.IO for real-time communication
- Express.js team
