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

// Profile routes
router.use('/api/profile', require('./profile'));

// Service routes (includes categories and cities)
router.use('/api/services', require('./service'));

// Add your routes here
// Example: router.use('/api/users', require('./users'));

module.exports = router;
