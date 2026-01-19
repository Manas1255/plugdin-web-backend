# Service API Documentation

## Overview
This document describes the Service API implementation for the Plugdin platform. The Service API allows vendors to create, manage, and list services they offer to clients.

## Architecture
The implementation follows the repository pattern with clear separation of concerns:

```
controllers/      - HTTP request/response handling
services/         - Business logic
repositories/     - Database operations
models/           - Database schemas
routes/           - API route definitions
```

## Models

### Service Model
Located in: `models/Service.js`

**Fields:**
- `vendor` - Reference to User (vendor who created the service)
- `listingType` - Enum: `hourly` or `fixed`
- `category` - String (e.g., "Photographer")
- `listingTitle` - String (max 200 chars)
- `listingDescription` - String (max 2000 chars)
- `packageSpecifications` - Array of strings (selected specifications)
- `servicingArea` - Array of strings (cities where service is offered)
- `pricePerHour` - Number (required for hourly booking)
- `bookingStartInterval` - Enum: `every_hour`, `every_half_hour`, `every_quarter_hour` (for hourly)
- `pricingOptions` - Array of pricing options (required for fixed booking)
- `status` - Enum: `draft`, `active`, `inactive`, `archived`
- `isDeleted` - Boolean (soft delete flag)

**Pricing Option Schema (for fixed booking):**
- `name` - String (e.g., "Premium Package - 2 Hours")
- `pricePerSession` - Number
- `sessionLength.hours` - Number
- `sessionLength.minutes` - Number

### Category Model
Located in: `models/Category.js`

**Fields:**
- `name` - String (e.g., "Photographer")
- `slug` - String (e.g., "photographer")
- `packageSpecifications` - Array of strings (available specifications)
- `isActive` - Boolean

### City Model
Located in: `models/City.js`

**Fields:**
- `name` - String (e.g., "Toronto")
- `province` - String (e.g., "Ontario")
- `country` - String (default: "Canada")
- `isActive` - Boolean

## API Endpoints

### Service Endpoints

#### Create Service (Vendor Only)
```
POST /api/services
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "listingType": "hourly",
  "category": "Photographer",
  "listingTitle": "Professional Wedding Photography",
  "listingDescription": "High-quality wedding photography with professional equipment",
  "packageSpecifications": [
    "High Resolution Photos",
    "Photo Retouching/Editing"
  ],
  "servicingArea": ["Toronto", "Mississauga", "Brampton"],
  "pricePerHour": 150,
  "bookingStartInterval": "every_hour"
}
```

**For Fixed Booking:**
```json
{
  "listingType": "fixed",
  "category": "Photographer",
  "listingTitle": "Event Photography Package",
  "listingDescription": "Complete event photography package",
  "packageSpecifications": ["High Resolution Photos"],
  "servicingArea": ["Toronto"],
  "pricingOptions": [
    {
      "name": "Premium Package - 2 Hours",
      "pricePerSession": 300,
      "sessionLength": {
        "hours": 2,
        "minutes": 0
      }
    }
  ]
}
```

#### Get Vendor's Services
```
GET /api/services/vendor/my-services?status=active
Authorization: Bearer <token>
```

#### Get Service by ID
```
GET /api/services/:serviceId
```

#### Update Service (Vendor Only)
```
PUT /api/services/:serviceId
Authorization: Bearer <token>
```

#### Delete Service (Vendor Only)
```
DELETE /api/services/:serviceId
Authorization: Bearer <token>
```

#### Search Services
```
GET /api/services/search?category=Photographer&page=1&limit=10
```

**Query Parameters:**
- `category` - Filter by category
- `listingType` - Filter by listing type (hourly/fixed)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

### Category Endpoints

#### Get All Categories
```
GET /api/services/categories/all
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "count": 1,
    "categories": [
      {
        "id": "...",
        "name": "Photographer",
        "slug": "photographer",
        "packageSpecifications": [
          "High Resolution Photos",
          "Photo Retouching/Editing",
          "..."
        ],
        "isActive": true
      }
    ]
  },
  "error": null
}
```

