import { GameApp } from '/src/game/ui/GameApp.js';

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new GameApp();
    app.mount(document.getElementById('app'));
}); 