import express from 'express';
import { readJsonFile } from '../utils/fileStorage.js';

const router = express.Router();

// Get statistics from JSON files
router.get('/', (req, res) => {
  try {
    const recommendations = readJsonFile('recommendations.json');
    const projects = readJsonFile('projects.json');

    const stats = {
      recommendations: Array.isArray(recommendations) ? recommendations.length : 0,
      projects: Array.isArray(projects) ? projects.length : 0,
      contact_messages: 0, // Not storing contact messages
      sent_by_email: 0,    // Not storing contact messages
      total_messages: 0    // Not storing contact messages
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;
