# Vendor Application Setup Guide

## Quick Start

This guide will help you set up and run the vendor application system.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)
- SendGrid account with API key

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

New packages added:
- `zod` - For request validation
- `@sendgrid/mail` - For email functionality

## Environment Variables

Create or update your `.env` file with the following variables:

```bash
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/plugdin-web-backend

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# SendGrid Email Configuration (REQUIRED)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=no-reply@plugdin.com
ADMIN_REVIEW_EMAIL=admin@plugdin.com

# Application URL (used in email links)
APP_URL=http://localhost:3000

# Server Configuration
PORT=3000
NODE_ENV=development
```

### SendGrid Setup

1. **Create a SendGrid Account**
   - Go to https://sendgrid.com/
   - Sign up for a free account

2. **Create an API Key**
   - Navigate to Settings → API Keys
   - Click "Create API Key"
   - Give it a name (e.g., "PLUGDIN Vendor Application")
   - Choose "Full Access" or at least "Mail Send" access
   - Copy the API key and add it to your `.env` file

3. **Verify Sender Email**
   - Navigate to Settings → Sender Authentication
   - Verify the email address you'll use as `SENDGRID_FROM_EMAIL`
   - SendGrid requires sender verification to send emails

4. **Update Environment Variables**
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=no-reply@plugdin.com  # Must be verified in SendGrid
   ADMIN_REVIEW_EMAIL=admin@plugdin.com      # Where admin notifications go
   ```

## Database Setup

No migrations needed! The VendorApplication collection will be created automatically when the first application is submitted.

### Create an Admin User (Important!)

You need at least one admin user to review applications. Run this script in MongoDB:

```javascript
// Connect to your MongoDB database
use plugdin-web-backend

// Create an admin user
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@plugdin.com",
  password: "$2b$10$YourHashedPasswordHere", // You'll need to hash this
  role: "admin",
  companyName: null,
  bio: "System Administrator",
  profilePicture: null,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**To hash the password**, you can use this Node.js script:

```javascript
const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'your_admin_password_here';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Hashed password:', hash);
}

hashPassword();
```

Or sign up as a client first, then manually update the role to 'admin' in the database:

```javascript
db.users.updateOne(
  { email: "your_email@example.com" },
  { $set: { role: "admin" } }
)
```

## Running the Application

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## Testing the Flow

### 1. Submit a Vendor Application

```bash
curl -X POST http://localhost:3000/api/vendor-applications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Vendor",
    "email": "vendor@example.com",
    "password": "password123",
    "companyName": "Test Company",
    "bio": "We provide excellent services",
    "serviceType": "Photography",
    "typicalResponseTimeToInquiries": "Within 24 hours",
    "bookingAdvanceAndComfortWithWindow": "3-6 months advance",
    "hasBackupEquipment": true,
    "hasStandardServiceAgreement": true
  }'
```

### 2. Check Admin Email

- Admin will receive an email at `ADMIN_REVIEW_EMAIL`
- Email contains approve/reject buttons

### 3. Approve or Reject (via API)

```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@plugdin.com",
    "password": "your_admin_password"
  }'

# List pending applications
curl -X GET "http://localhost:3000/api/admin/vendor-applications?status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Approve an application
curl -X POST http://localhost:3000/api/admin/vendor-applications/APPLICATION_ID/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Vendor Logs In

After approval, vendor can login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Emails Not Sending

1. **Check SendGrid API Key**
   ```bash
   # Verify in .env file
   cat .env | grep SENDGRID_API_KEY
   ```

2. **Check SendGrid Dashboard**
   - Go to https://app.sendgrid.com/
   - Navigate to Activity
   - Look for rejected/bounced emails

3. **Verify Sender Email**
   - Make sure `SENDGRID_FROM_EMAIL` is verified in SendGrid
   - Check Settings → Sender Authentication

4. **Check Application Logs**
   - Look for SendGrid errors in console output
   - Emails are sent asynchronously, check for any errors logged

### "Application Already Pending" Error

- An application with this email already exists
- Check the database: `db.vendorapplications.find({ email: "vendor@example.com" })`
- Either use a different email or delete the existing application

### "Invalid Token" Error (Email Links)

- Token may have expired (48 hour limit)
- Use authenticated admin API endpoints instead
- Or have vendor resubmit application

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# Verify connection string in .env
cat .env | grep MONGO_URI
```

## File Structure

```
models/
  └── VendorApplication.js          # Application data model
  └── User.js                       # Updated with 'admin' role

repositories/
  └── vendorApplicationRepository.js # Database operations

services/
  ├── emailService.js               # SendGrid email functions
  └── vendorApplicationService.js   # Business logic

controllers/
  └── vendorApplicationController.js # HTTP request handlers

routes/
  └── vendorApplication.js          # Route definitions

docs/
  ├── VENDOR_APPLICATION.md         # Full API documentation
  └── VENDOR_APPLICATION_SETUP.md   # This file
```

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/vendor-applications` | Public | Submit vendor application |
| GET | `/api/admin/vendor-applications` | Admin | List all applications |
| GET | `/api/admin/vendor-applications/:id` | Admin | Get single application |
| POST | `/api/admin/vendor-applications/:id/approve` | Admin | Approve (authenticated) |
| GET | `/api/admin/vendor-applications/:id/approve?token=...` | Token | Approve (email link) |
| POST | `/api/admin/vendor-applications/:id/reject` | Admin | Reject (authenticated) |
| GET | `/api/admin/vendor-applications/:id/reject?token=...` | Token | Reject (email link) |

## Security Notes

✅ **What's Secure:**
- Passwords hashed with bcrypt (cost factor 10)
- Passwords NEVER sent via email
- Approval tokens are hashed (SHA-256) and expire in 48 hours
- Admin authentication required for authenticated endpoints
- Email uniqueness enforced

⚠️ **Important:**
- Keep your `.env` file secure and never commit it to version control
- Use strong JWT secret in production
- Rotate SendGrid API keys periodically
- Monitor admin email for suspicious approval requests

## Production Deployment

Before deploying to production:

1. **Update Environment Variables**
   ```bash
   APP_URL=https://yourdomain.com
   SENDGRID_FROM_EMAIL=no-reply@yourdomain.com
   NODE_ENV=production
   ```

2. **Secure Environment Variables**
   - Use your hosting provider's secret management
   - Never commit `.env` to version control

3. **Database Indexes**
   - Indexes are created automatically by Mongoose
   - Verify they exist: `db.vendorapplications.getIndexes()`

4. **Email Rate Limits**
   - SendGrid free tier: 100 emails/day
   - Consider upgrading for production use

5. **Monitoring**
   - Set up logging for email failures
   - Monitor application creation rate
   - Track approval/rejection metrics

## Support

For detailed API documentation, see `VENDOR_APPLICATION.md`.

For issues:
1. Check application logs
2. Verify environment variables
3. Test SendGrid connectivity
4. Check MongoDB connection

---

Last Updated: January 21, 2026
