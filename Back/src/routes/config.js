import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/config/check:
 *   get:
 *     summary: Check API configuration
 *     tags:
 *       - Configuration
 *     description: Check the current API configuration status
 *     responses:
 *       200:
 *         description: Configuration status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admin:
 *                   type: object
 *                   properties:
 *                     password_configured:
 *                       type: boolean
 *                 email:
 *                   type: object
 *                   properties:
 *                     smtp_configured:
 *                       type: boolean
 *                     smtp_server:
 *                       type: string
 */
// Check configuration status
router.get('/check', (req, res) => {
  const config_status = {
    admin: {
      password_configured: !!process.env.ADMIN_PASSWORD
    },
    email: {
      smtp_configured: !!(process.env.SMTP_SERVER && process.env.SENDER_EMAIL),
      smtp_server: process.env.SMTP_SERVER,
      smtp_port: process.env.SMTP_PORT
    }
  };

  res.json(config_status);
});

export default router;
