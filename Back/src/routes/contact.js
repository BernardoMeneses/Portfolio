import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Send contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const smtp_server = process.env.SMTP_SERVER || 'smtp.gmail.com';
    const smtp_port = parseInt(process.env.SMTP_PORT || '587');
    const sender_email = process.env.SENDER_EMAIL;
    const sender_password = process.env.SENDER_PASSWORD;
    const recipient_email = process.env.RECIPIENT_EMAIL;

    // Try to send email
    if (!sender_email || !sender_password || !recipient_email) {
      return res.status(400).json({ 
        error: 'Servidor de email não configurado. Configure SENDER_EMAIL, SENDER_PASSWORD e RECIPIENT_EMAIL no arquivo .env' 
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtp_server,
        port: smtp_port,
        secure: smtp_port === 465,
        auth: {
          user: sender_email,
          pass: sender_password
        }
      });

      const mailOptions = {
        from: sender_email,
        to: recipient_email,
        subject: `Nova mensagem do portfolio - ${name}`,
        html: `
          <h2>Nova mensagem do seu portfolio</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr>
          <p><strong>Mensagem:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Esta mensagem foi enviada do formulário de contato do seu portfolio.</small></p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado com sucesso para ${recipient_email}`);

      res.status(200).json({
        message: 'Mensagem enviada com sucesso! Em breve retornaremos seu contato.'
      });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      res.status(500).json({ error: 'Erro ao enviar email. Tente novamente mais tarde.' });
    }
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem de contato' });
  }
});

export default router;
