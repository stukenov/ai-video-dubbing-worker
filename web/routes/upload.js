const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = require('../config/upload');
const { addVideoToUser } = require('../utils/userStorage');
const { requireAuth } = require('../middleware/auth');

// Загрузка видео
router.post('/upload', requireAuth, (req, res) => {
    upload.single('video')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'Файл слишком большой. Максимальный размер: 500MB' });
                }
                return res.status(400).json({ error: 'Ошибка при загрузке файла: ' + err.message });
            }
            return res.status(400).json({ error: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не был загружен' });
        }
        
        const language = req.body.language;
        if (!language) {
            return res.status(400).json({ error: 'Язык не выбран' });
        }
        
        const pin = req.session.pin;
        if (!pin) {
            return res.status(401).json({ error: 'Не авторизован' });
        }
        
        // Сохраняем информацию о видео в JSON пользователя
        const videoData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            language: language
        };
        
        if (addVideoToUser(pin, videoData)) {
            res.json({
                success: true,
                message: 'Видео успешно загружено',
                filename: req.file.filename,
                language: language
            });
        } else {
            res.status(500).json({ error: 'Ошибка при сохранении данных о видео' });
        }
    });
});

module.exports = router;

