// Route definitions for thread operations
// TODO: Implement routes
// - GET /api/threads - list all threads
// - GET /api/threads/:id - get specific thread
// - POST /api/threads - create new thread
// - PUT /api/threads/:id - update thread
// - DELETE /api/threads/:id - delete thread

import express from 'express';
import {
  listThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
} from '../controllers/threads.js';

const router = express.Router();

router.get('/', listThreads);
router.get('/:id', getThread);
router.post('/', createThread);
router.put('/:id', updateThread);
router.delete('/:id', deleteThread);

export default router;