import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { config } from './env.js';
import threadsRoute from './routes/threads.js';

dotenv.config();

const app = express();

app.use(express.json());

// Allow the local dev server and the deployed frontend (set FRONTEND_URL on Render).
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000'].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

connectDB();

const PORT = config.port;

app.get('/', (req, res) => {
  res.send('AI Email Management Dashboard Backend API');
});

app.use('/api/threads', threadsRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
