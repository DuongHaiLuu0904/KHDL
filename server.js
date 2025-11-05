require('dotenv').config();
const express = require('express');
const path = require('path');
const indexRoutes = require('./routes/index');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware: Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({
    extended: true
}));

// Middleware: Parse JSON bodies
app.use(express.json());

// Use routes from routes/index.js
app.use('/', indexRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Crypto Analysis Dashboard running on http://localhost:${PORT}`);
    console.log(`📊 Visit the homepage to select a cryptocurrency`);
});