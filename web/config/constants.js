// Admin PIN code
const ADMIN_PIN = process.env.ADMIN_PIN || '5128';

// Language names
const languageNames = {
    'ru': 'Русский',
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'ja': '日本語',
    'ko': '한국어',
    'zh': '中文'
};

module.exports = {
    ADMIN_PIN,
    languageNames
};

