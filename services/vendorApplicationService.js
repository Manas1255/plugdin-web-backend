const bcrypt = require('bcrypt');
const crypto = require('crypto');
const vendorApplicationRepository = require('../repositories/vendorApplicationRepository');
const userRepository = require('../repositories/userRepository');
const emailService = require('./emailService');

/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
};

/**
 * Generate a secure token for approve/reject links
 */
const generateApprovalToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash the approval token for storage
 */
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Apply as vendor - Create new vendor application
 */
const applyAsVendor = async (applicationData) => {
    const {
        firstName,
        lastName,
        email,
        password,
        companyName,
        bio,
        instagramHandle,
        websiteOrPortfolioLink,
        serviceType,
        typicalResponseTimeToInquiries,
        bookingAdvanceAndComfortWithWindow,
        hasBackupEquipment,
        hasStandardServiceAgreement,
        additionalBusinessNotes
    } = applicationData;

    // Validation
    if (!firstName || !firstName.trim()) {
        return { success: false, statusCode: 400, errorKey: 'FIRST_NAME_REQUIRED' };
    }
    if (!lastName || !lastName.trim()) {
        return { success: false, statusCode: 400, errorKey: 'LAST_NAME_REQUIRED' };
    }
    if (!email || !email.trim()) {
        return { success: false, statusCode: 400, errorKey: 'EMAIL_REQUIRED' };
    }
    if (!isValidEmail(email)) {
        return { success: false, statusCode: 400, errorKey: 'INVALID_EMAIL_FORMAT' };
    }
    if (!password || password.length < 6) {
        return { success: false, statusCode: 400, errorKey: 'PASSWORD_TOO_SHORT' };
    }
    if (!companyName || !companyName.trim()) {
        return { success: false, statusCode: 400, errorKey: 'COMPANY_NAME_REQUIRED' };
    }
    if (!bio || !bio.trim()) {
        return { success: false, statusCode: 400, errorKey: 'BIO_REQUIRED' };
    }
    if (!serviceType || !serviceType.trim()) {
        return { success: false, statusCode: 400, errorKey: 'SERVICE_TYPE_REQUIRED' };
    }
    if (!typicalResponseTimeToInquiries || !typicalResponseTimeToInquiries.trim()) {
        return { success: false, statusCode: 400, errorKey: 'RESPONSE_TIME_REQUIRED' };
    }
    if (!bookingAdvanceAndComfortWithWindow || !bookingAdvanceAndComfortWithWindow.trim()) {
        return { success: false, statusCode: 400, errorKey: 'BOOKING_ADVANCE_REQUIRED' };
    }
    if (typeof hasBackupEquipment !== 'boolean') {
        return { success: false, statusCode: 400, errorKey: 'BACKUP_EQUIPMENT_REQUIRED' };
    }
    if (typeof hasStandardServiceAgreement !== 'boolean') {
        return { success: false, statusCode: 400, errorKey: 'SERVICE_AGREEMENT_REQUIRED' };
    }

    // Check if application already exists
    const existingApplication = await vendorApplicationRepository.findByEmail(email);
    if (existingApplication) {
        if (existingApplication.status === 'pending') {
            return { 
                success: false, 
                statusCode: 409, 
                errorKey: 'APPLICATION_ALREADY_PENDING' 
            };
        }
        if (existingApplication.status === 'approved') {
            return { 
                success: false, 
                statusCode: 409, 
                errorKey: 'APPLICATION_ALREADY_APPROVED' 
            };
        }
    }

    // Check if user already exists (as vendor or client)
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        return { 
            success: false, 
            statusCode: 409, 
            errorKey: 'EMAIL_ALREADY_EXISTS' 
        };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate approval token
    const approvalToken = generateApprovalToken();
    const hashedToken = hashToken(approvalToken);
    const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

    // Create application
    const newApplication = await vendorApplicationRepository.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        companyName: companyName.trim(),
        bio: bio.trim(),
        instagramHandle: instagramHandle ? instagramHandle.trim() : null,
        websiteOrPortfolioLink: websiteOrPortfolioLink ? websiteOrPortfolioLink.trim() : null,
        serviceType: serviceType.trim(),
        typicalResponseTimeToInquiries: typicalResponseTimeToInquiries.trim(),
        bookingAdvanceAndComfortWithWindow: bookingAdvanceAndComfortWithWindow.trim(),
        hasBackupEquipment,
        hasStandardServiceAgreement,
        additionalBusinessNotes: additionalBusinessNotes ? additionalBusinessNotes.trim() : null,
        status: 'pending',
        approvalToken: hashedToken,
        approvalTokenExpiry: tokenExpiry
    });

    // Send email to admin (non-blocking, log errors)
    try {
        await emailService.sendVendorApplicationToAdmin(newApplication, approvalToken);
    } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
        // Continue - application is created even if email fails
    }

    return {
        success: true,
        statusCode: 201,
        data: {
            message: "Application submitted successfully. You'll receive an email after review.",
            applicationId: newApplication._id
        }
    };
};

/**
 * Get paginated list of vendor applications (admin only)
 */
const getApplicationsList = async (status, page = 1, limit = 20) => {
    const filter = {};
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        filter.status = status;
    }

    const result = await vendorApplicationRepository.findPaginated(
        filter,
        parseInt(page),
        parseInt(limit)
    );

    return {
        success: true,
        statusCode: 200,
        data: {
            applications: result.applications,
            pagination: result.pagination
        }
    };
};

/**
 * Get single vendor application by ID (admin only)
 */
