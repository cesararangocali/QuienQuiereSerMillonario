import { Router } from 'express';
import authRoutes from './auth.js';
import gameRoutes from './game.js';
import adminRoutes from './admin.js';
import rankingRoutes from './ranking.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/game', gameRoutes);
router.use('/admin', adminRoutes);
router.use('/ranking', rankingRoutes);

export default router;
