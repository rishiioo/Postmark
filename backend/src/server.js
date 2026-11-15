import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { config } from './env.js';
import threadsRoute from './routes/threads.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));

connectDB();

const PORT = config.port;

app.get('/', (req, res) => {
  res.send('AI Email Management Dashboard Backend API');
});

app.use('/api/threads', threadsRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
