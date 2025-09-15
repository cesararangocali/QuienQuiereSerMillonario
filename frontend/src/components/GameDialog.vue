<template>
  <v-dialog 
    v-model="localShow" 
    max-width="500" 
    persistent
    transition="dialog-transition"
  >
    <v-card 
      class="game-dialog qqss-ring text-center"
      elevation="20"
    >
      <div class="game-dialog-header">
        <v-icon 
          :icon="iconName" 
          :color="iconColor" 
          size="48" 
          class="dialog-icon"
        />
        <h2 class="dialog-title">{{ title }}</h2>
      </div>

      <v-card-text class="dialog-content">
        <p class="dialog-message">{{ message }}</p>
        <div v-if="showPoints" class="points-display">
          <v-icon icon="mdi-star" color="yellow" class="mr-1" />
          <span class="points-text">{{ points }} puntos</span>
          <v-icon icon="mdi-star" color="yellow" class="ml-1" />
        </div>
      </v-card-text>

      <v-card-actions class="justify-center pb-6">
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          class="qqss-ring dialog-btn"
          @click="handleClose"
          prepend-icon="mdi-check"
        >
          {{ buttonText }}
        </v-btn>
      </v-card-actions>

      <!-- Partículas de fondo animadas -->
      <div class="dialog-particles">
        <div v-for="n in particleCount" :key="n" class="particle" :style="{ 
          animationDelay: `${n * 0.3}s`,
          left: `${15 + (n * 12) % 70}%`,
          top: `${20 + (n % 4) * 20}%`
        }"></div>
      </div>

      <!-- Confetti para éxitos -->
      <div v-if="type === 'success'" class="confetti-container">
        <div v-for="n in 15" :key="`confetti-${n}`" class="confetti" :style="{
          left: `${Math.random() * 100}%`,
          animationDelay: `${n * 0.1}s`,
          backgroundColor: confettiColors[n % confettiColors.length]
        }"></div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  type: {
    type: String,
    default: 'info',
    validator: value => ['success', 'error', 'warning', 'info', 'hint'].includes(value)
  },
  title: String,
  message: String,
  points: Number,
  buttonText: {
    type: String,
    default: 'Aceptar'
  }
});

const emit = defineEmits(['update:show', 'close']);

// Sonidos para cada tipo de dialog
const sounds = {
  success: new Audio('/audio/correct.mp3'),
  error: new Audio('/audio/wrong.mp3'),
  warning: new Audio('/audio/bg.mp3'), // Temporalmente usar el audio disponible
  hint: new Audio('/audio/correct.mp3'),
  info: new Audio('/audio/correct.mp3')
};

// Reproducir sonido cuando se muestra el dialog
watch(() => props.show, (newValue) => {
  if (newValue && sounds[props.type]) {
    sounds[props.type].currentTime = 0;
    sounds[props.type].volume = 0.3;
    sounds[props.type].play().catch(() => {});
  }
});

const localShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

const iconName = computed(() => {
  switch (props.type) {
    case 'success': return 'mdi-trophy';
    case 'error': return 'mdi-close-circle';
    case 'warning': return 'mdi-clock-alert';
    case 'hint': return 'mdi-lightbulb';
    default: return 'mdi-information';
  }
});

const iconColor = computed(() => {
  switch (props.type) {
    case 'success': return 'yellow';
    case 'error': return 'red';
    case 'warning': return 'orange';
    case 'hint': return 'purple';
    default: return 'blue';
  }
});

const showPoints = computed(() => props.points !== undefined && props.points !== null);

const particleCount = computed(() => {
  switch (props.type) {
    case 'success': return 12;
    case 'error': return 6;
    case 'warning': return 8;
    case 'hint': return 10;
    default: return 6;
  }
});

const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];

function handleClose() {
  emit('close');
  localShow.value = false;
}
</script>

<style scoped>
.game-dialog {
  background: linear-gradient(135deg, 
    rgba(11,27,63,0.95) 0%, 
    rgba(30,60,120,0.95) 50%, 
    rgba(11,27,63,0.95) 100%
  );
  backdrop-filter: blur(10px);
  border: 2px solid var(--qqss-accent);
  position: relative;
  overflow: hidden;
}

.game-dialog-header {
  background: linear-gradient(90deg, 
    rgba(240,196,25,0.1) 0%, 
    rgba(240,196,25,0.2) 50%, 
    rgba(240,196,25,0.1) 100%
  );
  padding: 24px;
  border-bottom: 1px solid rgba(240,196,25,0.3);
  position: relative;
}

.dialog-icon {
  animation: iconPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 10px currentColor);
}

.dialog-title {
  color: var(--qqss-accent);
  font-family: 'Arial Black', sans-serif;
  font-size: 1.8rem;
  margin: 16px 0 0 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  letter-spacing: 1px;
}

.dialog-content {
  padding: 32px 24px;
}

.dialog-message {
  color: white;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 16px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.points-display {
  background: linear-gradient(90deg, 
    rgba(240,196,25,0.1) 0%, 
    rgba(240,196,25,0.2) 50%, 
    rgba(240,196,25,0.1) 100%
  );
  border: 1px solid rgba(240,196,25,0.4);
  border-radius: 25px;
  padding: 12px 24px;
  margin: 16px auto;
  display: inline-flex;
  align-items: center;
  animation: pointsGlow 2s ease-in-out infinite alternate;
}

.points-text {
  color: var(--qqss-accent);
  font-size: 1.4rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.dialog-btn {
  min-width: 150px;
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(45deg, 
    rgba(63,81,181,0.9) 0%, 
    rgba(63,81,181,1) 100%
  );
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(63,81,181,0.4);
}

.dialog-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(63,81,181,0.6);
}

/* Partículas animadas */
.dialog-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--qqss-accent);
  border-radius: 50%;
  animation: particleFloat 3s ease-in-out infinite;
  opacity: 0.6;
  box-shadow: 0 0 6px var(--qqss-accent);
}

/* Confetti para celebración */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  top: -10px;
  border-radius: 2px;
  animation: confettiFall 3s linear infinite;
  opacity: 0.9;
}

/* Animaciones */
@keyframes confettiFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(400px) rotate(360deg);
    opacity: 0;
  }
}
@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes pointsGlow {
  0% { box-shadow: 0 0 10px rgba(240,196,25,0.5); }
  100% { box-shadow: 0 0 20px rgba(240,196,25,0.8), 0 0 30px rgba(240,196,25,0.4); }
}

@keyframes particleFloat {
  0%, 100% { 
    transform: translateY(0px) scale(1);
    opacity: 0.6; 
  }
  50% { 
    transform: translateY(-10px) scale(1.2);
    opacity: 1; 
  }
}

/* Transición del dialog */
:deep(.v-dialog-transition-enter-active) {
  animation: dialogEnter 0.5s ease-out;
}

:deep(.v-dialog-transition-leave-active) {
  animation: dialogLeave 0.3s ease-in;
}

@keyframes dialogEnter {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(-100px) rotate(-10deg);
    filter: blur(10px);
  }
  50% {
    transform: scale(1.05) translateY(-20px) rotate(2deg);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0) rotate(0deg);
    filter: blur(0px);
  }
}

@keyframes dialogLeave {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) rotate(5deg);
  }
}

/* Responsivo */
@media (max-width: 600px) {
  .dialog-title {
    font-size: 1.5rem;
  }
  
  .dialog-message {
    font-size: 1.1rem;
  }
  
  .points-text {
    font-size: 1.2rem;
  }
}
</style>
