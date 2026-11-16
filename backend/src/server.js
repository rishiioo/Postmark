import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { config } from './env.js';
import threadsRoute from './routes/threads.js';
import rulesRoute from './routes/rules.js';
import chatRoute from './routes/chat.js';
import simulateRoute from './routes/simulate.js';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: config.clientUrls, credentials: true }));

app.get('/', (_req, res) => res.send('Postmark API is running'));
app.get('/api/health', (_req, res) => res.json({ ok: true, llm: Boolean(config.llm.apiKey) }));

app.use('/api/threads', threadsRoute);
app.use('/api/rules', rulesRoute);
app.use('/api/chat', chatRoute);
app.use('/api/simulate-email', simulateRoute);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Something went wrong' });
});

await connectDB();
app.listen(config.port, () => console.log(`Postmark API listening on port ${config.port}`));
