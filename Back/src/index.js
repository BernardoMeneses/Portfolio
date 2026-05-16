import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { basename, dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';
import { createSwaggerSpec } from './config/swagger.js';

// Import routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import recommendationRoutes from './routes/recommendations.js';
import contactRoutes from './routes/contact.js';
import statsRoutes from './routes/stats.js';
import configRoutes from './routes/config.js';
import skillsRoutes from './routes/skills.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
app.set('trust proxy', 1);
const CV_DIR = join(__dirname, 'cv');

const normalizeOrigin = (origin = '') => origin.trim().replace(/\/+$/, '');

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.ALLOWED_ORIGINS
]
  .flatMap((value) => (value || '').split(','))
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4698',
  ...configuredOrigins
]);

const isVercelOrigin = (origin) =>
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    const normalizedOrigin = normalizeOrigin(origin || '');

    if (!origin || allowedOrigins.has(normalizedOrigin) || isVercelOrigin(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${normalizedOrigin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-ADMIN-TOKEN']
};

const getBaseUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = (forwardedProto || req.protocol || 'http').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
};

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Portfolio API Docs',
  swaggerOptions: {
    url: '/api-docs.json'
  }
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Portfolio API esta funcionando! Node.js Backend ativo.' });
});

// CV download
app.get('/cv/:filename', (req, res) => {
  const requestedFilename = req.params.filename;
  const safeFilename = basename(requestedFilename);

  if (requestedFilename !== safeFilename) {
    return res.status(400).json({ error: 'Nome de ficheiro invalido' });
  }

  const filePath = join(CV_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: `CV nao encontrado no backend. Coloca o ficheiro em Back/src/cv/${safeFilename}`
    });
  }

  return res.download(filePath, safeFilename);
});

// Swagger documentation
try {
  app.get('/api-docs.json', (req, res) => {
    res.json(createSwaggerSpec(getBaseUrl(req)));
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, swaggerUiOptions));
  console.log('Swagger docs available at /api-docs');
} catch (error) {
  console.warn('Swagger setup warning:', error.message);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/config', configRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota nao encontrada' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\nServidor rodando em http://localhost:${PORT}`);
    console.log(`Frontend conectando em ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
  });
}

export default app;
