<template>
  <v-dialog 
    v-model="model" 
    max-width="900" 
    persistent
    :scrim="false"
    transition="dialog-transition"
  >
    <!-- Fondo con efectos especiales -->
    <div class="ranking-backdrop" v-if="model">
      <!-- Partículas de fondo -->
      <div class="particles-container">
        <div 
          v-for="i in 20" 
          :key="`particle-${i}`" 
          class="particle"
          :style="{ 
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 3 + 's',
            animationDuration: (3 + Math.random() * 2) + 's'
          }"
        ></div>
      </div>
      
      <!-- Fuegos artificiales -->
      <div class="fireworks-container">
        <div 
          v-for="i in 5" 
          :key="`firework-${i}`"
          class="firework"
          :style="{ 
            left: (Math.random() * 80 + 10) + '%',
            animationDelay: Math.random() * 2 + 's'
          }"
        >
          <div class="explosion"></div>
        </div>
      </div>
    </div>

    <!-- Card principal del ranking -->
    <v-card 
      class="ranking-card elevation-24"
      :class="{ 'ranking-card-enter': model }"
    >
      <!-- Header con corona y efectos -->
      <div class="ranking-header">
        <div class="crown-container">
          <v-icon class="crown-icon" size="60" color="gold">mdi-crown</v-icon>
          <div class="crown-glow"></div>
        </div>
        <h1 class="ranking-title">
          <span class="title-text">👑 RANKING DE LA FAMA 👑</span>
        </h1>
        <p class="ranking-subtitle">Los Usuarios más Sabios</p>
        
        <!-- Efectos de brillo en el header -->
        <div class="sparkle sparkle-1">✨</div>
        <div class="sparkle sparkle-2">⭐</div>
        <div class="sparkle sparkle-3">💫</div>
        <div class="sparkle sparkle-4">🌟</div>
      </div>

      <v-divider class="ranking-divider"></v-divider>

      <!-- Lista del ranking con animaciones -->
      <v-card-text class="ranking-content">
        <div v-if="loading" class="loading-container">
          <v-progress-circular 
            indeterminate 
            color="gold" 
            size="64"
            width="6"
          ></v-progress-circular>
          <p class="loading-text">Cargando los mejores usuarios...</p>
        </div>

        <div v-else-if="ranking.length === 0" class="empty-ranking">
          <v-icon size="80" color="grey-lighten-1">mdi-trophy-outline</v-icon>
          <p class="empty-text">¡Sé el primero en aparecer aquí!</p>
        </div>

        <div v-else class="ranking-list">
          <div 
            v-for="(player, index) in ranking" 
            :key="player.id"
            class="ranking-item"
            :class="`rank-${index + 1}`"
            :style="{ animationDelay: (index * 0.1) + 's' }"
          >
            <!-- Medalla/posición -->
            <div class="rank-medal">
              <div v-if="index < 3" class="medal" :class="`medal-${index + 1}`">
                <v-icon 
                  :color="getMedalColor(index)" 
                  size="40"
                >
                  {{ getMedalIcon(index) }}
                </v-icon>
                <div class="medal-shine"></div>
              </div>
              <div v-else class="rank-number">{{ index + 1 }}</div>
            </div>

            <!-- Información del jugador -->
            <div class="player-info">
              <div class="player-name">
                {{ player.playerName }}
                <div v-if="index < 3" class="champion-effects">
                  <span class="champion-sparkle">✨</span>
                </div>
              </div>
              <div class="player-stats">
                <v-chip
                  :color="getScoreColor(index)"
                  variant="elevated"
                  class="score-chip"
                >
                  <v-icon start>mdi-star</v-icon>
                  {{ player.points.toLocaleString() }} pts
                </v-chip>
              </div>
            </div>

            <!-- Efectos de posición -->
            <div v-if="index === 0" class="first-place-effects">
              <div class="golden-rays"></div>
              <div class="floating-crowns">
                <span>👑</span>
                <span>👑</span>
                <span>👑</span>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Footer con botones mejorados -->
      <v-card-actions class="ranking-actions">
        <v-spacer />
        <v-btn 
          color="primary" 
          variant="elevated"
          size="large"
          class="action-btn close-btn"
          @click="close"
          prepend-icon="mdi-close"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue']);

const model = ref(props.modelValue);
const ranking = ref([]);
const loading = ref(false);

