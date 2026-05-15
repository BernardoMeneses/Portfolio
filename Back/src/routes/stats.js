import express from 'express';
import { readJsonFile } from '../utils/fileStorage.js';

const router = express.Router();

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get portfolio statistics
 *     tags:
 *       - Statistics
 *     description: Retrieve portfolio statistics like number of projects and recommendations
 *     responses:
 *       200:
 *         description: Portfolio statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: integer
 *                   example: 5
 *                 projects:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: Server error
 */
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
