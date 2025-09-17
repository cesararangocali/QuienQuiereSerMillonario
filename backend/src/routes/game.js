import { Router } from 'express';
import { getQuestionByDifficulty, useFiftyFifty, getVerseHint, submitScore, callAFriend, getPrayers, checkAnswer, getCategories } from '../controllers/gameController.js';
import { Router as _Router } from 'express';
import { createPoll, getPoll, addVote, closePoll } from '../services/audiencePolls.js';
import { getIO } from '../services/ioHub.js';
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

// Audience poll endpoints
router.post('/poll/start', isLockedMiddleware, async (req, res) => {
	try {
		const { questionId, optionsCount, roomId } = req.body || {};
		if (!questionId || !optionsCount) return res.status(400).json({ error: 'Datos incompletos' });
		const poll = createPoll(Number(questionId), Number(optionsCount));
		// Notificar por socket si hay una sala
		try { if (roomId) getIO()?.to(roomId)?.emit('poll-started', { pollId: poll.id }); } catch {}
		res.json({ pollId: poll.id });
	} catch (e) {
		res.status(500).json({ error: 'No se pudo iniciar la encuesta' });
	}
});

router.get('/poll/:id', async (req, res) => {
	const poll = getPoll(req.params.id);
	if (!poll) return res.status(404).json({ error: 'No encontrada' });
	res.json({ id: poll.id, counts: poll.counts, closed: poll.closed });
});

router.post('/poll/:id/vote', async (req, res) => {
	const { optionIndex, voterKey, roomId } = req.body || {};
	const ret = addVote(req.params.id, Number(optionIndex), voterKey || null);
	if (!ret.ok) return res.status(400).json({ error: ret.reason });
	try { if (roomId) getIO()?.to(roomId)?.emit('poll-update', { id: req.params.id, counts: ret.counts }); } catch {}
	res.json({ ok: true, counts: ret.counts });
});

// Cerrar encuesta
router.post('/poll/:id/close', isLockedMiddleware, async (req, res) => {
	try {
		const ok = closePoll(req.params.id);
		if (!ok) return res.status(404).json({ error: 'No encontrada' });
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: 'No se pudo cerrar la encuesta' });
	}
});

export default router;
