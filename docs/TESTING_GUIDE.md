# Testing Guide - Vendor Application Flow

This guide provides step-by-step instructions to test the vendor application and approval system.

## Prerequisites

1. MongoDB running
2. Node.js server running (`npm run dev`)
3. SendGrid configured in `.env`
4. At least one admin user created

## Test Scenario 1: Complete Vendor Application Flow

### Step 1: Create Admin User (if not done)

```bash
npm run create-admin
```

Follow the prompts to create an admin user.

### Step 2: Submit a Vendor Application

```bash
curl -X POST http://localhost:3000/api/vendor-applications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "password": "password123",
    "companyName": "Jane Smith Photography",
    "bio": "Award-winning wedding photographer with 15 years of experience. Specializing in candid moments and natural light photography.",
    "serviceType": "Photography",
    "typicalResponseTimeToInquiries": "Within 2-4 hours during business hours",
    "bookingAdvanceAndComfortWithWindow": "I typically book 6-12 months in advance for weddings, but am comfortable with PLUGDIN'\''s 1-88 day booking window for other events",
    "hasBackupEquipment": true,
    "hasStandardServiceAgreement": true,
    "instagramHandle": "janesmithphoto",
    "websiteOrPortfolioLink": "https://janesmithphotography.com",
    "additionalBusinessNotes": "I have a team of 3 backup photographers and can provide same-day delivery for urgent requests"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 201,
  "data": {
    "message": "Application submitted successfully. You'll receive an email after review.",
    "applicationId": "..."
  },
  "error": null
}
```

**What happens:**
- Application is stored in database with status `pending`
- Admin receives an email with approve/reject buttons
- Application ID is returned

### Step 3: Verify Admin Email Received

Check the email address specified in `ADMIN_REVIEW_EMAIL` for:
- Email subject: "New Vendor Application: Jane Smith - Jane Smith Photography"
- All application details displayed nicely
- Green "APPROVE" button
- Red "REJECT" button

### Step 4: Admin Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@plugdin.com",
    "password": "your_admin_password"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "role": "admin",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@plugdin.com"
    },
    "tokens": {
      "token": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  },
  "error": null
}
```

**Save the token** for next steps.

### Step 5: List Pending Applications

```bash
curl -X GET "http://localhost:3000/api/admin/vendor-applications?status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "applications": [
      {
        "id": "...",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        "companyName": "Jane Smith Photography",
        "serviceType": "Photography",
        "status": "pending",
        "createdAt": "2026-01-21T...",
        "updatedAt": "2026-01-21T..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1,
      "limit": 20
    }
  },
  "error": null
}
```

### Step 6: Get Application Details

```bash
curl -X GET "http://localhost:3000/api/admin/vendor-applications/APPLICATION_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Replace `APPLICATION_ID` with the ID from step 5.

**Expected Response:** Full application details including all fields.

### Step 7: Approve Application

**Option A: Via Authenticated API**

```bash
curl -X POST "http://localhost:3000/api/admin/vendor-applications/APPLICATION_ID/approve" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Option B: Via Email Link**

Click the "APPROVE" button in the admin email (no authentication required).

**Expected Response (API):**
```json
{
  "statusCode": 200,
  "data": {
    "message": "Vendor application approved successfully",
    "vendorEmail": "jane.smith@example.com"
  },
  "error": null
}
```

**What happens:**
- Vendor user account is created with role `vendor`
- Application status changed to `approved`
- Vendor receives approval email
- Vendor can now login

### Step 8: Verify Vendor Email Received

Check jane.smith@example.com for:
- Email subject: "Welcome to PLUGDIN - Your Vendor Application Has Been Approved! 🎉"
- Congratulations message
- Login instructions (email + password)
- Login button

### Step 9: Vendor Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "role": "vendor",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "companyName": "Jane Smith Photography",
      "bio": "Award-winning wedding photographer..."
    },
    "tokens": {
      "token": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  },
  "error": null
}
```

✅ **Success!** The vendor can now access the platform.

---

## Test Scenario 2: Vendor Application Rejection

### Step 1: Submit Another Application

```bash
curl -X POST http://localhost:3000/api/vendor-applications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Bob",
    "lastName": "Johnson",
    "email": "bob@example.com",
    "password": "password456",
    "companyName": "Bob'\''s Services",
    "bio": "New to the business",
    "serviceType": "DJ Services",
    "typicalResponseTimeToInquiries": "Within 48 hours",
    "bookingAdvanceAndComfortWithWindow": "1-2 months advance",
    "hasBackupEquipment": false,
    "hasStandardServiceAgreement": false
  }'
```

### Step 2: Admin Rejects Application

```bash
curl -X POST "http://localhost:3000/api/admin/vendor-applications/APPLICATION_ID/reject" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "message": "Vendor application rejected",
    "vendorEmail": "bob@example.com"
  },
  "error": null
}
```

**What happens:**
- Application status changed to `rejected`
- Vendor receives rejection email
- No user account is created

### Step 3: Verify Rejection Email

Check bob@example.com for:
- Email subject: "PLUGDIN Vendor Application Update"
- Professional rejection message
- Encouragement to apply again

