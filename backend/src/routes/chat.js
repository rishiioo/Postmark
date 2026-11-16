import express from 'express';
import { chat } from '../controllers/threads.js';

const router = express.Router();
router.post('/', chat);
export default router;
