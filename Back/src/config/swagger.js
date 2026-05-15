import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bernardo Meneses Portfolio API',
      version: '1.0.0',
      description: 'API for managing portfolio, skills, projects, and admin authentication',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://portfolio-backend-shy-butterfly-71.fly.dev',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        AdminToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-ADMIN-TOKEN',
        },
      },
    },
  },
  apis: [join(__dirname, '../routes/*.js')],
};

export const swaggerSpec = swaggerJsdoc(options);
