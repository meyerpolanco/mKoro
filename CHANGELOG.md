# Changelog

All notable changes to the Machi Koro Multiplayer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with multiplayer functionality
- Socket.IO integration for real-time game updates
- Basic game mechanics implementation
- Modern UI with responsive design
- Player lobby system with game codes
- Dice rolling system with 1 or 2 dice options
- Card purchasing and resource management
- Turn-based gameplay with phase system
- Game log for tracking actions
- Status messages for user feedback
- Debug and connection test features

### Changed
- Reorganized project structure:
  - Created public/ directory for static assets
  - Created src/ directory for game logic
  - Created tests/ directory for test files
  - Created docs/ directory for documentation
- Split monolithic index.html into components:
  - Extracted CSS to public/css/styles.css
  - Created game logic modules in src/game/
  - Created public/js/main.js for initialization

### Technical Details
- Using Socket.IO 4.7.2 for real-time communication
- Modern ES6+ JavaScript
- Responsive CSS with flexbox and grid
- Mobile-friendly design with media queries
- Error handling and connection management
- Game state synchronization between clients

### Known Issues
- Connection issues with localtunnel
- ngrok requires authentication token
- Need to implement proper error recovery for disconnections
- Game state might desync in poor network conditions

### Future Plans
- Implement proper session management
- Add game state persistence
- Improve error handling and recovery
- Add more detailed game statistics
- Implement spectator mode
- Add game customization options 