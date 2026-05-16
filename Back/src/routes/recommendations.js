import express from 'express';
import axios from 'axios';
import { readJsonFile, addItemToFile } from '../utils/fileStorage.js';

const router = express.Router();

const sendRouteError = (res, error, fallbackMessage) => {
  const status = error?.status || 500;
  const message = error?.message || fallbackMessage;

  res.status(status).json({
    error: message,
    code: error?.code || 'INTERNAL_ERROR'
  });
};

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get all recommendations
 *     tags:
 *       - Recommendations
 *     description: Retrieve all portfolio recommendations
 *     responses:
 *       200:
 *         description: List of recommendations
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => {
  try {
    const recommendations = readJsonFile('recommendations.json');
    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Erro ao buscar recomendacoes' });
  }
});

/**
 * @swagger
 * /api/recommendations:
 *   post:
 *     summary: Add new recommendation
 *     tags:
 *       - Recommendations
 *     description: Add a new recommendation with GitHub or Google authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Great developer!"
 *               github_token:
 *                 type: string
 *                 example: "ghp_..."
 *               google_token:
 *                 type: string
 *                 example: "ya29..."
 *     responses:
 *       201:
 *         description: Recommendation created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid token
 */
router.post('/', async (req, res) => {
  try {
    const { text, github_token, google_token } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Texto da recomendacao e obrigatorio' });
    }

    let userData = null;
    let provider = null;
    let googleData = null;

    if (github_token) {
      try {
        const response = await axios.get('https://api.github.com/user', {
          headers: { Authorization: `token ${github_token}` }
        });

        userData = response.data;
        provider = 'github';
      } catch (error) {
        return res.status(401).json({ error: 'Token GitHub invalido' });
      }
    } else if (google_token) {
      try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${google_token}` }
        });

        googleData = response.data;
        userData = {
          name: googleData.name || 'Usuario Google',
          login: `google_${googleData.id}`,
          avatar_url: googleData.picture || '',
          email: googleData.email || ''
        };
        provider = 'google';
      } catch (error) {
        return res.status(401).json({ error: 'Token Google invalido' });
      }
    } else {
      return res.status(401).json({ error: 'Token nao fornecido' });
    }

    const username = provider === 'google'
      ? `google_${googleData.id}`
      : userData.login;

    const recommendation = addItemToFile('recommendations.json', {
      name: userData.name || userData.login || 'Usuario',
      text,
      avatar: userData.avatar_url || '',
      username,
      provider
    });

    res.status(201).json({
      message: 'Recomendacao adicionada com sucesso',
      recommendation: {
        id: recommendation.id,
        name: recommendation.name,
        text: recommendation.text,
        avatar: recommendation.avatar,
        username: recommendation.username,
        provider: recommendation.provider,
        createdAt: recommendation.createdAt
      }
    });
  } catch (error) {
    console.error('Add recommendation error:', error);
    sendRouteError(res, error, 'Erro ao adicionar recomendacao');
  }
});

export default router;
