import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Admin login - password-based authentication
router.post('/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
      return res.status(500).json({ error: 'Admin password not configured' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { admin: true, iat: Date.now() },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ token, message: 'Admin authenticated successfully' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Error during admin login' });
  }
});

export default router;
