import express from 'express';

const router = express.Router();

// Check configuration status
router.get('/check', (req, res) => {
  const config_status = {
    github_oauth: {
      client_id_configured: !!process.env.GITHUB_CLIENT_ID,
      client_secret_configured: !!process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_REDIRECT_URI
    },
    google_oauth: {
      client_id_configured: !!process.env.GOOGLE_CLIENT_ID,
      client_secret_configured: !!process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI
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
