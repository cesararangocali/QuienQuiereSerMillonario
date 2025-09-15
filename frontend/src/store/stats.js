import { defineStore } from 'pinia';

export const useStatsStore = defineStore('stats', {
  state: () => ({
    answers: [], // { category, correct, verseHint }
  }),
  getters: {
    categoriesCount: (s) => s.answers.reduce((acc, a) => { acc[a.category] = (acc[a.category]||0) + 1; return acc; }, {}),
    learnedVerses: (s) => Array.from(new Set(s.answers.filter(a => a.verseHint).map(a => a.verseHint))),
    correctRate: (s) => {
      if (!s.answers.length) return 0; const c = s.answers.filter(a => a.correct).length; return Math.round((100*c)/s.answers.length);
    }
  },
  actions: {
    recordAnswer(q, correct){ this.answers.push({ category: q.category, correct, verseHint: q.verseHint }); },
    reset(){ this.answers = []; },
  }
});
