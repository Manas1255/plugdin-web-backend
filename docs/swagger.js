const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Plugdin Web Backend API',
            version: '1.0.0',
            description: 'API documentation for Plugdin Web Backend',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Local development server',
            },
            {
                url: 'http://ec2-3-214-48-224.compute-1.amazonaws.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token authentication',
                },
            },
        },
    },
    apis: [
        path.join(__dirname, '*.js'),
        path.join(__dirname, '../routes/*.js'),
        path.join(__dirname, '../controllers/*.js')
    ], // paths to files containing OpenAPI definitions
};

let swaggerSpec;
try {
    swaggerSpec = swaggerJSDoc(options);
    console.log('Swagger spec generated successfully');
} catch (error) {
    console.error('Error generating Swagger spec:', error);
    // Return a minimal spec if generation fails
    swaggerSpec = {
        openapi: '3.0.0',
        info: {
            title: 'Plugdin Web Backend API',
            version: '1.0.0',
            description: 'Error loading API documentation',
        },
        paths: {},
    };
}

module.exports = swaggerSpec;
