const userRepository = require('../repositories/userRepository');
const { generateToken, generateRefreshToken } = require('../utils/tokenUtils');

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

    const token = generateToken(newUser._id.toString());
    const refreshToken = generateRefreshToken(newUser._id.toString());

    return {
        success: true,
        statusCode: 201,
        data: {
            user: {
                role: newUser.role,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
                bio: newUser.bio
            },
            tokens: {
                token: token,
                refreshToken: refreshToken
            }
        }
    };
};

const login = async (email, password) => {
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

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
        return {
            success: false,
            statusCode: 401,
            errorKey: 'USER_INVALID_CREDENTIALS'
        };
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return {
            success: false,
            statusCode: 401,
            errorKey: 'USER_INVALID_CREDENTIALS'
        };
    }

    const token = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
        success: true,
        statusCode: 200,
        data: {
            user: {
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio
            },
            tokens: {
                token: token,
                refreshToken: refreshToken
            }
        }
    };
};

const logout = async (userId) => {
    // Logout logic - for JWT tokens, logout is primarily client-side
    // Server-side token invalidation can be added here if token blacklisting is implemented
    return {
        success: true,
        statusCode: 200,
        data: {
            loggedOut: true
        }
    };
};

module.exports = {
    signUpClient,
    login,
    logout
};