### Step 4: Vendor Cannot Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "password456"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "data": null,
  "error": {
    "timestamp": "...",
    "message": "Invalid email or password"
  }
}
```

✅ **Success!** Rejected vendors cannot login.

---

## Test Scenario 3: Duplicate Application Prevention

### Step 1: Try to Apply with Same Email

Use Jane's email again (already approved):

```bash
curl -X POST http://localhost:3000/api/vendor-applications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "password": "newpassword",
    "companyName": "Another Company",
    "bio": "Different bio",
    "serviceType": "Videography",
    "typicalResponseTimeToInquiries": "24 hours",
    "bookingAdvanceAndComfortWithWindow": "3 months",
    "hasBackupEquipment": true,
    "hasStandardServiceAgreement": true
  }'
```

**Expected Response:**
```json
{
  "statusCode": 409,
  "data": null,
  "error": {
    "timestamp": "...",
    "message": "User already exists with this email"
  }
}
```

✅ **Success!** Duplicate applications are prevented.

---

## Test Scenario 4: Token Expiry

### Step 1: Check Token in Database

```javascript
// In MongoDB
use plugdin-web-backend

// Find an application and check token expiry
db.vendorapplications.findOne(
  { email: "test@example.com" },
  { approvalToken: 1, approvalTokenExpiry: 1 }
)
```

### Step 2: Manually Expire Token

```javascript
// Set token expiry to past date
db.vendorapplications.updateOne(
  { email: "test@example.com" },
  { $set: { approvalTokenExpiry: new Date('2020-01-01') } }
)
```

### Step 3: Try to Use Expired Link

Visit the approve link from the email (or use curl with the token).

**Expected Result:** Error page saying "This approval link has expired."

✅ **Success!** Expired tokens are rejected.

---

## Test Scenario 5: Email Link Approval (Without Login)

### Step 1: Submit Application

Submit a new vendor application as shown in Scenario 1.

### Step 2: Admin Gets Email

Admin receives email with approve button.

### Step 3: Click Approve (No Login)

Click the "APPROVE" button in the email.

**Expected Result:** 
- Browser shows success HTML page
- "Application Approved Successfully!"
- Vendor email displayed
- No login was required

### Step 4: Verify Vendor Can Login

Vendor should be able to login with their credentials.

✅ **Success!** Email link approval works without authentication.

---

## Test Scenario 6: Admin Cannot Approve Twice

### Step 1: Approve Application

Approve a pending application.

### Step 2: Try to Approve Again

```bash
curl -X POST "http://localhost:3000/api/admin/vendor-applications/APPLICATION_ID/approve" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "data": null,
  "error": {
    "timestamp": "...",
    "message": "This vendor application has already been approved"
  }
}
```

✅ **Success!** Double approval is prevented.

---

## Test Scenario 7: Validation Errors

### Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/vendor-applications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "data": null,
  "error": {
    "message": "Last name is required"
  }
}
```

### Invalid Email Format

```bash
curl -X POST http://localhost:3000/api/vendor-applications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "invalid-email",
    "password": "password123",
    ...
  }'
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "data": null,
  "error": {
    "message": "Invalid email format"
  }
}
```

### Password Too Short

```bash
curl -X POST http://localhost:3000/api/vendor-applications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "123",
    ...
  }'
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "data": null,
  "error": {
    "message": "Password must be at least 6 characters long"
  }
}
```

✅ **Success!** Validation works correctly.

---

## Quick Test Checklist

- [ ] Admin user created successfully
- [ ] Vendor can submit application
- [ ] Admin receives email with approve/reject buttons
- [ ] Admin can list pending applications
- [ ] Admin can view application details
- [ ] Admin can approve via API (authenticated)
- [ ] Admin can approve via email link (no auth)
- [ ] Admin can reject via API (authenticated)
- [ ] Admin can reject via email link (no auth)
- [ ] Vendor receives approval email (no password included)
- [ ] Vendor receives rejection email
- [ ] Approved vendor can login
- [ ] Rejected vendor cannot login
- [ ] Duplicate applications are prevented
- [ ] Expired tokens are rejected
- [ ] Double approval is prevented
- [ ] Validation errors work correctly
- [ ] Passwords are never sent in emails
- [ ] Passwords are hashed in database

---

## Troubleshooting Test Issues

### SendGrid Emails Not Arriving

1. Check SendGrid Activity Feed
2. Verify sender email is verified
3. Check spam folder
4. Look for errors in server logs

### "User Not Found" After Approval

1. Check if user was actually created in database
2. Verify password hash is correct
3. Check for errors during user creation

### Token Invalid

1. Verify token hasn't expired (48 hours)
2. Check token wasn't used already
3. Ensure URL is correctly copied from email

### MongoDB Connection Issues

1. Ensure MongoDB is running
2. Verify connection string in `.env`
3. Check firewall settings

---

## Automated Testing (Future)

Consider adding automated tests for:
- Unit tests for services
- Integration tests for API endpoints
- Email delivery verification
- Token generation and validation
- Password hashing verification

Example test file location: `tests/vendorApplication.test.js`

---

Last Updated: January 21, 2026
