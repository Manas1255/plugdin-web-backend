const vendorApplicationService = require('../services/vendorApplicationService');
const { sendResponse } = require('../utils/responseHelper');
const { getErrorMessage } = require('../errors/errorHelper');
const errorMessages = require('../errors/errorMessages');

/**
 * Apply as vendor
 * POST /api/vendor-applications
 */
const applyAsVendor = async (req, res) => {
    try {
        const result = await vendorApplicationService.applyAsVendor(req.body);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Vendor application error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages),
            stacktrace: error.stack
        });
    }
};

/**
 * Get list of vendor applications (admin only)
 * GET /api/admin/vendor-applications?status=pending&page=1&limit=20
 */
const getApplicationsList = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const result = await vendorApplicationService.getApplicationsList(status, page, limit);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Get applications list error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages),
            stacktrace: error.stack
        });
    }
};

/**
 * Get single vendor application by ID (admin only)
 * GET /api/admin/vendor-applications/:id
 */
const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await vendorApplicationService.getApplicationById(id);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Get application by ID error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages),
            stacktrace: error.stack
        });
    }
};

/**
 * Approve vendor application (admin only, authenticated)
 * POST /api/admin/vendor-applications/:id/approve
 */
const approveApplicationAuth = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user ? req.user._id : null;

        const result = await vendorApplicationService.approveApplication(id, adminId);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Approve application error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages),
            stacktrace: error.stack
        });
    }
};

/**
 * Approve vendor application via email link (no auth required)
 * GET /api/admin/vendor-applications/:id/approve?token=...
 */
const approveApplicationLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.query;

        if (!token) {
            return sendResponse(res, 400, null, {
                message: 'Approval token is required'
            });
        }

        const result = await vendorApplicationService.approveApplication(id, null, token);

        if (!result.success) {
            // Return HTML page for link-based approval
            return res.status(result.statusCode).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Approval Failed</title>
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5; }
                        .container { text-align: center; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .error { color: #f44336; font-size: 24px; margin-bottom: 20px; }
                        .message { color: #666; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error">❌ Approval Failed</div>
                        <div class="message">${getErrorMessage(result.errorKey, errorMessages)}</div>
                    </div>
                </body>
                </html>
            `);
        }

        // Return success HTML page
        return res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Application Approved</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5; }
                    .container { text-align: center; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .success { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
                    .message { color: #666; font-size: 16px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success">✅ Application Approved Successfully!</div>
                    <div class="message">The vendor has been notified via email and can now login to the platform.</div>
                    <div class="message" style="margin-top: 10px;">Vendor Email: ${result.data.vendorEmail}</div>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('Approve application link error:', error);
        return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5; }
                    .container { text-align: center; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .error { color: #f44336; font-size: 24px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error">❌ An error occurred</div>
                </div>
            </body>
            </html>
        `);
    }
};

/**
 * Reject vendor application (admin only, authenticated)
 * POST /api/admin/vendor-applications/:id/reject
 */
const rejectApplicationAuth = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user ? req.user._id : null;

        const result = await vendorApplicationService.rejectApplication(id, adminId);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Reject application error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages),
            stacktrace: error.stack
        });
    }
};

/**
 * Reject vendor application via email link (no auth required)
 * GET /api/admin/vendor-applications/:id/reject?token=...
 */
const rejectApplicationLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.query;

        if (!token) {
            return sendResponse(res, 400, null, {
                message: 'Rejection token is required'
            });
        }

        const result = await vendorApplicationService.rejectApplication(id, null, token);

        if (!result.success) {
            // Return HTML page for link-based rejection
            return res.status(result.statusCode).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rejection Failed</title>
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5; }
                        .container { text-align: center; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .error { color: #f44336; font-size: 24px; margin-bottom: 20px; }
                        .message { color: #666; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error">❌ Rejection Failed</div>
                        <div class="message">${getErrorMessage(result.errorKey, errorMessages)}</div>
                    </div>
                </body>
                </html>
            `);
        }

        // Return success HTML page
        return res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Application Rejected</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5; }
                    .container { text-align: center; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .warning { color: #ff9800; font-size: 24px; margin-bottom: 20px; }
                    .message { color: #666; font-size: 16px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="warning">❌ Application Rejected</div>
                    <div class="message">The vendor application has been rejected.</div>
                    <div class="message" style="margin-top: 10px;">The vendor has been notified via email.</div>
                    <div class="message" style="margin-top: 10px;">Vendor Email: ${result.data.vendorEmail}</div>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('Reject application link error:', error);
        return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5; }
                    .container { text-align: center; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .error { color: #f44336; font-size: 24px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error">❌ An error occurred</div>
                </div>
            </body>
            </html>
        `);
    }
};

module.exports = {
    applyAsVendor,
    getApplicationsList,
    getApplicationById,
    approveApplicationAuth,
    approveApplicationLink,
    rejectApplicationAuth,
    rejectApplicationLink,
    viewApplicationLink
};
