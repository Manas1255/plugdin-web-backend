const profileService = require('../services/profileService');
const { sendResponse } = require('../utils/responseHelper');
const { getErrorMessage } = require('../errors/errorHelper');
const errorMessages = require('../errors/errorMessages');

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { firstName, lastName, profilePicture, bio } = req.body;

        const payload = {
            firstName,
            lastName,
            bio
        };
        if (req.file) {
            payload.profilePictureFile = {
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
                originalname: req.file.originalname
            };
        } else if (profilePicture !== undefined) {
            payload.profilePicture = profilePicture;
        }

        const result = await profileService.updateProfile(userId, payload);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Update profile error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const result = await profileService.deleteAccount(userId);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Delete account error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { oldPassword, newPassword } = req.body;

        const result = await profileService.changePassword(userId, {
            oldPassword,
            newPassword
        });

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Change password error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

module.exports = {
    updateProfile,
    deleteAccount,
    changePassword
};
