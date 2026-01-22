# plugdin-web-backend

Backend API for the PLUGDIN platform - connecting clients with service vendors.

## Features

- **User Authentication** - JWT-based authentication for clients and vendors
- **Service Management** - Vendors can create and manage their service offerings
- **Vendor Application System** - Secure onboarding flow with admin approval
- **Admin Panel** - Review and approve/reject vendor applications
- **Email Notifications** - SendGrid integration for automated emails

## Tech Stack

- **Node.js** & **Express** - Server and API framework
- **MongoDB** & **Mongoose** - Database and ODM
- **bcrypt** - Password hashing
- **JWT** - Authentication tokens
- **SendGrid** - Email service
- **Swagger** - API documentation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017/plugdin-web-backend

# JWT
JWT_SECRET=your_jwt_secret_key

# SendGrid (for emails)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=no-reply@plugdin.com
ADMIN_REVIEW_EMAIL=admin@plugdin.com

# App URL (for email links)
APP_URL=http://localhost:3000

# Server
PORT=3000
NODE_ENV=development
```

### 3. Create an Admin User

Run the helper script to create your first admin user:

```bash
node scripts/createAdminUser.js
```

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000`

## Documentation

### API Documentation

- **[Vendor Application API](docs/VENDOR_APPLICATION.md)** - Complete vendor onboarding flow documentation
- **[Setup Guide](docs/VENDOR_APPLICATION_SETUP.md)** - Step-by-step setup instructions
- **[Service API](docs/SERVICE_API.md)** - Service management endpoints

### Swagger Documentation

Access interactive API docs at: `http://localhost:3000/api-docs`

## Project Structure

```
plugdin-web-backend/
├── controllers/       # Request handlers (thin layer)
├── services/         # Business logic
├── repositories/     # Database operations
├── models/           # Mongoose schemas
├── routes/           # API route definitions
├── middleware/       # Authentication & authorization
├── utils/            # Helper functions
├── errors/           # Error messages & handling
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

## Key Endpoints

### Authentication
- `POST /api/auth/signup` - Client signup
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Vendor Applications
- `POST /api/vendor-applications` - Submit vendor application
- `GET /api/admin/vendor-applications` - List applications (admin)
- `POST /api/admin/vendor-applications/:id/approve` - Approve (admin)
- `POST /api/admin/vendor-applications/:id/reject` - Reject (admin)

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create service (vendor)
- `GET /api/services/:id` - Get service details
- `PUT /api/services/:id` - Update service (vendor)
- `DELETE /api/services/:id` - Delete service (vendor)

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update user profile

## Vendor Application Flow

1. **Vendor applies** via public endpoint
2. **Admin receives email** with approve/reject buttons
3. **Admin reviews** and approves or rejects
4. **Vendor notified** via email
5. **Approved vendors** can login and create services

See [VENDOR_APPLICATION.md](docs/VENDOR_APPLICATION.md) for detailed flow documentation.

## Architecture

This project follows a **layered architecture** with strict separation of concerns:

- **Controllers**: Handle HTTP requests/responses only
- **Services**: Contain all business logic
- **Repositories**: Handle all database operations
- **Models**: Define data schemas

See [.cursorrules](.cursorrules) for detailed architecture guidelines.

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Role-based authorization (client, vendor, admin)
- ✅ Secure token-based approval links
- ✅ Input validation and sanitization
- ✅ Environment variable protection

## Development

### Seed Data

Populate the database with sample data:

```bash
node scripts/seedData.js
```

### Create Admin User

Create an admin user for testing:

```bash
node scripts/createAdminUser.js
```

### Run Tests

```bash
npm test
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `SENDGRID_API_KEY` | Yes | SendGrid API key for emails |
| `SENDGRID_FROM_EMAIL` | Yes | Verified sender email address |
| `ADMIN_REVIEW_EMAIL` | Yes | Admin email for notifications |
| `APP_URL` | Yes | Application URL for email links |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |

## Server Deployment (EC2 / PM2)

After deploying (e.g. `git pull`) on the server, **always install dependencies** — `node_modules` is not in git:

```bash
cd /home/ubuntu/apps/backend/dev/plugdin-web-backend
npm install
pm2 restart plugdin-web-backend
```

If you see `MODULE_NOT_FOUND` when starting the app, it usually means `npm install` was not run on the server.

## Contributing

1. Follow the architecture rules in `.cursorrules`
2. Keep controllers thin
3. Put business logic in services
4. Put database operations in repositories
5. Use `responseHelper` for all API responses

## License

ISC

## Support

For issues or questions, please check the documentation in the `docs/` folder or review the inline code comments.
