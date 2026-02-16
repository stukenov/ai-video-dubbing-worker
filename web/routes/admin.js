const express = require('express');
const router = express.Router();
const { ADMIN_PIN } = require('../config/constants');
const { accessCodes } = require('../utils/accessCodes');
const { createUser, deleteUser } = require('../utils/userStorage');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Админ-панель
router.get('/admin', requireAuth, requireAdmin, (req, res) => {
    res.render('admin', {
        title: 'Админ-панель - Adapto Dubbing'
    });
});

// Страница создания PIN-кодов (только для админов)
router.get('/admin/codes', requireAuth, requireAdmin, (req, res) => {
    res.render('admin-codes', {
        title: 'Управление кодами доступа',
        codes: Array.from(accessCodes),
        adminPin: ADMIN_PIN
    });
});

// Создание нового PIN-кода
router.post('/admin/codes', requireAuth, requireAdmin, (req, res) => {
    const { pin } = req.body;
    
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        return res.render('admin-codes', {
            title: 'Управление кодами доступа',
            codes: Array.from(accessCodes),
            adminPin: ADMIN_PIN,
            error: 'PIN-код должен состоять из 4 цифр'
        });
    }
    
    if (accessCodes.has(pin)) {
        return res.render('admin-codes', {
            title: 'Управление кодами доступа',
            codes: Array.from(accessCodes),
            adminPin: ADMIN_PIN,
            error: 'Этот PIN-код уже существует'
        });
    }
    
    // Создаем пользователя (JSON файл)
    if (createUser(pin)) {
        accessCodes.add(pin);
        res.redirect('/admin/codes');
    } else {
        return res.render('admin-codes', {
            title: 'Управление кодами доступа',
            codes: Array.from(accessCodes),
            adminPin: ADMIN_PIN,
            error: 'Ошибка при создании пользователя'
        });
    }
});

// Удаление PIN-кода
router.post('/admin/codes/delete', requireAuth, requireAdmin, (req, res) => {
    const { pin } = req.body;
    // Нельзя удалить админ-код
    if (pin !== ADMIN_PIN) {
        accessCodes.delete(pin);
        deleteUser(pin);
    }
    res.redirect('/admin/codes');
});

module.exports = router;

