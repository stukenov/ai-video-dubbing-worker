const { ADMIN_PIN } = require('../config/constants');
const { getAllUsers, getUserData, createUser } = require('./userStorage');

// Load all users at server startup
const accessCodes = new Set();

function loadAllUsers() {
    const users = getAllUsers();
    users.forEach(pin => {
        accessCodes.add(pin);
    });
    // Add admin PIN if not already present
    if (!accessCodes.has(ADMIN_PIN)) {
        accessCodes.add(ADMIN_PIN);
        // Create admin file if it doesn't exist
        if (!getUserData(ADMIN_PIN)) {
            createUser(ADMIN_PIN);
        }
    }
    console.log(`Loaded ${accessCodes.size} users`);
}

// Load users at startup
loadAllUsers();

module.exports = {
    accessCodes,
    loadAllUsers
};

