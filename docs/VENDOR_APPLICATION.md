# Vendor Application & Admin Approval Flow

## Overview

This document describes the vendor onboarding flow where vendors cannot sign up directly. They must apply first, and their application remains **PENDING** until an admin approves or rejects it.

## Flow Summary

1. **Vendor applies** → Application stored with status `pending`
2. **Admin receives email** → With approve/reject buttons (secure links)
3. **Admin approves** → Vendor user account created, vendor receives "accepted" email
4. **Admin rejects** → Application marked rejected, vendor receives "rejected" email

## Security Features

- ✅ Passwords are hashed using bcrypt (never stored in plain text)
- ✅ Passwords are NEVER emailed to vendors
- ✅ Approval/reject links use secure tokens (SHA-256 hashed)
- ✅ Tokens expire after 48 hours
- ✅ Admin authentication required for authenticated endpoints
- ✅ Duplicate applications prevented

## Environment Variables

Add these to your `.env` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=no-reply@plugdin.com
ADMIN_REVIEW_EMAIL=admin@plugdin.com

# Application URL (for email links)
APP_URL=http://localhost:3000

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

## API Endpoints

### 1. Apply as Vendor (Public)

**Endpoint:** `POST /api/vendor-applications`

**Description:** Allows vendors to submit an application to join the platform.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "companyName": "John's Photography",
  "bio": "Professional wedding photographer with 10 years of experience...",
  "serviceType": "Photography",
  "typicalResponseTimeToInquiries": "Within 24 hours",
  "bookingAdvanceAndComfortWithWindow": "I typically book 3-6 months in advance and am comfortable with PLUGDIN's 1-88 day booking window",
  "hasBackupEquipment": true,
  "hasStandardServiceAgreement": true,
  "instagramHandle": "johnphotography",
  "websiteOrPortfolioLink": "https://johnphotography.com",
  "additionalBusinessNotes": "I have backup photographers available for all bookings"
}
```

**Required Fields:**
- `firstName` (string)
- `lastName` (string)
- `email` (string, valid email format)
- `password` (string, min 6 characters)
- `companyName` (string)
- `bio` (string)
- `serviceType` (string)
- `typicalResponseTimeToInquiries` (string)
- `bookingAdvanceAndComfortWithWindow` (string)
- `hasBackupEquipment` (boolean)
- `hasStandardServiceAgreement` (boolean)

**Optional Fields:**
- `instagramHandle` (string)
- `websiteOrPortfolioLink` (string)
- `additionalBusinessNotes` (string)

**Success Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "message": "Application submitted successfully. You'll receive an email after review.",
    "applicationId": "64abc123..."
  },
  "error": null
}
```

**Error Responses:**
- `400` - Validation error (missing required fields)
- `409` - Email already exists (as user or pending/approved application)

---

### 2. Get Applications List (Admin Only)

**Endpoint:** `GET /api/admin/vendor-applications`

**Authentication:** Required (Admin role)

**Query Parameters:**
- `status` (optional): Filter by status - `pending`, `approved`, or `rejected`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Example Request:**
```
GET /api/admin/vendor-applications?status=pending&page=1&limit=20
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "applications": [
      {
        "id": "64abc123...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "companyName": "John's Photography",
        "serviceType": "Photography",
        "status": "pending",
        "createdAt": "2026-01-20T10:30:00.000Z",
        "updatedAt": "2026-01-20T10:30:00.000Z",
        "reviewedByAdminId": null,
        "reviewedAt": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "limit": 20
    }
  },
  "error": null
}
```

---

### 3. Get Single Application (Admin Only)

**Endpoint:** `GET /api/admin/vendor-applications/:id`

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "application": {
      "id": "64abc123...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "companyName": "John's Photography",
      "bio": "Professional wedding photographer...",
      "instagramHandle": "johnphotography",
      "websiteOrPortfolioLink": "https://johnphotography.com",
      "serviceType": "Photography",
      "typicalResponseTimeToInquiries": "Within 24 hours",
      "bookingAdvanceAndComfortWithWindow": "3-6 months advance...",
      "hasBackupEquipment": true,
      "hasStandardServiceAgreement": true,
      "additionalBusinessNotes": "Backup photographers available",
      "status": "pending",
      "createdAt": "2026-01-20T10:30:00.000Z",
      "updatedAt": "2026-01-20T10:30:00.000Z"
    }
  },
  "error": null
}
```

**Error Responses:**
- `404` - Application not found

---

### 4. Approve Application (Admin - Authenticated)

**Endpoint:** `POST /api/admin/vendor-applications/:id/approve`

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "message": "Vendor application approved successfully",
    "vendorEmail": "john@example.com"
  },
  "error": null
}
```

