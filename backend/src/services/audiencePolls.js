import crypto from 'crypto';

const polls = new Map();

function genId() {
  return crypto.randomBytes(6).toString('hex');
}

export function createPoll(questionId, optionsCount) {
  const id = genId();
  const counts = Array.from({ length: optionsCount }, () => 0);
  const voters = new Set();
  const poll = { id, questionId, counts, voters, createdAt: Date.now(), closed: false };
  polls.set(id, poll);
  return poll;
}

export function getPoll(id) {
  return polls.get(id) || null;
}

export function addVote(id, optionIndex, voterKey) {
  const poll = polls.get(id);
  if (!poll || poll.closed) return { ok: false, reason: 'not_found' };
  if (optionIndex < 0 || optionIndex >= poll.counts.length) return { ok: false, reason: 'bad_option' };
  if (voterKey) {
    const key = String(voterKey);
    if (poll.voters.has(key)) return { ok: false, reason: 'already_voted' };
    poll.voters.add(key);
  }
  poll.counts[optionIndex] += 1;
  return { ok: true, counts: poll.counts };
}

export function closePoll(id) {
  const poll = polls.get(id);
  if (!poll) return false;
  poll.closed = true;
  return true;
}
