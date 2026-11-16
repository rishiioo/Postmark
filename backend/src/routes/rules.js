import express from 'express';
import { createRule, listRules, deleteRule } from '../controllers/threads.js';

const router = express.Router();
router.get('/', listRules);
router.post('/', createRule);
router.delete('/:id', deleteRule);
export default router;
