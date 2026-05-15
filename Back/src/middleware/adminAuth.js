import jwt from 'jsonwebtoken';

// Middleware to verify admin token from X-ADMIN-TOKEN header
export const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];

    if (!token) {
      return res.status(401).json({ error: 'No admin token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    if (!decoded.admin) {
      return res.status(403).json({ error: 'Invalid admin token' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Admin token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired admin token' });
  }
};

export default verifyAdminToken;
