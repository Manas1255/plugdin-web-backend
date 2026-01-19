# Authentication & Authorization Middleware

This middleware provides JWT-based authentication and role-based authorization for API endpoints.

## Usage

### Basic Authentication

Protect routes that require a valid JWT token:

```javascript
const { authenticate } = require('../middleware/auth');

// Protect a single route
router.get('/protected', authenticate, (req, res) => {
  // req.user is now available
  res.json({ user: req.user });
});
```

### Role-Based Authorization

Protect routes that require specific user roles:

```javascript
const { authenticate, authorize } = require('../middleware/auth');

// Protect route for 'client' role only
router.get('/client-only', authenticate, authorize('client'), (req, res) => {
  // Only users with 'client' role can access
  res.json({ message: 'Client access granted' });
});

// Protect route for 'vendor' role only
router.get('/vendor-only', authenticate, authorize('vendor'), (req, res) => {
  // Only users with 'vendor' role can access
  res.json({ message: 'Vendor access granted' });
});

// Protect route for multiple roles
router.get('/multi-role', authenticate, authorize(['client', 'vendor']), (req, res) => {
  // Users with either 'client' or 'vendor' role can access
  res.json({ message: 'Access granted' });
});
```

## How It Works

### `authenticate` Middleware

1. Extracts JWT token from `Authorization` header (format: `Bearer <token>`)
2. Verifies the token using `JWT_SECRET` from environment variables
3. Fetches the user from the database
4. Attaches the user object to `req.user`
5. Calls `next()` to proceed to the next middleware/route handler

**Error Responses:**
- `401` - Token missing or invalid
- `401` - User not found
- `500` - Internal server error

### `authorize` Middleware

1. Checks if `req.user` exists (must be used after `authenticate`)
2. Verifies the user's role matches the required role(s)
3. Calls `next()` if authorized, otherwise returns `403 Forbidden`

**Error Responses:**
- `401` - User not authenticated
- `403` - Access denied (role mismatch)
- `500` - Internal server error

## Request Object

After authentication, the following properties are available on the request object:

- `req.user` - The authenticated user object (Mongoose document)

## Environment Variables

Make sure to set the following in your `.env` file:

```
JWT_SECRET=your-secret-key-here
```

## Future Enhancements

When `Membership` and `Role` models are added, the `authorizeMembership` middleware (currently commented out) can be enabled for more granular access control based on entity memberships.
