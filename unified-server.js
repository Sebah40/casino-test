// Unified WebSocket Server for Casino Games
// Combines Slots.js, Server.js, and Arcade.js into one application

const fs = require('fs');
const path = require('path');

// Override the config path for all servers
const configPath = process.env.SOCKET_CONFIG_PATH || './socket_config.json';

// Create a default config if not exists
const defaultConfig = {
    "port": "443/slots",
    "host": process.env.HOST || "argentaplay.com",
    "prefix": "https://",
    "host_ws": process.env.HOST || "argentaplay.com",
    "prefix_ws": "wss://",
    "ssl": true
};

// Write config if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
}

// Mock the config reading for child processes
const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function(filename, encoding) {
    if (filename.includes('socket_config.json')) {
        return originalReadFileSync(configPath, encoding);
    }
    return originalReadFileSync.apply(fs, arguments);
};

console.log('Starting Unified Casino WebSocket Server...');
console.log('Configuration:', defaultConfig);

// Get port from environment or use defaults
const PORT = process.env.PORT || 10000;
const SLOTS_OFFSET = 0;     // Main port
const SERVER_OFFSET = 34;   // PORT + 34
const ARCADE_OFFSET = 43;   // PORT + 43

// Start all three servers
Promise.all([
    startSlotsServer(PORT + SLOTS_OFFSET),
    startMainServer(PORT + SERVER_OFFSET),
    startArcadeServer(PORT + ARCADE_OFFSET)
]).then(() => {
    console.log('All servers started successfully!');
    console.log(`Slots: wss://${defaultConfig.host}:${PORT + SLOTS_OFFSET}/slots`);
    console.log(`Main: wss://${defaultConfig.host}:${PORT + SERVER_OFFSET}/casino`);
    console.log(`Arcade: wss://${defaultConfig.host}:${PORT + ARCADE_OFFSET}/arcade`);
}).catch(err => {
    console.error('Failed to start servers:', err);
    process.exit(1);
});

// Function to start Slots server
function startSlotsServer(port) {
    return new Promise((resolve, reject) => {
        try {
            // Override port in the require cache
            process.env.SLOTS_PORT = port;

            // Load and start Slots.js
            console.log(`Starting Slots server on port ${port}...`);
            require('./Slots.js');

            setTimeout(() => {
                console.log(`Slots server started on port ${port}`);
                resolve();
            }, 1000);
        } catch (err) {
            reject(err);
        }
    });
}

// Function to start Main server
function startMainServer(port) {
    return new Promise((resolve, reject) => {
        try {
            // Override port in the require cache
            process.env.SERVER_PORT = port;

            // Load and start Server.js
            console.log(`Starting Main server on port ${port}...`);
            require('./Server.js');

            setTimeout(() => {
                console.log(`Main server started on port ${port}`);
                resolve();
            }, 1000);
        } catch (err) {
            reject(err);
        }
    });
}

// Function to start Arcade server
function startArcadeServer(port) {
    return new Promise((resolve, reject) => {
        try {
            // Override port in the require cache
            process.env.ARCADE_PORT = port;

            // Load and start Arcade.js
            console.log(`Starting Arcade server on port ${port}...`);
            require('./Arcade.js');

            setTimeout(() => {
                console.log(`Arcade server started on port ${port}`);
                resolve();
            }, 1000);
        } catch (err) {
            reject(err);
        }
    });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});