import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildOptions = (serverUrl) => ({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bernardo Meneses Portfolio API',
      version: '1.0.0',
      description: 'API for managing portfolio, skills, projects, and admin authentication',
    },
    servers: [
      {
        url: serverUrl,
        description: 'Current server',
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server',
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
});

export const createSwaggerSpec = (serverUrl = 'http://localhost:3001') =>
  swaggerJsdoc(buildOptions(serverUrl));
