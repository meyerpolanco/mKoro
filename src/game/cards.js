// Card definitions for Machi Koro
export const cardDefinitions = {
    'wheat-field': { 
        name: 'Wheat Field', 
        cost: 1, 
        color: 'blue', 
        activation: [1], 
        income: 1, 
        effect: 'Get 1 coin from bank on anyone\'s turn' 
    },
    'ranch': { 
        name: 'Ranch', 
        cost: 1, 
        color: 'blue', 
        activation: [2], 
        income: 1, 
        effect: 'Get 1 coin from bank on anyone\'s turn' 
    },
    'forest': { 
        name: 'Forest', 
        cost: 3, 
        color: 'blue', 
        activation: [5], 
        income: 1, 
        effect: 'Get 1 coin from bank on anyone\'s turn' 
    },
    'mine': { 
        name: 'Mine', 
        cost: 6, 
        color: 'blue', 
        activation: [9], 
        income: 5, 
        effect: 'Get 5 coins from bank on anyone\'s turn' 
    },
    'bakery': { 
        name: 'Bakery', 
        cost: 1, 
        color: 'green', 
        activation: [2, 3], 
        income: 1, 
        effect: 'Get 1 coin from bank on your turn' 
    },
    'convenience-store': { 
        name: 'Convenience Store', 
        cost: 2, 
        color: 'green', 
        activation: [4], 
        income: 3, 
        effect: 'Get 3 coins from bank on your turn' 
    },
    'cheese-factory': { 
        name: 'Cheese Factory', 
        cost: 5, 
        color: 'green', 
        activation: [7], 
        income: 3, 
        effect: 'Get 3 coins per Ranch from bank on your turn' 
    },
    'furniture-factory': { 
        name: 'Furniture Factory', 
        cost: 3, 
        color: 'green', 
        activation: [8], 
        income: 3, 
        effect: 'Get 3 coins per Forest from bank on your turn' 
    },
    'cafe': { 
        name: 'Cafe', 
        cost: 2, 
        color: 'red', 
        activation: [3], 
        income: 1, 
        effect: 'Get 1 coin from active player on their turn' 
    },
    'family-restaurant': { 
        name: 'Family Restaurant', 
        cost: 3, 
        color: 'red', 
        activation: [9, 10], 
        income: 2, 
        effect: 'Get 2 coins from active player on their turn' 
    },
};

export const landmarkDefinitions = {
    'train-station': { 
        name: 'Train Station', 
        cost: 4, 
        effect: 'Choose to roll 1 or 2 dice' 
    },
    'shopping-mall': { 
        name: 'Shopping Mall', 
        cost: 10, 
        effect: 'Restaurants and Shops earn +1 coin' 
    },
    'amusement-park': { 
        name: 'Amusement Park', 
        cost: 16, 
        effect: 'Take another turn on doubles' 
    },
    'radio-tower': { 
        name: 'Radio Tower', 
        cost: 22, 
        effect: 'Reroll dice once per turn' 
    }
}; 