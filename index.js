const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

const routes = require('./routes');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Webhook routes must use raw body - register before JSON middleware
// Apply raw body middleware only to webhook routes
app.use('/api/webhooks', express.raw({ type: 'application/json' }), require('./routes/webhooks'));

// JSON middleware for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON in request body'
        });
    }
    next(err);
});

// Swagger documentation routes - use current request host so "Try it out" hits the same server
app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
    const host = req.get('host') || `localhost:${process.env.PORT || 3000}`;
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;
    const dynamicSpec = {
        ...swaggerSpec,
        servers: [
            { url: baseUrl, description: 'Current server (same as this page)' },
            { url: `http://localhost:${process.env.PORT || 3000}`, description: 'Local development server' },
            { url: 'http://ec2-3-214-48-224.compute-1.amazonaws.com:3000', description: 'Production server' },
        ],
    };
    swaggerUi.setup(dynamicSpec, {
        persistAuthorization: true,
        customCss: '.swagger-ui .topbar { display: none }',
    })(req, res, next);
});

// Serve Swagger JSON spec directly (useful for debugging)
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    const apiUrl = process.env.API_URL || process.env.APP_URL || `http://localhost:${PORT}`;
    console.log(`Email links (approve/reject) use: ${apiUrl}`);
});
