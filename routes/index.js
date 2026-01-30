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

// Vendor routes
router.use('/api/vendors', require('./vendor'));

// Service routes (includes categories and cities)
router.use('/api/services', require('./service'));

// Vendor application routes
router.use('/api/vendor-applications', require('./vendorApplication'));
router.use('/api', require('./vendorApplication')); // For admin routes

// Booking request routes
router.use('/api/booking-requests', require('./bookingRequest'));
// Vendor booking routes (mounted at /api/vendor to match expected paths)
router.use('/api/vendor', require('./bookingRequest'));

// Add your routes here
// Example: router.use('/api/users', require('./users'));

module.exports = router;
