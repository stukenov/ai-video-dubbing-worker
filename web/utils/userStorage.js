const fs = require('fs');
const path = require('path');
const { dataDir } = require('../config/paths');

// Функции для работы с пользователями (JSON файлы)
function getUserFilePath(pin) {
    return path.join(dataDir, `user-${pin}.json`);
}

function getUserData(pin) {
    const filePath = getUserFilePath(pin);
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error(`Ошибка чтения файла пользователя ${pin}:`, err);
            return null;
        }
    }
    return null;
}

function saveUserData(pin, userData) {
    const filePath = getUserFilePath(pin);
    try {
        fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Ошибка сохранения файла пользователя ${pin}:`, err);
        return false;
    }
}

function createUser(pin) {
    const userData = {
        pin: pin,
        createdAt: new Date().toISOString(),
        videos: []
    };
    return saveUserData(pin, userData);
}

function deleteUser(pin) {
    const filePath = getUserFilePath(pin);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            return true;
        } catch (err) {
            console.error(`Ошибка удаления файла пользователя ${pin}:`, err);
            return false;
        }
    }
    return false;
}

function getAllUsers() {
    const users = [];
    try {
        const files = fs.readdirSync(dataDir);
        files.forEach(file => {
            if (file.startsWith('user-') && file.endsWith('.json')) {
                const pin = file.replace('user-', '').replace('.json', '');
                users.push(pin);
            }
        });
    } catch (err) {
        console.error('Ошибка чтения списка пользователей:', err);
    }
    return users;
}

function addVideoToUser(pin, videoData) {
    const userData = getUserData(pin);
    if (!userData) {
        return false;
    }
    
    userData.videos.push({
        ...videoData,
        uploadedAt: new Date().toISOString()
    });
    
    // Оставляем только последние 50 видео
    if (userData.videos.length > 50) {
        userData.videos = userData.videos.slice(-50);
    }
    
    return saveUserData(pin, userData);
}

module.exports = {
    getUserData,
    saveUserData,
    createUser,
    deleteUser,
    getAllUsers,
    addVideoToUser
};

