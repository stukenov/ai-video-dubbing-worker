const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { languageNames } = require('../config/constants');
const { uploadsDir } = require('../config/paths');
const { getUserData } = require('../utils/userStorage');
const { requireAuth } = require('../middleware/auth');

// Главная страница (только для авторизованных)
router.get('/', requireAuth, (req, res) => {
    const pin = req.session.pin;
    const userData = getUserData(pin);
    const recentVideos = userData ? userData.videos.slice(-10).reverse().map(video => ({
        ...video,
        languageName: languageNames[video.language] || video.language
    })) : [];
    
    res.render('index', { 
        title: 'Adapto Dubbing',
        message: 'Добро пожаловать в Adapto Dubbing',
        recentVideos: recentVideos
    });
});

// Просмотр видео
router.get('/video/:filename', requireAuth, (req, res) => {
    const pin = req.session.pin;
    const filename = req.params.filename;
    const userData = getUserData(pin);
    
    if (!userData) {
        return res.status(404).send('Пользователь не найден');
    }
    
    // Находим видео по имени файла
    const video = userData.videos.find(v => v.filename === filename);
    
    if (!video) {
        return res.status(404).send('Видео не найдено');
    }
    
    // Проверяем существование файла
    const videoPath = path.join(uploadsDir, filename);
    if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Файл видео не найден');
    }
    
    // Получаем размер файла
    const stats = fs.statSync(videoPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    const videoData = {
        ...video,
        languageName: languageNames[video.language] || video.language,
        fileSizeMB: fileSizeMB,
        filePath: `/storage/uploads/${filename}`
    };
    
    res.render('video', {
        title: `Видео: ${video.originalName}`,
        video: videoData
    });
});

module.exports = router;

