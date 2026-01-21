const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'plugdintemporary@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_REVIEW_EMAIL || 'plugdintemporary@gmail.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * Send vendor application notification to admin
 * @param {Object} application - VendorApplication document
 * @param {string} approvalToken - Token for approve/reject links
 */
const sendVendorApplicationToAdmin = async (application, approvalToken) => {
    try {
        const approveUrl = `${APP_URL}/api/admin/vendor-applications/${application._id}/approve?token=${approvalToken}`;
        const rejectUrl = `${APP_URL}/api/admin/vendor-applications/${application._id}/reject?token=${approvalToken}`;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: bold; color: #555; }
        .field-value { margin-top: 5px; }
        .button-container { text-align: center; margin-top: 30px; padding: 20px; }
        .button { 
            display: inline-block; 
            padding: 12px 30px; 
            margin: 0 10px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold;
            color: white;
        }
        .approve-button { background-color: #4CAF50; }
        .reject-button { background-color: #f44336; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Vendor Application</h1>
        </div>
        <div class="content">
            <h2>Personal Information</h2>
            <div class="field">
                <div class="field-label">Name:</div>
                <div class="field-value">${application.firstName} ${application.lastName}</div>
            </div>
            <div class="field">
                <div class="field-label">Email:</div>
                <div class="field-value">${application.email}</div>
            </div>
            
            <h2>Business Information</h2>
            <div class="field">
                <div class="field-label">Company Name:</div>
                <div class="field-value">${application.companyName}</div>
            </div>
            <div class="field">
                <div class="field-label">Service Type:</div>
                <div class="field-value">${application.serviceType}</div>
            </div>
            <div class="field">
                <div class="field-label">Bio:</div>
                <div class="field-value">${application.bio}</div>
            </div>
            ${application.instagramHandle ? `
            <div class="field">
                <div class="field-label">Instagram:</div>
                <div class="field-value">@${application.instagramHandle}</div>
            </div>` : ''}
            ${application.websiteOrPortfolioLink ? `
            <div class="field">
                <div class="field-label">Website/Portfolio:</div>
                <div class="field-value"><a href="${application.websiteOrPortfolioLink}">${application.websiteOrPortfolioLink}</a></div>
            </div>` : ''}
            
            <h2>Operational Details</h2>
            <div class="field">
                <div class="field-label">Typical Response Time to Inquiries:</div>
                <div class="field-value">${application.typicalResponseTimeToInquiries}</div>
            </div>
            <div class="field">
                <div class="field-label">Booking Advance & Comfort with Window:</div>
                <div class="field-value">${application.bookingAdvanceAndComfortWithWindow}</div>
            </div>
            <div class="field">
                <div class="field-label">Has Backup Equipment:</div>
                <div class="field-value">${application.hasBackupEquipment ? 'Yes' : 'No'}</div>
            </div>
            <div class="field">
                <div class="field-label">Has Standard Service Agreement:</div>
                <div class="field-value">${application.hasStandardServiceAgreement ? 'Yes' : 'No'}</div>
            </div>
            ${application.additionalBusinessNotes ? `
            <div class="field">
                <div class="field-label">Additional Notes:</div>
                <div class="field-value">${application.additionalBusinessNotes}</div>
            </div>` : ''}
            
            <div class="button-container">
                <a href="${approveUrl}" class="button approve-button">✓ APPROVE</a>
                <a href="${rejectUrl}" class="button reject-button">✗ REJECT</a>
            </div>
        </div>
        <div class="footer">
            <p>This link will expire in 48 hours.</p>
            <p>You can also review this application in the admin panel.</p>
        </div>
    </div>
</body>
</html>
        `;

        const msg = {
            to: ADMIN_EMAIL,
            from: FROM_EMAIL,
            subject: `New Vendor Application: ${application.firstName} ${application.lastName} - ${application.companyName}`,
            html: htmlContent,
            text: `New vendor application from ${application.firstName} ${application.lastName} (${application.email}).
            
Company: ${application.companyName}
Service Type: ${application.serviceType}

Approve: ${approveUrl}
Reject: ${rejectUrl}

This link expires in 48 hours.`
        };

        await sgMail.send(msg);
        console.log(`Vendor application email sent to admin for ${application.email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending vendor application email to admin:', error);
        throw error;
    }
};

/**
 * Send approval confirmation to vendor
 * @param {Object} application - VendorApplication document
 */
const sendVendorApprovedToVendor = async (application) => {
    try {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .button { 
            display: inline-block; 
            padding: 15px 40px; 
            margin: 20px 0; 
            background-color: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold;
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Congratulations!</h1>
            <h2>Your Vendor Application Has Been Approved</h2>
        </div>
        <div class="content">
            <p>Dear ${application.firstName},</p>
            
            <p>Great news! Your vendor application for <strong>${application.companyName}</strong> has been approved by our admin team.</p>
            
            <p>You can now login to the PLUGDIN platform using:</p>
            <ul>
                <li><strong>Email:</strong> ${application.email}</li>
                <li><strong>Password:</strong> The password you set during application</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="${APP_URL}/login" class="button">LOGIN NOW</a>
            </div>
            
            <p>Welcome to PLUGDIN! We're excited to have you as part of our vendor community.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
            
            <p>Best regards,<br>The PLUGDIN Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        `;

        const msg = {
            to: application.email,
            from: FROM_EMAIL,
            subject: 'Welcome to PLUGDIN - Your Vendor Application Has Been Approved! 🎉',
            html: htmlContent,
            text: `Congratulations ${application.firstName}!

Your vendor application for ${application.companyName} has been approved.

You can now login using:
- Email: ${application.email}
- Password: The password you set during application

Login at: ${APP_URL}/login

Welcome to PLUGDIN!

Best regards,
The PLUGDIN Team`
        };

        await sgMail.send(msg);
        console.log(`Approval email sent to vendor ${application.email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending approval email to vendor:', error);
        throw error;
    }
};

/**
 * Send rejection notification to vendor
 * @param {Object} application - VendorApplication document
 */
const sendVendorRejectedToVendor = async (application) => {
    try {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Vendor Application Update</h1>
        </div>
        <div class="content">
            <p>Dear ${application.firstName},</p>
            
            <p>Thank you for your interest in joining PLUGDIN as a vendor with <strong>${application.companyName}</strong>.</p>
            
            <p>After careful review, we regret to inform you that we are unable to approve your vendor application at this time.</p>
            
            <p>This decision does not reflect on your business or capabilities. We receive many applications and must carefully select vendors that best fit our current platform needs and capacity.</p>
            
            <p>We encourage you to apply again in the future as our needs and platform evolve.</p>
            
            <p>If you have any questions about this decision, please feel free to contact our support team.</p>
            
            <p>Best regards,<br>The PLUGDIN Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        `;

        const msg = {
            to: application.email,
            from: FROM_EMAIL,
            subject: 'PLUGDIN Vendor Application Update',
            html: htmlContent,
            text: `Dear ${application.firstName},

Thank you for your interest in joining PLUGDIN as a vendor with ${application.companyName}.

After careful review, we regret to inform you that we are unable to approve your vendor application at this time.

This decision does not reflect on your business or capabilities. We receive many applications and must carefully select vendors that best fit our current platform needs and capacity.

We encourage you to apply again in the future as our needs and platform evolve.

Best regards,
The PLUGDIN Team`
        };

        await sgMail.send(msg);
        console.log(`Rejection email sent to vendor ${application.email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending rejection email to vendor:', error);
        throw error;
    }
};

module.exports = {
    sendVendorApplicationToAdmin,
    sendVendorApprovedToVendor,
    sendVendorRejectedToVendor
};
