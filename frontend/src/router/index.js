import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import GameView from '../views/GameView.vue';
import CatechesisView from '../views/CatechesisView.vue';
import CompetitiveView from '../views/CompetitiveView.vue';
import AdminView from '../views/AdminView.vue';
import StatsView from '../views/StatsView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/juego', component: GameView },
  { path: '/catequesis', component: CatechesisView },
  { path: '/competitivo', component: CompetitiveView },
  { path: '/admin', component: AdminView },
  { path: '/estadisticas', component: StatsView },
];

export default createRouter({ history: createWebHistory(), routes });
