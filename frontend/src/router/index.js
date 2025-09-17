import { createRouter, createWebHistory } from 'vue-router';
import { useLockStore } from '../store/lock';
import HomeView from '../views/HomeView.vue';
import GameView from '../views/GameView.vue';
import CatechesisView from '../views/CatechesisView.vue';
import CompetitiveView from '../views/CompetitiveView.vue';
import AdminView from '../views/AdminView.vue';
import VoteView from '../views/VoteView.vue';
import StatsView from '../views/StatsView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/juego', component: GameView },
  { path: '/catequesis', component: CatechesisView },
  { path: '/competitivo', component: CompetitiveView },
  { path: '/admin', component: AdminView },
  { path: '/estadisticas', component: StatsView },
  { path: '/vote/:pollId', component: VoteView },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const lock = useLockStore();
  const isAdmin = !!localStorage.getItem('adminToken');
  if (lock.locked && !isAdmin) {
    if (to.path === '/admin') return true; // permitir login
    lock.open();
    return false;
  }
  return true;
});

export default router;