watch(() => props.modelValue, v => { 
  model.value = v; 
  if (v) load(); 
});

function close(){ 
  emit('update:modelValue', false); 
}

async function load(){
  loading.value = true;
  try {
    const { data } = await axios.get('/api/ranking');
    // Simular un poco de delay para mostrar la animación de carga
    await new Promise(resolve => setTimeout(resolve, 800));
    ranking.value = data;
  } catch (error) {
    console.error('Error loading ranking:', error);
  } finally {
    loading.value = false;
  }
}

function getMedalIcon(index) {
  const icons = ['mdi-trophy', 'mdi-medal', 'mdi-medal'];
  return icons[index] || 'mdi-numeric';
}

function getMedalColor(index) {
  const colors = ['#F0C419', 'silver', '#CD7F32']; // oro (usando color del juego), plata, bronce
  return colors[index] || 'grey';
}

function getScoreColor(index) {
  if (index === 0) return '#F0C419'; // Oro del juego
  if (index === 1) return 'blue-grey';  
  if (index === 2) return 'deep-orange';
  return 'primary';
}
</script>

<style scoped>
.ranking-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, rgba(30, 60, 120, 0.4) 0%, rgba(11, 27, 63, 0.9) 70%);
  z-index: 1000;
  overflow: hidden;
}

.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--qqss-accent, #F0C419);
  border-radius: 50%;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 0 6px var(--qqss-accent, #F0C419);
}

@keyframes float {
  0%, 100% { 
    transform: translateY(100vh) rotate(0deg); 
    opacity: 0; 
  }
  10% { 
    opacity: 1; 
  }
  90% { 
    opacity: 1; 
  }
  100% { 
    transform: translateY(-10vh) rotate(360deg); 
    opacity: 0; 
  }
}

.fireworks-container {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.firework {
  position: absolute;
  top: 60%;
  width: 4px;
  height: 4px;
  background: var(--qqss-accent, #F0C419);
  border-radius: 50%;
  animation: firework 2s ease-out infinite;
}

@keyframes firework {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-200px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-200px) scale(0);
    opacity: 0;
  }
}

.explosion {
  position: absolute;
  top: -200px;
  left: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  animation: explosion 1s ease-out infinite;
  animation-delay: 1s;
}

@keyframes explosion {
  0% {
    box-shadow: 0 0 0 0px rgba(240, 196, 25, 1),
                0 0 0 0px rgba(240, 196, 25, 0.8),
                0 0 0 0px rgba(240, 196, 25, 0.6);
  }
  100% {
    box-shadow: 0 0 0 30px rgba(240, 196, 25, 0),
                0 0 0 60px rgba(240, 196, 25, 0),
                0 0 0 90px rgba(240, 196, 25, 0);
  }
}

