import express from 'express';
import { listEntries, addEntry, removeEntry, hitRateLimit } from '../utils/guestbookStore.js';
import verifyAdminToken from '../middleware/adminAuth.js';

const router = express.Router();

const COLORS = ['yellow', 'pink', 'blue', 'green', 'purple'];
const MAX_NAME = 40;
const MAX_MESSAGE = 140;
const MAX_STORED = 300;
const PUBLIC_LIMIT = 40;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;

const clean = (value, max) =>
  String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const toPublic = ({ id, name, message, color, createdAt }) => ({ id, name, message, color, createdAt });

const sendRouteError = (res, error, fallbackMessage) => {
  res.status(error?.status || 500).json({
    error: error?.message || fallbackMessage,
    code: error?.code || 'INTERNAL_ERROR'
  });
};

/**
 * @swagger
 * /api/guestbook:
 *   get:
 *     summary: Get the latest guestbook notes
 *     tags:
 *       - Guestbook
 *     responses:
 *       200:
 *         description: List of notes (newest first)
 */
router.get('/', async (req, res) => {
  try {
    res.json((await listEntries(PUBLIC_LIMIT)).map(toPublic));
  } catch (error) {
    console.error('Get guestbook error:', error);
    res.status(500).json({ error: 'Erro ao buscar o livro de visitas' });
  }
});

/**
 * @swagger
 * /api/guestbook:
 *   post:
 *     summary: Leave a note on the guestbook
 *     tags:
 *       - Guestbook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ana"
 *               message:
 *                 type: string
 *                 example: "Adorei a capa!"
 *               color:
 *                 type: string
 *                 enum: [yellow, pink, blue, green, purple]
 *     responses:
 *       201:
 *         description: Note created
 *       400:
 *         description: Invalid note
 *       429:
 *         description: Too many notes from this IP
 *       503:
 *         description: Storage is read-only on this deployment
 */
router.post('/', async (req, res) => {
  try {
    const { name, message, color, website } = req.body || {};

    // Honeypot: real visitors never see this field
    if (website) {
      return res.status(201).json({ entry: null });
    }

    const cleanName = clean(name, MAX_NAME);
    const cleanMessage = clean(message, MAX_MESSAGE);

    if (!cleanName || !cleanMessage) {
      return res.status(400).json({ error: 'Nome e mensagem sao obrigatorios', code: 'MISSING_FIELDS' });
    }

    if (/https?:\/\/|www\./i.test(`${cleanName} ${cleanMessage}`)) {
      return res.status(400).json({ error: 'Links nao sao permitidos', code: 'LINKS_NOT_ALLOWED' });
    }

    if (await hitRateLimit(req.ip, RATE_MAX, RATE_WINDOW_MS)) {
      return res.status(429).json({ error: 'Demasiadas notas, tenta mais tarde', code: 'RATE_LIMITED' });
    }

    const entry = await addEntry({
      name: cleanName,
      message: cleanMessage,
      color: COLORS.includes(color) ? color : 'yellow'
    }, MAX_STORED);

    res.status(201).json({ entry: toPublic(entry) });
  } catch (error) {
    console.error('Add guestbook note error:', error);
    sendRouteError(res, error, 'Erro ao guardar a nota');
  }
});

/**
 * @swagger
 * /api/guestbook/{id}:
 *   delete:
 *     summary: Remove a guestbook note (admin only)
 *     tags:
 *       - Guestbook
 *     security:
 *       - AdminToken: []
 *     responses:
 *       200:
 *         description: Note removed
 *       404:
 *         description: Note not found
 */
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    if (!(await removeEntry(Number(req.params.id)))) {
      return res.status(404).json({ error: 'Nota nao encontrada' });
    }

    res.json({ message: 'Nota removida' });
  } catch (error) {
    console.error('Delete guestbook note error:', error);
    sendRouteError(res, error, 'Erro ao remover a nota');
  }
});

export default router;
