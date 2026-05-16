import express from 'express';
import { readJsonFile, addItemToFile, writeJsonFile } from '../utils/fileStorage.js';
import verifyAdminToken from '../middleware/adminAuth.js';

const router = express.Router();

const loadProjects = () => {
  const projects = readJsonFile('projects.json');
  return Array.isArray(projects) ? projects : [];
};

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
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags:
 *       - Projects
 *     description: Retrieve a list of all portfolio projects
 *     responses:
 *       200:
 *         description: List of projects
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => {
  try {
    res.json(loadProjects());
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
 *     security:
 *       - AdminToken: []
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post('/', verifyAdminToken, (req, res) => {
  try {
    const { title, description, tech, repo, image, link } = req.body;

    if (!title || !description || !tech || !repo || !image) {
      return res.status(400).json({ error: 'Campos obrigatorios faltando' });
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
      message: 'Projeto adicionado com sucesso',
      project
    });
  } catch (error) {
    console.error('Add project error:', error);
    sendRouteError(res, error, 'Erro ao adicionar projeto');
  }
});

/**
 * @swagger
 * /api/projects/{index}:
 *   put:
 *     summary: Update a project by list index (admin only)
 *     tags:
 *       - Projects
 *     security:
 *       - AdminToken: []
 *     responses:
 *       200:
 *         description: Project updated successfully
 */
router.put('/:index', verifyAdminToken, (req, res) => {
  try {
    const index = Number(req.params.index);
    const { title, description, tech, repo, image, link } = req.body;

    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ error: 'Indice invalido' });
    }

    const projects = loadProjects();
    const currentProject = projects[index];

    if (!currentProject) {
      return res.status(404).json({ error: 'Projeto nao encontrado' });
    }

    projects[index] = {
      ...currentProject,
      title: title ?? currentProject.title,
      description: description ?? currentProject.description,
      tech: tech ? (Array.isArray(tech) ? tech : [tech]) : currentProject.tech,
      repo: repo ?? currentProject.repo,
      image: image ?? currentProject.image,
      link: link ?? currentProject.link
    };

    writeJsonFile('projects.json', projects);

    res.json({
      message: 'Projeto atualizado com sucesso',
      project: projects[index]
    });
  } catch (error) {
    console.error('Update project error:', error);
    sendRouteError(res, error, 'Erro ao atualizar projeto');
  }
});

/**
 * @swagger
 * /api/projects/{index}:
 *   delete:
 *     summary: Delete a project by list index (admin only)
 *     tags:
 *       - Projects
 *     security:
 *       - AdminToken: []
 *     responses:
 *       200:
 *         description: Project deleted successfully
 */
router.delete('/:index', verifyAdminToken, (req, res) => {
  try {
    const index = Number(req.params.index);

    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ error: 'Indice invalido' });
    }

    const projects = loadProjects();
    const [removedProject] = projects.splice(index, 1);

    if (!removedProject) {
      return res.status(404).json({ error: 'Projeto nao encontrado' });
    }

    writeJsonFile('projects.json', projects);

    res.json({
      message: 'Projeto removido com sucesso',
      project: removedProject
    });
  } catch (error) {
    console.error('Delete project error:', error);
    sendRouteError(res, error, 'Erro ao remover projeto');
  }
});

export default router;
