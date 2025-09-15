import { Router } from 'express';
import { getRanking } from '../controllers/gameController.js';

const router = Router();
router.get('/', getRanking);

export default router;