**What Happens:**
1. Creates a vendor user account with role `vendor`
2. User can login with their email and password they set during application
3. Application status updated to `approved`
4. Vendor receives approval email

**Error Responses:**
- `400` - Application already approved/rejected
- `404` - Application not found
- `409` - User already exists

---

### 5. Approve Application (Email Link - No Auth)

**Endpoint:** `GET /api/admin/vendor-applications/:id/approve?token=<secure_token>`

**Authentication:** None (token-based)

**Description:** This endpoint is accessed via the approve button in the admin email. Returns an HTML page.

**Success Response:** HTML page confirming approval

**Error Responses:**
- `400` - Invalid or expired token
- `400` - Application already processed
- `404` - Application not found

**Note:** Token expires after 48 hours.

---

### 6. Reject Application (Admin - Authenticated)

**Endpoint:** `POST /api/admin/vendor-applications/:id/reject`

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "message": "Vendor application rejected",
    "vendorEmail": "john@example.com"
  },
  "error": null
}
```

**What Happens:**
1. Application status updated to `rejected`
2. Vendor receives rejection email
3. No user account is created

**Error Responses:**
- `400` - Application already approved/rejected
- `404` - Application not found

---

### 7. Reject Application (Email Link - No Auth)

**Endpoint:** `GET /api/admin/vendor-applications/:id/reject?token=<secure_token>`

**Authentication:** None (token-based)

**Description:** This endpoint is accessed via the reject button in the admin email. Returns an HTML page.

**Success Response:** HTML page confirming rejection

**Error Responses:**
- `400` - Invalid or expired token
- `400` - Application already processed
- `404` - Application not found

---

## Email Templates

### 1. Admin Notification Email

**When:** After vendor submits application

**To:** Admin email (from `ADMIN_REVIEW_EMAIL` env var)

**Subject:** `New Vendor Application: [Name] - [Company]`

**Content:**
- All application details formatted nicely
- Two buttons:
  - ✓ APPROVE (green)
  - ✗ REJECT (red)
- Links expire in 48 hours

---

### 2. Vendor Approval Email

**When:** After admin approves application

**To:** Vendor email

**Subject:** `Welcome to PLUGDIN - Your Vendor Application Has Been Approved! 🎉`

**Content:**
- Congratulations message
- Login instructions (email + password they set)
- Login button/link
- Welcome message

**Security Note:** Password is NEVER included in the email!

---

### 3. Vendor Rejection Email

**When:** After admin rejects application

**To:** Vendor email

**Subject:** `PLUGDIN Vendor Application Update`

**Content:**
- Professional rejection message
- Explanation that it doesn't reflect on their business
- Encouragement to apply again in the future

---

## Database Schema

### VendorApplication Model

```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique, indexed),
  passwordHash: String (required, hidden),
  companyName: String (required),
  bio: String (required),
  instagramHandle: String (optional),
  websiteOrPortfolioLink: String (optional),
  serviceType: String (required),
  typicalResponseTimeToInquiries: String (required),
  bookingAdvanceAndComfortWithWindow: String (required),
  hasBackupEquipment: Boolean (required),
  hasStandardServiceAgreement: Boolean (required),
  additionalBusinessNotes: String (optional),
  status: Enum ['pending', 'approved', 'rejected'] (default: 'pending', indexed),
  reviewedByAdminId: ObjectId (ref: User),
  reviewedAt: Date,
  approvalToken: String (hashed, hidden),
  approvalTokenExpiry: Date (hidden),
  createdAt: Date (auto, indexed),
  updatedAt: Date (auto)
}
```

### User Model Updates

Added:
- `admin` role to the role enum
- `companyName` field (for vendors)

```javascript
role: Enum ['client', 'vendor', 'admin']
companyName: String (optional, for vendors)
```

---

## Testing the Flow

### Step 1: Apply as Vendor

```bash
curl -X POST http://localhost:3000/api/vendor-applications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "companyName": "John Photography",
    "bio": "Professional photographer with 10 years experience",
    "serviceType": "Photography",
    "typicalResponseTimeToInquiries": "Within 24 hours",
    "bookingAdvanceAndComfortWithWindow": "3-6 months advance, comfortable with 1-88 day window",
    "hasBackupEquipment": true,
    "hasStandardServiceAgreement": true,
    "instagramHandle": "johnphoto",
    "websiteOrPortfolioLink": "https://johnphotography.com"
  }'
