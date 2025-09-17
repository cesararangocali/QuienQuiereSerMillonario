import { Router } from 'express';
import { getQuestionByDifficulty, useFiftyFifty, getVerseHint, submitScore, callAFriend, getPrayers, checkAnswer, getCategories } from '../controllers/gameController.js';
import { isLockedMiddleware } from '../middlewares/lock.js';

const router = Router();

router.get('/question/:difficulty', isLockedMiddleware, getQuestionByDifficulty);
router.post('/lifeline/50-50', isLockedMiddleware, useFiftyFifty);
router.get('/lifeline/verse/:questionId', isLockedMiddleware, getVerseHint);
router.post('/lifeline/call', isLockedMiddleware, callAFriend);
router.post('/score', isLockedMiddleware, submitScore);
router.get('/prayers', getPrayers);
router.post('/answer', isLockedMiddleware, checkAnswer);
router.get('/categories', getCategories);

export default router;
