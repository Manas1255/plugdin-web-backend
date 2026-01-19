const userRepository = require('../repositories/userRepository');

const isValidEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
};

const signUpClient = async (firstName, lastName, email, password) => {
    if (!firstName) {
        return {
            success: false,
            statusCode: 400,
            errorKey: 'FIRST_NAME_REQUIRED'
        };
    }

    if (!lastName) {
        return {
            success: false,
            statusCode: 400,
            errorKey: 'LAST_NAME_REQUIRED'
        };
    }

    if (!email) {
        return {
            success: false,
            statusCode: 400,
            errorKey: 'EMAIL_REQUIRED'
        };
    }

    if (!password) {
        return {
            success: false,
            statusCode: 400,
            errorKey: 'PASSWORD_REQUIRED'
        };
    }

    if (!isValidEmail(email)) {
        return {
            success: false,
            statusCode: 400,
            errorKey: 'INVALID_EMAIL_FORMAT'
        };
    }

    if (password.length < 6) {
        return {
            success: false,
            statusCode: 400,
            errorKey: 'PASSWORD_TOO_SHORT'
        };
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        return {
            success: false,
            statusCode: 409,
            errorKey: 'EMAIL_ALREADY_EXISTS'
        };
    }

    const newUser = await userRepository.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role: 'client',
        profilePicture: null,
        bio: null
    });

    return {
        success: true,
        statusCode: 201,
        data: {
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            profilePicture: newUser.profilePicture,
            bio: newUser.bio
        }
    };
};

module.exports = {
    signUpClient
};
