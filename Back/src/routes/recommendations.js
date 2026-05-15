import express from 'express';
import axios from 'axios';
import { readJsonFile, addItemToFile } from '../utils/fileStorage.js';

const router = express.Router();

// Get all recommendations
router.get('/', (req, res) => {
  try {
    const recommendations = readJsonFile('recommendations.json');
    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Erro ao buscar recomendações' });
  }
});

// Add new recommendation
router.post('/', async (req, res) => {
  try {
    const { text, github_token, google_token } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Texto da recomendação é obrigatório' });
    }

    let user_data = null;
    let provider = null;
    let google_data = null;

    // Verify GitHub token
    if (github_token) {
      try {
        const response = await axios.get('https://api.github.com/user', {
          headers: { Authorization: `token ${github_token}` }
        });

        user_data = response.data;
        provider = 'github';
      } catch (error) {
        return res.status(401).json({ error: 'Token GitHub inválido' });
      }
    }
    // Verify Google token
    else if (google_token) {
      try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${google_token}` }
        });

        google_data = response.data;
        user_data = {
          name: google_data.name || 'Usuário Google',
          login: `google_${google_data.id}`,
          avatar_url: google_data.picture || '',
          email: google_data.email || ''
        };
        provider = 'google';
      } catch (error) {
        return res.status(401).json({ error: 'Token Google inválido' });
      }
    } else {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Create recommendation in JSON file
    const username = provider === 'google' 
      ? `google_${google_data.id}`
      : user_data.login;

    const recommendation = addItemToFile('recommendations.json', {
      name: user_data.name || user_data.login || 'Usuário',
      text: text,
      avatar: user_data.avatar_url || '',
      username: username,
      provider: provider
    });

    res.status(201).json({
      message: 'Recomendação adicionada com sucesso!',
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
    res.status(500).json({ error: 'Erro ao adicionar recomendação' });
  }
});

export default router;
