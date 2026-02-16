// Middleware для защиты от брутфорса
// Отслеживает количество неудачных попыток входа по IP адресу

// Конфигурация защиты
const MAX_ATTEMPTS = 5; // Максимальное количество попыток
const BLOCK_DURATION = 15 * 60 * 1000; // Время блокировки в миллисекундах (15 минут)
const ATTEMPT_WINDOW = 15 * 60 * 1000; // Окно времени для подсчета попыток (15 минут)
const MIN_DELAY = 1000; // Минимальная задержка между попытками (1 секунда)
const MAX_DELAY = 5000; // Максимальная задержка между попытками (5 секунд)

// Хранилище попыток входа (в памяти)
// В продакшене лучше использовать Redis или другую БД
const loginAttempts = new Map();

// Получить IP адрес клиента
function getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
           'unknown';
}

// Очистить старые записи
function cleanupOldAttempts() {
    const now = Date.now();
    for (const [ip, data] of loginAttempts.entries()) {
        // Если блокировка истекла и нет активных попыток, удаляем запись
        if (data.blockedUntil && data.blockedUntil < now && 
            (!data.attempts || data.attempts.length === 0)) {
            loginAttempts.delete(ip);
        } else if (data.attempts) {
            // Удаляем старые попытки из окна времени
            data.attempts = data.attempts.filter(timestamp => 
                now - timestamp < ATTEMPT_WINDOW
            );
            // Если попыток не осталось и блокировки нет, удаляем запись
            if (data.attempts.length === 0 && !data.blockedUntil) {
                loginAttempts.delete(ip);
            }
        }
    }
}

// Периодическая очистка (каждые 5 минут)
setInterval(cleanupOldAttempts, 5 * 60 * 1000);

// Middleware для защиты от брутфорса
const bruteForceProtection = (req, res, next) => {
    const ip = getClientIP(req);
    const now = Date.now();
    
    // Очистка старых записей
    cleanupOldAttempts();
    
    // Получить данные о попытках для этого IP
    let attemptData = loginAttempts.get(ip) || {
        attempts: [],
        blockedUntil: null,
        lastAttempt: null
    };
    
    // Проверить, заблокирован ли IP
    if (attemptData.blockedUntil && attemptData.blockedUntil > now) {
        const remainingMinutes = Math.ceil((attemptData.blockedUntil - now) / 60000);
        return res.status(429).render('login', {
            title: 'Вход - Adapto Dubbing',
            error: `Слишком много неудачных попыток. Попробуйте снова через ${remainingMinutes} ${remainingMinutes === 1 ? 'минуту' : remainingMinutes < 5 ? 'минуты' : 'минут'}.`,
            blocked: true,
            blockedUntil: attemptData.blockedUntil
        });
    }
    
    // Если блокировка истекла, сбросить её
    if (attemptData.blockedUntil && attemptData.blockedUntil <= now) {
        attemptData.blockedUntil = null;
        attemptData.attempts = [];
    }
    
    // Проверить rate limiting - минимальная задержка между попытками
    if (attemptData.lastAttempt) {
        const timeSinceLastAttempt = now - attemptData.lastAttempt;
        const requiredDelay = Math.min(
            MIN_DELAY + (attemptData.attempts.length * 500), 
            MAX_DELAY
        );
        
        if (timeSinceLastAttempt < requiredDelay) {
            const waitTime = Math.ceil((requiredDelay - timeSinceLastAttempt) / 1000);
            return res.status(429).render('login', {
                title: 'Вход - Adapto Dubbing',
                error: `Подождите ${waitTime} ${waitTime === 1 ? 'секунду' : waitTime < 5 ? 'секунды' : 'секунд'} перед следующей попыткой.`,
                rateLimited: true
            });
        }
    }
    
    // Сохранить данные для следующего запроса
    loginAttempts.set(ip, attemptData);
    
    // Добавить функцию для регистрации неудачной попытки
    req.recordFailedAttempt = () => {
        const ip = getClientIP(req);
        const now = Date.now();
        let attemptData = loginAttempts.get(ip) || {
            attempts: [],
            blockedUntil: null,
            lastAttempt: null
        };
        
        // Удалить старые попытки
        attemptData.attempts = attemptData.attempts.filter(timestamp => 
            now - timestamp < ATTEMPT_WINDOW
        );
        
        // Добавить новую попытку
        attemptData.attempts.push(now);
        attemptData.lastAttempt = now;
        
        // Если превышен лимит попыток, заблокировать IP
        if (attemptData.attempts.length >= MAX_ATTEMPTS) {
            attemptData.blockedUntil = now + BLOCK_DURATION;
        }
        
        loginAttempts.set(ip, attemptData);
    };
    
    // Добавить функцию для очистки попыток (при успешном входе)
    req.clearAttempts = () => {
        const ip = getClientIP(req);
        loginAttempts.delete(ip);
    };
    
    // Добавить функцию для получения информации о попытках
    req.getAttemptInfo = () => {
        const ip = getClientIP(req);
        const attemptData = loginAttempts.get(ip);
        if (!attemptData) {
            return { remaining: MAX_ATTEMPTS, blocked: false };
        }
        
        const now = Date.now();
        const remaining = Math.max(0, MAX_ATTEMPTS - attemptData.attempts.length);
        const blocked = attemptData.blockedUntil && attemptData.blockedUntil > now;
        
        return {
            remaining,
            blocked,
            blockedUntil: attemptData.blockedUntil
        };
    };
    
    next();
};

module.exports = {
    bruteForceProtection,
    MAX_ATTEMPTS,
    BLOCK_DURATION
};