#### Get Category Specifications
```
GET /api/services/categories/:categorySlug/specifications
```

Example: `GET /api/services/categories/photographer/specifications`

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "category": "Photographer",
    "slug": "photographer",
    "packageSpecifications": [
      "- N/A - This listing is for tailored add-ons only",
      "Additional Photos can be purchased after",
      "High Resolution Photos",
      "..."
    ]
  },
  "error": null
}
```

### City Endpoints

#### Get All Cities
```
GET /api/services/cities/all?province=Ontario
```

**Query Parameters:**
- `province` - Optional filter by province

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "count": 45,
    "cities": [
      {
        "id": "...",
        "name": "Ajax",
        "province": "Ontario",
        "country": "Canada",
        "isActive": true
      },
      "..."
    ]
  },
  "error": null
}
```

## Seeding Initial Data

Before using the Service API, you need to seed the database with initial categories and cities.

```bash
node scripts/seedData.js
```

This will create:
- 1 Category (Photographer) with all package specifications
- 45 Ontario cities

## Authentication & Authorization

### Vendor Authentication
All service creation, update, and delete operations require:
1. Valid JWT token in Authorization header: `Bearer <token>`
2. User role must be `vendor`

### Middleware Usage
```javascript
// Public route - no auth required
router.get('/search', serviceController.searchServices);

// Protected route - authentication only
router.get('/:serviceId', authenticate, serviceController.getService);

// Vendor-only route - authentication + vendor role
router.post('/', authenticate, authorize('vendor'), serviceController.createService);
```

## Validation Rules

### Service Creation
- **listingType**: Required, must be "hourly" or "fixed"
- **category**: Required, must exist in database
- **listingTitle**: Required, max 200 chars, must be unique per vendor
- **listingDescription**: Required, max 2000 chars
- **servicingArea**: Required, at least one city, all cities must exist in database

### Hourly Booking
- `pricePerHour`: Required, must be > 0
- `bookingStartInterval`: Required, must be valid enum value

### Fixed Booking
- `pricingOptions`: Required, at least one option
- Each option must have valid `name`, `pricePerSession`, and `sessionLength`
- Session length must be > 0

## Error Handling

All errors follow the standard error response format:

```json
{
  "statusCode": 400,
  "data": null,
  "error": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "message": "Invalid category selected",
    "stacktrace": null
  }
}
```

### Common Error Codes
- `400` - Validation error
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (not a vendor or not service owner)
- `404` - Service/Category/City not found
- `409` - Service already exists (duplicate title)
- `500` - Internal server error

## Testing the API

### 1. Seed the Database
```bash
node scripts/seedData.js
```

### 2. Create a Vendor Account
```bash
POST /api/auth/signup/client
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "vendor@example.com",
  "password": "password123"
}
```

Note: You'll need to manually change the user's role to "vendor" in the database for testing.

### 3. Login
```bash
POST /api/auth/login
{
  "email": "vendor@example.com",
  "password": "password123"
}
```

Save the returned token.

### 4. Get Categories and Cities
```bash
GET /api/services/categories/all
GET /api/services/cities/all
```

### 5. Get Category Specifications
```bash
GET /api/services/categories/photographer/specifications
```

### 6. Create a Service
```bash
POST /api/services
Authorization: Bearer <your_token>
{
  "listingType": "hourly",
  "category": "Photographer",
  "listingTitle": "Professional Wedding Photography",
  "listingDescription": "High-quality wedding photography",
  "packageSpecifications": ["High Resolution Photos"],
  "servicingArea": ["Toronto", "Mississauga"],
  "pricePerHour": 150,
  "bookingStartInterval": "every_hour"
}
```

## Swagger Documentation

All endpoints are documented in Swagger. Access the Swagger UI at:
```
http://localhost:<PORT>/api-docs
```

## Future Enhancements

Potential improvements for the Service API:
1. Image upload for services
2. Reviews and ratings
3. Availability calendar
4. Booking management
5. Advanced search with filters (price range, location, etc.)
6. Service categories hierarchy
7. Featured/promoted services
8. Service analytics for vendors
