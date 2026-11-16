import express from 'express';
import {
  listThreads, getThread, updateThread, classifyOne, classifyAll, draftForThread,
} from '../controllers/threads.js';

const router = express.Router();

router.get('/', listThreads);
router.post('/classify-all', classifyAll); // must be before '/:id'
router.get('/:id', getThread);
router.patch('/:id', updateThread);
router.post('/:id/classify', classifyOne);
router.post('/:id/draft', draftForThread);

export default router;
