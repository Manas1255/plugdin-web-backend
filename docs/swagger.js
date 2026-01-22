const swaggerJSDoc = require('swagger-jsdoc');

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
                description: 'Development server',
            },
            {
                url: 'http://ec2-100-49-41-182.compute-1.amazonaws.com',
                description: 'Development server',
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
    apis: ['./docs/*.js', './routes/*.js', './controllers/*.js'], // paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