const getApplicationById = async (applicationId) => {
    const application = await vendorApplicationRepository.findById(applicationId);

    if (!application) {
        return {
            success: false,
            statusCode: 404,
            errorKey: 'APPLICATION_NOT_FOUND'
        };
    }

    return {
        success: true,
        statusCode: 200,
        data: { application }
    };
};

/**
 * Approve vendor application (admin only)
 */
const approveApplication = async (applicationId, adminId, token = null) => {
    // Get application with password hash
    const application = await vendorApplicationRepository.findByIdWithPasswordHash(applicationId);

    if (!application) {
        return {
            success: false,
            statusCode: 404,
            errorKey: 'APPLICATION_NOT_FOUND'
        };
    }

    // Check if already processed
    if (application.status === 'approved') {
        return {
            success: false,
            statusCode: 400,
            errorKey: 'APPLICATION_ALREADY_APPROVED'
        };
    }

    if (application.status === 'rejected') {
        return {
            success: false,
            statusCode: 400,
            errorKey: 'APPLICATION_ALREADY_REJECTED'
        };
    }

    // If token is provided, validate it (for link-based approval)
    if (token) {
        const applicationWithToken = await vendorApplicationRepository.findByIdWithToken(applicationId);
        
        if (!applicationWithToken.approvalToken || !applicationWithToken.approvalTokenExpiry) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'INVALID_APPROVAL_TOKEN'
            };
        }

        // Check token expiry
        if (new Date() > applicationWithToken.approvalTokenExpiry) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'APPROVAL_TOKEN_EXPIRED'
            };
        }

        // Validate token
        const hashedProvidedToken = hashToken(token);
        if (hashedProvidedToken !== applicationWithToken.approvalToken) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'INVALID_APPROVAL_TOKEN'
            };
        }
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(application.email);
    if (existingUser) {
        return {
            success: false,
            statusCode: 409,
            errorKey: 'USER_ALREADY_EXISTS'
        };
    }

    // Create vendor user with the stored password hash
    // We need to create the user directly without triggering the pre-save hook
    const User = require('../models/User');
    const newVendor = new User({
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        password: application.passwordHash, // This will be hashed by pre-save hook
        role: 'vendor',
        companyName: application.companyName,
        bio: application.bio,
        profilePicture: null
    });

    // Bypass the password hashing since it's already hashed
    // We'll save it directly to avoid double-hashing
    await User.collection.insertOne({
        firstName: newVendor.firstName,
        lastName: newVendor.lastName,
        email: newVendor.email,
        password: application.passwordHash, // Already hashed
        role: newVendor.role,
        companyName: newVendor.companyName,
        bio: newVendor.bio,
        profilePicture: newVendor.profilePicture,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    // Update application status
    await vendorApplicationRepository.updateById(applicationId, {
        status: 'approved',
        reviewedByAdminId: adminId || null,
        reviewedAt: new Date(),
        approvalToken: null, // Clear token after use
        approvalTokenExpiry: null
    });

    // Send approval email to vendor (non-blocking)
    try {
        await emailService.sendVendorApprovedToVendor(application);
    } catch (emailError) {
        console.error('Failed to send vendor approval email:', emailError);
    }

    return {
        success: true,
        statusCode: 200,
        data: {
            message: 'Vendor application approved successfully',
            vendorEmail: application.email
        }
    };
};

/**
 * Reject vendor application (admin only)
 */
const rejectApplication = async (applicationId, adminId, token = null) => {
    const application = await vendorApplicationRepository.findById(applicationId);

    if (!application) {
        return {
            success: false,
            statusCode: 404,
            errorKey: 'APPLICATION_NOT_FOUND'
        };
    }

    // Check if already processed
    if (application.status === 'approved') {
        return {
            success: false,
            statusCode: 400,
            errorKey: 'APPLICATION_ALREADY_APPROVED'
        };
    }

    if (application.status === 'rejected') {
        return {
            success: false,
            statusCode: 400,
            errorKey: 'APPLICATION_ALREADY_REJECTED'
        };
    }

    // If token is provided, validate it (for link-based rejection)
    if (token) {
        const applicationWithToken = await vendorApplicationRepository.findByIdWithToken(applicationId);
        
        if (!applicationWithToken.approvalToken || !applicationWithToken.approvalTokenExpiry) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'INVALID_APPROVAL_TOKEN'
            };
        }

        // Check token expiry
        if (new Date() > applicationWithToken.approvalTokenExpiry) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'APPROVAL_TOKEN_EXPIRED'
            };
        }

        // Validate token
        const hashedProvidedToken = hashToken(token);
        if (hashedProvidedToken !== applicationWithToken.approvalToken) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'INVALID_APPROVAL_TOKEN'
            };
        }
    }

    // Update application status
    await vendorApplicationRepository.updateById(applicationId, {
        status: 'rejected',
        reviewedByAdminId: adminId || null,
        reviewedAt: new Date(),
        approvalToken: null, // Clear token after use
        approvalTokenExpiry: null
    });

    // Send rejection email to vendor (non-blocking)
    try {
        await emailService.sendVendorRejectedToVendor(application);
    } catch (emailError) {
        console.error('Failed to send vendor rejection email:', emailError);
    }

    return {
        success: true,
        statusCode: 200,
        data: {
            message: 'Vendor application rejected',
            vendorEmail: application.email
        }
    };
};

module.exports = {
    applyAsVendor,
    getApplicationsList,
    getApplicationById,
    approveApplication,
    rejectApplication
};
