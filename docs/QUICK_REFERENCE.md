# Vendor Application - Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Add to .env
```bash
SENDGRID_API_KEY=your_key_here
SENDGRID_FROM_EMAIL=no-reply@plugdin.com
ADMIN_REVIEW_EMAIL=admin@plugdin.com
APP_URL=http://localhost:3000
```

### 3. Create Admin
```bash
npm run create-admin
```

### 4. Start Server
```bash
npm run dev
```

### 5. Test Application
```bash
curl -X POST http://localhost:3000/api/vendor-applications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Vendor",
    "email": "test@example.com",
    "password": "password123",
    "companyName": "Test Company",
    "bio": "Test bio",
    "serviceType": "Photography",
    "typicalResponseTimeToInquiries": "24 hours",
    "bookingAdvanceAndComfortWithWindow": "3 months",
    "hasBackupEquipment": true,
    "hasStandardServiceAgreement": true
  }'
```

---

## 📋 API Endpoints

### Public
```bash
POST /api/vendor-applications    # Submit application
```

### Admin (Auth Required)
```bash
GET  /api/admin/vendor-applications              # List all
GET  /api/admin/vendor-applications/:id          # Get one
POST /api/admin/vendor-applications/:id/approve  # Approve
POST /api/admin/vendor-applications/:id/reject   # Reject
```

### Admin (Token - No Auth)
```bash
GET /api/admin/vendor-applications/:id/approve?token=...  # Email link
GET /api/admin/vendor-applications/:id/reject?token=...   # Email link
```

---

## 🔑 Required Fields

**Vendor Application:**
- firstName, lastName, email, password
- companyName, bio
- serviceType
- typicalResponseTimeToInquiries
- bookingAdvanceAndComfortWithWindow
- hasBackupEquipment (boolean)
- hasStandardServiceAgreement (boolean)

**Optional:**
- instagramHandle
- websiteOrPortfolioLink
- additionalBusinessNotes

---

## 📧 Email Flow

1. **Vendor applies** → Admin gets email with buttons
2. **Admin approves** → Vendor gets "Welcome" email
3. **Admin rejects** → Vendor gets "Sorry" email

**Security:** Passwords NEVER sent in emails!

---

## 🔒 Security Features

- ✅ Bcrypt password hashing
- ✅ JWT authentication
- ✅ Secure tokens (SHA-256)
- ✅ 48-hour token expiry
- ✅ Role-based access (admin/vendor/client)
- ✅ Duplicate prevention

---

## 🐛 Common Issues

### Emails not sending?
1. Check `SENDGRID_API_KEY` in `.env`
2. Verify sender email in SendGrid dashboard
3. Check spam folder
4. Look at server logs

### "Application already pending"?
- Email already has a pending application
- Check database or use different email

### "Invalid token"?
- Token expired (48 hours limit)
- Use authenticated API instead
- Or resubmit application

### MongoDB connection error?
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`

---

## 📁 File Locations

```
models/VendorApplication.js              # Data model
repositories/vendorApplicationRepository.js  # DB operations
services/vendorApplicationService.js     # Business logic
services/emailService.js                 # Email sending
controllers/vendorApplicationController.js   # HTTP handlers
routes/vendorApplication.js              # Route definitions
scripts/createAdminUser.js               # Admin creation tool
```

---

## 📚 Full Documentation

- **[Complete API Docs](VENDOR_APPLICATION.md)** - All endpoints, examples, schemas
- **[Setup Guide](VENDOR_APPLICATION_SETUP.md)** - Detailed configuration
- **[Testing Guide](TESTING_GUIDE.md)** - 7 test scenarios with commands
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - What was built

---

## 🧪 Quick Test

### Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@plugdin.com", "password": "your_password"}'
```

### List Pending Applications
```bash
curl -X GET "http://localhost:3000/api/admin/vendor-applications?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approve Application
```bash
curl -X POST "http://localhost:3000/api/admin/vendor-applications/APP_ID/approve" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💡 Pro Tips

1. **Create test admin first:** `npm run create-admin`
2. **Use email links** for quick approval (no login needed)
3. **Check SendGrid Activity** if emails don't arrive
4. **Tokens expire in 48h** - use API for old applications
5. **Passwords are hashed** - never sent in emails

---

## 🎯 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate email)
- `500` - Server error

---

## 🔄 Application States

```
PENDING → APPROVED → Vendor can login
         ↓
         REJECTED → No account created
```

---

## ⚡ Commands

```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run create-admin # Create admin user
npm run seed         # Seed database
```

---

## 🆘 Need Help?

1. Check error message in API response
2. Look at server console logs
3. Verify environment variables
4. Check full documentation
5. Test with curl commands above

---

**Last Updated:** January 21, 2026
