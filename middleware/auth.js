/**
 * Authentication and Authorization Middleware
 * Handles JWT token verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResponse } = require('../utils/responseHelper');
const { getErrorMessage } = require('../errors/errorHelper');
const errorMessages = require('../errors/errorMessages');

/**
 * Authenticate middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendResponse(
                res,
                401,
                null,
                getErrorMessage('TOKEN_REQUIRED', errorMessages)
            );
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            
            // Find user by _id (MongoDB default) or id field
            const user = await User.findById(decoded.userId || decoded.id);

            if (!user) {
                return sendResponse(
                    res,
                    401,
                    null,
                    getErrorMessage('USER_NOT_FOUND', errorMessages)
                );
            }

            // Optional: Check if user account is verified
            // Uncomment when isVerified field is added to User model
            // if (!user.isVerified) {
            //     return sendResponse(
            //         res,
            //         403,
            //         null,
            //         getErrorMessage('ACCOUNT_NOT_VERIFIED', errorMessages)
            //     );
            // }

            req.user = user;
            next();
        } catch (tokenError) {
            return sendResponse(
                res,
                401,
                null,
                getErrorMessage('INVALID_TOKEN', errorMessages)
            );
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return sendResponse(
            res,
            500,
            null,
            getErrorMessage('INTERNAL_ERROR', errorMessages)
        );
    }
};

/**
 * Authorize middleware factory
 * Creates middleware that checks if user has required role
 * 
 * @param {string|string[]} requiredRoles - Single role or array of roles that are allowed
 * @returns {Function} Express middleware function
 */
const authorize = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return sendResponse(
                    res,
                    401,
                    null,
                    getErrorMessage('AUTHENTICATION_REQUIRED', errorMessages)
                );
            }

            // Normalize requiredRoles to array
            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

            // Check if user's role matches any of the required roles
            if (!roles.includes(req.user.role)) {
                return sendResponse(
                    res,
                    403,
                    null,
                    getErrorMessage('ACCESS_DENIED', errorMessages)
                );
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            return sendResponse(
                res,
                500,
                null,
                getErrorMessage('INTERNAL_ERROR', errorMessages)
            );
        }
    };
};

/**
 * Advanced Authorization Middleware (for future Membership/Role model support)
 * 
 * This middleware is prepared for when Membership and Role models are added.
 * Uncomment and modify when those models are available.
 * 
 * Usage example:
 * - authorizeMembership('customer')
 * - authorizeMembership('brand')
 * - authorizeMembership('superAdmin')
 */
/*
const authorizeMembership = (requiredRole) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return sendResponse(
                    res,
                    401,
                    null,
                    getErrorMessage('AUTHENTICATION_REQUIRED', errorMessages)
                );
            }

            const Role = require('../models/Role');
            const Membership = require('../models/Membership');
            
            const role = await Role.findOne({ name: requiredRole });

            if (!role) {
                return sendResponse(
                    res,
                    500,
                    null,
                    getErrorMessage('ROLE_NOT_FOUND', errorMessages)
                );
            }

            let membership;
            
            if (requiredRole === 'customer') {
                membership = await Membership.findOne({
                    user: req.user._id,
                    entityType: 'Customer',
                    role: role._id,
                    status: 'active'
                }).populate('entity');
            } else if (requiredRole === 'superAdmin') {
                membership = await Membership.findOne({
                    user: req.user._id,
                    role: role._id,
                    status: 'active'
                });
            } else {
                const entityType = requiredRole === 'brand' ? 'Brand' : 'Venue';
                
                membership = await Membership.findOne({
                    user: req.user._id,
                    entityType: entityType,
                    role: role._id,
                    status: 'active'
                }).populate('entity');
            }

            if (!membership) {
                return sendResponse(
                    res,
                    403,
                    null,
                    getErrorMessage('ACCESS_DENIED', errorMessages)
                );
            }

            req.membership = membership;
            if (membership.entity) {
                req.entity = membership.entity;
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            return sendResponse(
                res,
                500,
                null,
                getErrorMessage('INTERNAL_ERROR', errorMessages)
            );
        }
    };
};
*/

module.exports = {
    authenticate,
    authorize,
    // authorizeMembership, // Uncomment when Membership/Role models are added
};
