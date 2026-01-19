const express = require('express');
const router = express.Router();

// Basic health check route
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Authentication routes
router.use('/api/auth', require('./auth'));

// Add your routes here
// Example: router.use('/api/users', require('./users'));

module.exports = router;
