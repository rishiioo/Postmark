import express from 'express';
import { simulateEmail } from '../controllers/threads.js';

const router = express.Router();
router.post('/', simulateEmail);
export default router;