.ranking-card {
  position: relative;
  z-index: 1001;
  background: linear-gradient(135deg, 
    rgba(11,27,63,0.95) 0%, 
    rgba(30,60,120,0.95) 50%, 
    rgba(11,27,63,0.95) 100%
  );
  backdrop-filter: blur(10px);
  border: 2px solid var(--qqss-accent, #F0C419);
  border-radius: 20px !important;
  overflow: hidden;
  transform: scale(0.8);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ranking-card-enter {
  transform: scale(1);
  opacity: 1;
}

.ranking-header {
  position: relative;
  text-align: center;
  padding: 2rem 1rem 1rem;
  background: linear-gradient(90deg, 
    rgba(240,196,25,0.1) 0%, 
    rgba(240,196,25,0.2) 50%, 
    rgba(240,196,25,0.1) 100%
  );
  border-bottom: 1px solid rgba(240,196,25,0.3);
  overflow: hidden;
}

.crown-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.crown-icon {
  filter: drop-shadow(0 0 20px var(--qqss-accent, #F0C419));
  animation: crown-bounce 2s ease-in-out infinite;
  color: var(--qqss-accent, #F0C419);
}

@keyframes crown-bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

.crown-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(240,196,25,0.3), transparent);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

.ranking-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--qqss-accent, #F0C419);
  font-family: 'Arial Black', sans-serif;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  letter-spacing: 1px;
  animation: title-glow 3s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2) drop-shadow(0 0 20px var(--qqss-accent, #F0C419)); }
}

.ranking-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  margin: 0.5rem 0 0;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.sparkle {
  position: absolute;
  font-size: 1.5rem;
  animation: sparkle 3s ease-in-out infinite;
}

.sparkle-1 { top: 20%; left: 15%; animation-delay: 0s; }
.sparkle-2 { top: 30%; right: 20%; animation-delay: 0.5s; }
.sparkle-3 { bottom: 20%; left: 20%; animation-delay: 1s; }
.sparkle-4 { bottom: 30%; right: 15%; animation-delay: 1.5s; }

@keyframes sparkle {
  0%, 100% { 
    transform: scale(0.5) rotate(0deg); 
    opacity: 0.5; 
  }
  50% { 
    transform: scale(1.2) rotate(180deg); 
    opacity: 1; 
  }
}

.ranking-divider {
  background: linear-gradient(90deg, transparent, var(--qqss-accent, #F0C419), transparent);
  height: 2px;
  border: none;
}

.ranking-content {
  padding: 2rem;
  min-height: 400px;
}

.loading-container {
  text-align: center;
  padding: 3rem 0;
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin-top: 1rem;
}

.empty-ranking {
  text-align: center;
  padding: 3rem 0;
}

.empty-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  margin-top: 1rem;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ranking-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(240, 196, 25, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(240, 196, 25, 0.2);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-50px);
  animation: item-enter 0.6s ease forwards;
}

@keyframes item-enter {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ranking-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  background: rgba(240, 196, 25, 0.15);
  border-color: rgba(240, 196, 25, 0.4);
}

.rank-1 {
  background: linear-gradient(135deg, rgba(240, 196, 25, 0.3), rgba(240, 196, 25, 0.2));
  border: 2px solid rgba(240, 196, 25, 0.5);
}

.rank-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.3), rgba(169, 169, 169, 0.2));
  border: 2px solid rgba(192, 192, 192, 0.5);
}

.rank-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.3), rgba(184, 115, 51, 0.2));
  border: 2px solid rgba(205, 127, 50, 0.5);
}

.rank-medal {
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medal {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(240, 196, 25, 0.2), rgba(240, 196, 25, 0.1));
  animation: medal-spin 4s linear infinite;
}

@keyframes medal-spin {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
}

.medal-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(240, 196, 25, 0.6), transparent);
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

.rank-number {
  width: 40px;
  height: 40px;
  background: rgba(240, 196, 25, 0.2);
  border: 1px solid rgba(240, 196, 25, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--qqss-accent, #F0C419);
}

.player-info {
  flex: 1;
}

.player-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
  position: relative;
}

.champion-effects {
  display: inline-block;
  margin-left: 0.5rem;
}

.champion-sparkle {
  animation: champion-twinkle 2s ease-in-out infinite;
}

@keyframes champion-twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.score-chip {
  font-weight: bold;
  font-size: 1rem !important;
}

.first-place-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.golden-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  background: conic-gradient(from 0deg, transparent, rgba(240, 196, 25, 0.3), transparent, rgba(240, 196, 25, 0.3), transparent);
  border-radius: 50%;
  animation: rotate 8s linear infinite;
}

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.floating-crowns {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.floating-crowns span {
  font-size: 1rem;
  animation: float-crown 3s ease-in-out infinite;
}

.floating-crowns span:nth-child(1) { animation-delay: 0s; }
.floating-crowns span:nth-child(2) { animation-delay: 0.5s; }
.floating-crowns span:nth-child(3) { animation-delay: 1s; }

@keyframes float-crown {
  0%, 100% { transform: translateY(0px); opacity: 0.7; }
  50% { transform: translateY(-10px); opacity: 1; }
}

.ranking-actions {
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(240, 196, 25, 0.3);
}

.action-btn {
  font-weight: bold;
  border-radius: 25px;
  padding: 0 2rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.close-btn {
  background: linear-gradient(45deg, rgba(63,81,181,0.9) 0%, rgba(63,81,181,1) 100%) !important;
  box-shadow: 0 4px 15px rgba(63,81,181,0.4);
}

.close-btn:hover {
  box-shadow: 0 6px 20px rgba(63,81,181,0.6);
}

/* Responsive */
@media (max-width: 600px) {
  .ranking-title {
    font-size: 2rem;
  }
  
  .ranking-item {
    padding: 0.8rem;
  }
  
  .medal {
    width: 50px;
    height: 50px;
  }
  
  .player-name {
    font-size: 1.1rem;
  }
}
</style>
