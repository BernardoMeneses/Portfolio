import express from 'express';
import axios from 'axios';
import { generateState, validateState, removeState } from '../utils/oauth.js';
import querystring from 'querystring';

const router = express.Router();

// GitHub login - generates authorization URL
router.get('/github/login', (req, res) => {
  try {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    
    if (!GITHUB_CLIENT_ID) {
      return res.status(500).json({ error: 'GitHub Client ID não configurado' });
    }

    const state = generateState();
    
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
      scope: 'user:email',
      state: state
    });

    const auth_url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ auth_url });
  } catch (error) {
    console.error('GitHub login error:', error);
    res.status(500).json({ error: 'Erro ao gerar URL de login' });
  }
});

// GitHub callback - exchanges code for token
router.get('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      const error_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/github/callback.html?error=missing_params`;
      return res.redirect(error_url);
    }

    // Validate state
    if (!validateState(state)) {
      const error_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/github/callback.html?error=invalid_state`;
      return res.redirect(error_url);
    }
    removeState(state);

    // Exchange code for token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const access_token = tokenResponse.data.access_token;

    if (!access_token) {
      const error_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/github/callback.html?error=no_access_token`;
      return res.redirect(error_url);
    }

    // Get user data
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` }
    });

    const user_data = userResponse.data;

    // Redirect with user data
    const params = new URLSearchParams({
      success: 'true',
      login: user_data.login || '',
      name: user_data.name || '',
      avatar_url: user_data.avatar_url || '',
      email: user_data.email || '',
      token: access_token
    });

    const success_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/github/callback.html?${params.toString()}`;
    res.redirect(success_url);
  } catch (error) {
    console.error('GitHub callback error:', error);
    const error_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/github/callback.html?error=server_error`;
    res.redirect(error_url);
  }
});

// Google login - generates authorization URL
router.get('/google/login', (req, res) => {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google Client ID não configurado' });
    }

    const state = generateState();
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      scope: 'openid email profile',
      response_type: 'code',
      state: state
    });

    const auth_url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ auth_url });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Erro ao gerar URL de login' });
  }
});

// Google callback - exchanges code for token
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      const error_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/google/callback.html?error=missing_params`;
      return res.redirect(error_url);
    }

    // Validate state
    if (!validateState(state)) {
      const error_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/google/callback.html?error=invalid_state`;
      return res.redirect(error_url);
    }
    removeState(state);

    // Exchange code for token
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
      }
    );

    const access_token = tokenResponse.data.access_token;

    if (!access_token) {
      const error_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/google/callback.html?error=no_access_token`;
      return res.redirect(error_url);
    }

    // Get user data
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const google_data = userResponse.data;

    // Redirect with user data
    const params = new URLSearchParams({
      success: 'true',
      id: google_data.id || '',
      email: google_data.email || '',
      name: google_data.name || '',
      picture: google_data.picture || '',
      verified_email: google_data.verified_email || '',
      token: access_token
    });

    const success_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/google/callback.html?${params.toString()}`;
    res.redirect(success_url);
  } catch (error) {
    console.error('Google callback error:', error);
    const error_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/google/callback.html?error=server_error`;
    res.redirect(error_url);
  }
});

// Verify GitHub token
router.post('/github', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const response = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` }
    });

    if (response.status === 200) {
      const user_data = response.data;
      res.json({
        login: user_data.login,
        name: user_data.name || user_data.login,
        avatar_url: user_data.avatar_url
      });
    } else {
      res.status(401).json({ error: 'Token inválido' });
    }
  } catch (error) {
    console.error('GitHub verification error:', error);
    res.status(401).json({ error: 'Erro ao verificar token' });
  }
});

export default router;
