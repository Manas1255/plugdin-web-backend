const userRepository = require('../repositories/userRepository');

const updateProfile = async (userId, { firstName, lastName, profilePicture, bio }) => {
    // Build update object with only provided fields
    const updateData = {};
    
    if (firstName !== undefined) {
        const trimmedFirstName = firstName ? firstName.trim() : '';
        if (!trimmedFirstName || trimmedFirstName.length === 0) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'FIRST_NAME_REQUIRED'
            };
        }
        if (trimmedFirstName.length > 50) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'VALIDATION_ERROR'
            };
        }
        updateData.firstName = trimmedFirstName;
    }

    if (lastName !== undefined) {
        const trimmedLastName = lastName ? lastName.trim() : '';
        if (!trimmedLastName || trimmedLastName.length === 0) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'LAST_NAME_REQUIRED'
            };
        }
        if (trimmedLastName.length > 50) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'VALIDATION_ERROR'
            };
        }
        updateData.lastName = trimmedLastName;
    }

    if (profilePicture !== undefined) {
        updateData.profilePicture = profilePicture ? profilePicture.trim() : null;
    }

    if (bio !== undefined) {
        const trimmedBio = bio ? bio.trim() : '';
        if (trimmedBio && trimmedBio.length > 500) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'VALIDATION_ERROR'
            };
        }
        updateData.bio = trimmedBio || null;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
        // No fields to update, return current user data
        const user = await userRepository.findById(userId);
        if (!user) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'USER_NOT_FOUND'
            };
        }

        return {
            success: true,
            statusCode: 200,
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
                bio: user.bio
            }
        };
    }

    // Update user
    const updatedUser = await userRepository.updateById(userId, updateData);
    
    if (!updatedUser) {
        return {
            success: false,
            statusCode: 404,
            errorKey: 'USER_NOT_FOUND'
        };
    }

    return {
        success: true,
        statusCode: 200,
        data: {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            profilePicture: updatedUser.profilePicture,
            bio: updatedUser.bio
        }
    };
};

const deleteAccount = async (userId) => {
    // Verify user exists before deletion
    const user = await userRepository.findById(userId);
    
    if (!user) {
        return {
            success: false,
            statusCode: 404,
            errorKey: 'USER_NOT_FOUND'
        };
    }

    // Delete the user account
    const deletedUser = await userRepository.deleteById(userId);
    
    if (!deletedUser) {
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR'
        };
    }

    return {
        success: true,
        statusCode: 200,
        data: true // Return boolean as requested
    };
};

module.exports = {
    updateProfile,
    deleteAccount
};
