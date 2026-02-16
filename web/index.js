require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { uploadsDir } = require('./config/paths');

const app = express();

// Trust proxy for correct IP address detection
app.set('trust proxy', true);

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded videos
app.use('/storage/uploads', express.static(uploadsDir));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Load access codes on startup
require('./utils/accessCodes');

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/admin'));
app.use('/', require('./routes/main'));
app.use('/', require('./routes/upload'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
