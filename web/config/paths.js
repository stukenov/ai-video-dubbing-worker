const path = require('path');
const fs = require('fs');

// Пути для хранения данных
const storageDir = path.join(__dirname, '..', 'storage');
const uploadsDir = path.join(storageDir, 'uploads');
const dataDir = path.join(storageDir, 'data');

// Создаем папки, если их нет
[storageDir, uploadsDir, dataDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

module.exports = {
    storageDir,
    uploadsDir,
    dataDir
};

