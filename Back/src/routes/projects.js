import express from 'express';
import { readJsonFile, addItemToFile } from '../utils/fileStorage.js';

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags:
 *       - Projects
 *     description: Retrieve a list of all portfolio projects
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   tech:
 *                     type: array
 *                     items:
 *                       type: string
 *                   repo:
 *                     type: string
 *                   image:
 *                     type: string
 *                   link:
 *                     type: string
 *       500:
 *         description: Server error
 */
// Get all projects
router.get('/', (req, res) => {
  try {
    const projects = readJsonFile('projects.json');
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Add new project (admin only)
 *     tags:
 *       - Projects
 *     description: Create a new portfolio project
 *     security:
 *       - AdminToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - tech
 *               - repo
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My Project"
 *               description:
 *                 type: string
 *                 example: "Project description"
 *               tech:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "Node.js"]
 *               repo:
 *                 type: string
 *                 example: "https://github.com/user/project"
 *               image:
 *                 type: string
 *                 example: "project-image.jpg"
 *               link:
 *                 type: string
 *                 example: "https://project-link.com"
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
// Add new project (admin endpoint)
router.post('/', (req, res) => {
  try {
    const { title, description, tech, repo, image, link } = req.body;

    if (!title || !description || !tech || !repo || !image) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const project = addItemToFile('projects.json', {
      title,
      description,
      tech: Array.isArray(tech) ? tech : [tech],
      repo,
      image,
      link: link || ''
    });

    res.status(201).json({
      message: 'Projeto adicionado com sucesso!',
      project
    });
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ error: 'Erro ao adicionar projeto' });
  }
});

export default router;
