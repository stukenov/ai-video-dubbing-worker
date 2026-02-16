const { ADMIN_PIN } = require('../config/constants');

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Middleware для проверки админ-прав
const requireAdmin = (req, res, next) => {
    if (req.session.authenticated && req.session.isAdmin) {
        next();
    } else {
        res.status(403).send('Доступ запрещен. Требуются права администратора.');
    }
};

module.exports = {
    requireAuth,
    requireAdmin
};

