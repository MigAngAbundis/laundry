// server/routes/users.ts
import express from 'express';

const router = express.Router();

// GET /users?limit=100 - Fetch from dummyjson.com
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;

    // Fetch from dummyjson.com
    const response = await fetch(`https://dummyjson.com/users?limit=${limit}&skip=${skip}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users from dummyjson.com: ${response.statusText}`);
    }

    const data = await response.json();
    
    res.json({
      users: data.users,
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching users' });
  }
});

export { router as usersRouter };

