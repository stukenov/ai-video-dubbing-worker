const express = require('express');
const router = express.Router();
const { ADMIN_PIN } = require('../config/constants');
const { accessCodes } = require('../utils/accessCodes');
const { getUserData, createUser } = require('../utils/userStorage');
const { bruteForceProtection, MAX_ATTEMPTS } = require('../middleware/bruteForce');

// Страница входа
router.get('/login', bruteForceProtection, (req, res) => {
    if (req.session.authenticated) {
        return res.redirect('/');
    }
    
    const attemptInfo = req.getAttemptInfo();
    res.render('login', {
        title: 'Вход - Adapto Dubbing',
        error: null,
        attemptInfo: attemptInfo
    });
});

// Проверка PIN-кода
router.post('/login', bruteForceProtection, (req, res) => {
    const { pin } = req.body;
    
    // Валидация формата PIN
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        const attemptInfo = req.getAttemptInfo();
        return res.render('login', {
            title: 'Вход - Adapto Dubbing',
            error: 'PIN-код должен состоять из 4 цифр',
            attemptInfo: attemptInfo
        });
    }
    
    // Проверка PIN-кода
    if (accessCodes.has(pin)) {
        // Успешный вход - очищаем попытки
        req.clearAttempts();
        
        // Создаем пользователя, если его еще нет (на случай если файл был удален)
        if (!getUserData(pin)) {
            createUser(pin);
        }
        
        req.session.authenticated = true;
        req.session.pin = pin;
        req.session.isAdmin = (pin === ADMIN_PIN);
        res.redirect('/');
    } else {
        // Неудачная попытка - регистрируем её
        req.recordFailedAttempt();
        const attemptInfo = req.getAttemptInfo();
        
        let errorMessage = 'Неверный PIN-код';
        if (attemptInfo.remaining > 0 && attemptInfo.remaining < MAX_ATTEMPTS) {
            errorMessage += `. Осталось попыток: ${attemptInfo.remaining}`;
        }
        
        res.render('login', {
            title: 'Вход - Adapto Dubbing',
            error: errorMessage,
            attemptInfo: attemptInfo
        });
    }
});

// Выход
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;

