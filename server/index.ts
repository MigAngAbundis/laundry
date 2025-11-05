// server/index.ts
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { postsRouter } from './routes/posts';
import { usersRouter } from './routes/users';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