```

### Step 2: Check Admin Email

Admin will receive an email with approve/reject buttons.

### Step 3: Admin Reviews (Option A - Email Link)

Click approve/reject button in email (no login required).

### Step 4: Admin Reviews (Option B - Authenticated API)

```bash
# First, login as admin to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminPassword"
  }'

# Get list of pending applications
curl -X GET "http://localhost:3000/api/admin/vendor-applications?status=pending" \
  -H "Authorization: Bearer <admin_token>"

# Approve application
curl -X POST http://localhost:3000/api/admin/vendor-applications/<application_id>/approve \
  -H "Authorization: Bearer <admin_token>"
```

### Step 5: Vendor Receives Email

Vendor receives approval/rejection email.

### Step 6: Vendor Logs In (if approved)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

## Security Considerations

1. **Password Security**
   - Passwords are hashed with bcrypt (cost factor: 10)
   - Passwords are NEVER emailed or logged
   - Password hash is stored separately and only accessed when needed

2. **Token Security**
   - Approval tokens are 32-byte random hex strings
   - Tokens are hashed (SHA-256) before storage
   - Tokens expire after 48 hours
   - Tokens are single-use (cleared after use)

3. **Admin Authentication**
   - Admin endpoints require JWT authentication
   - Admin role is verified via middleware
   - Email links provide alternative access without requiring admin login

4. **Duplicate Prevention**
   - Email uniqueness enforced at database level
   - Checks for existing applications and users before creating
   - Clear error messages for duplicate attempts

---

## Error Handling

All errors follow the standard response format:

```json
{
  "statusCode": 400,
  "data": null,
  "error": {
    "timestamp": "2026-01-21T10:30:00.000Z",
    "message": "Error message here",
    "stacktrace": "..." // Only in development
  }
}
```

Common error codes:
- `400` - Bad request (validation errors)
- `401` - Unauthorized (missing or invalid auth token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found (application doesn't exist)
- `409` - Conflict (duplicate email)
- `500` - Internal server error

---

## Project Structure

```
models/
  └── VendorApplication.js       # Mongoose model

repositories/
  └── vendorApplicationRepository.js  # Database operations

services/
  ├── emailService.js            # SendGrid email functions
  └── vendorApplicationService.js     # Business logic

controllers/
  └── vendorApplicationController.js  # Request handlers (thin layer)

routes/
  └── vendorApplication.js       # Route definitions

errors/
  └── errorMessages.js           # Error message constants
```

---

## Troubleshooting

### SendGrid Not Sending Emails

1. Verify `SENDGRID_API_KEY` is set correctly
2. Check SendGrid dashboard for blocked emails
3. Verify sender email is verified in SendGrid
4. Check application logs for SendGrid errors

### Token Expired Error

- Tokens expire after 48 hours
- Admin must use the authenticated API endpoints instead
- Or request a new application submission

### User Already Exists Error

- Check if user was created in a previous approval
- Verify email is not already registered
- Check both User and VendorApplication collections

### Password Not Working After Approval

- Ensure password hashing is not being double-applied
- Verify the password hash is being stored correctly
- Check User model pre-save hook is not interfering

---

## Future Enhancements

Potential improvements:
- [ ] Email queue for better reliability (e.g., Bull, BullMQ)
- [ ] Admin dashboard UI for reviewing applications
- [ ] Vendor profile completion wizard after approval
- [ ] Application revision/resubmission workflow
- [ ] Automated background checks integration
- [ ] Multi-step application process
- [ ] Admin notes/comments on applications
- [ ] Application analytics and reporting

---

## Support

For issues or questions:
- Check the error messages in the API response
- Review application logs for detailed error information
- Verify all environment variables are set correctly
- Ensure database connection is working

---

Last Updated: January 21, 2026
