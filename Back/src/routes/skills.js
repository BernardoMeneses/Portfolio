import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileStorage.js';
import verifyAdminToken from '../middleware/adminAuth.js';

const router = express.Router();
const VALID_CATEGORIES = ['stack', 'dbStack', 'tools', 'aiStack'];

const loadSkills = () => {
  const skills = readJsonFile('skills.json');

  return {
    stack: Array.isArray(skills.stack) ? skills.stack : [],
    dbStack: Array.isArray(skills.dbStack) ? skills.dbStack : [],
    tools: Array.isArray(skills.tools) ? skills.tools : [],
    aiStack: Array.isArray(skills.aiStack) ? skills.aiStack : []
  };
};

const validateCategory = (category) => VALID_CATEGORIES.includes(category);

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Get all skills grouped by category
 *     tags:
 *       - Skills
 *     responses:
 *       200:
 *         description: Skills grouped by category
 */
router.get('/', (req, res) => {
  try {
    res.json(loadSkills());
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Erro ao buscar skills' });
  }
});

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Add a skill to a category
 *     tags:
 *       - Skills
 *     security:
 *       - AdminToken: []
 *     responses:
 *       201:
 *         description: Skill created successfully
 */
router.post('/', verifyAdminToken, (req, res) => {
  try {
    const { category, skill } = req.body;

    if (!validateCategory(category)) {
      return res.status(400).json({ error: 'Categoria invalida' });
    }

    if (!skill || !skill.name) {
      return res.status(400).json({ error: 'Skill invalida' });
    }

    const skills = loadSkills();
    const categoryItems = skills[category];

    if (categoryItems.some((item) => item.name === skill.name)) {
      return res.status(409).json({ error: 'Skill ja existe nessa categoria' });
    }

    categoryItems.push({
      name: skill.name,
      image: skill.image || ''
    });

    writeJsonFile('skills.json', skills);

    res.status(201).json({
      message: 'Skill adicionada com sucesso',
      skills
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ error: 'Erro ao adicionar skill' });
  }
});

/**
 * @swagger
 * /api/skills:
 *   put:
 *     summary: Update a skill in a category
 *     tags:
 *       - Skills
 *     security:
 *       - AdminToken: []
 *     responses:
 *       200:
 *         description: Skill updated successfully
 */
router.put('/', verifyAdminToken, (req, res) => {
  try {
    const { category, name, skill } = req.body;

    if (!validateCategory(category)) {
      return res.status(400).json({ error: 'Categoria invalida' });
    }

    if (!name || !skill || !skill.name) {
      return res.status(400).json({ error: 'Dados da skill invalidos' });
    }

    const skills = loadSkills();
    const skillIndex = skills[category].findIndex((item) => item.name === name);

    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill nao encontrada' });
    }

    skills[category][skillIndex] = {
      ...skills[category][skillIndex],
      name: skill.name,
      image: skill.image || ''
    };

    writeJsonFile('skills.json', skills);

    res.json({
      message: 'Skill atualizada com sucesso',
      skills
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: 'Erro ao atualizar skill' });
  }
});

/**
 * @swagger
 * /api/skills:
 *   delete:
 *     summary: Remove a skill from a category
 *     tags:
 *       - Skills
 *     security:
 *       - AdminToken: []
 *     responses:
 *       200:
 *         description: Skill deleted successfully
 */
router.delete('/', verifyAdminToken, (req, res) => {
  try {
    const { category, name } = req.body;

    if (!validateCategory(category)) {
      return res.status(400).json({ error: 'Categoria invalida' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Nome da skill e obrigatorio' });
    }

    const skills = loadSkills();
    const nextItems = skills[category].filter((item) => item.name !== name);

    if (nextItems.length === skills[category].length) {
      return res.status(404).json({ error: 'Skill nao encontrada' });
    }

    skills[category] = nextItems;
    writeJsonFile('skills.json', skills);

    res.json({
      message: 'Skill removida com sucesso',
      skills
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Erro ao remover skill' });
  }
});

export default router;
