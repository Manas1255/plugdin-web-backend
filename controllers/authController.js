const authService = require('../services/authService');
const { sendResponse } = require('../utils/responseHelper');
const { getErrorMessage } = require('../errors/errorHelper');
const errorMessages = require('../errors/errorMessages');

const signUpClient = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const result = await authService.signUpClient(firstName, lastName, email, password);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Sign up error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

module.exports = {
    signUpClient
};
