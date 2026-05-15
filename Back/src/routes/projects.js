import express from 'express';
import { readJsonFile, addItemToFile } from '../utils/fileStorage.js';

const router = express.Router();

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
