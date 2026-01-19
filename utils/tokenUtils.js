const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key', {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
};

module.exports = {
    generateToken,
    generateRefreshToken
};
