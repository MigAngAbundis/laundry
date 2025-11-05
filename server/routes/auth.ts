// server/routes/auth.ts
import express from 'express';

const router = express.Router();

// Mock user data
const mockUser = {
  id: 1,
  username: 'kminchelle',
  email: 'kmin@example.com',
  firstName: 'Kmin',
  lastName: 'Chell',
  gender: 'female',
  image: 'https://i.pravatar.cc/150?img=1',
};

// GET /auth/me - Get current user profile
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Simple token validation (in production, verify JWT)
  if (token && token !== 'invalid') {
    res.json(mockUser);
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
});

export { router as authRouter };

