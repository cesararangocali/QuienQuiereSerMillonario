<template>
  <v-dialog v-model="internalShow" max-width="760" persistent>
    <v-card class="victory-card qqss-ring" elevation="24">
      <div class="cele-bg" />
      <div class="confetti-layer">
        <div
          v-for="(c, i) in confetti"
          :key="i"
          class="confetti"
          :style="{
            left: c.left + '%',
            width: c.size + 'px',
            height: c.size * 0.4 + 'px',
            background: c.color,
            animationDelay: c.delay + 'ms',
            animationDuration: c.duration + 'ms',
            transform: 'rotate(' + c.rotate + 'deg)'
          }"
        />
      </div>

      <div class="victory-header text-center">
        <div class="trophy-wrap">
          <div class="trophy-glow" :style="trophyGlowStyle" />
          <v-icon size="84" color="amber-accent-3" class="trophy">mdi-trophy</v-icon>
          <div class="burst" />
          <div class="spark-layer">
            <div class="spark s1" /><div class="spark s2" /><div class="spark s3" />
            <div class="spark s4" /><div class="spark s5" /><div class="spark s6" />
            <div class="spark s7" /><div class="spark s8" /><div class="spark s9" />
            <div class="spark s10" /><div class="spark s11" /><div class="spark s12" />
          </div>
        </div>
        <h2 class="victory-title">{{ title || '¡Felicitaciones!' }}</h2>
        <div class="victory-sub">{{ subtitle }}</div>
      </div>

      <v-card-text class="text-center">
        <p class="victory-message" :class="{ 'fade-in-up': messageVisible }">{{ message }}</p>

        <div class="points-badge">
          <v-icon size="28" color="yellow">mdi-star-circle</v-icon>
          <span class="points-text">{{ displayPoints.toLocaleString() }} pts</span>
          <v-icon size="28" color="yellow">mdi-star-circle</v-icon>
        </div>
      </v-card-text>

      <v-card-actions class="justify-center pa-4">
        <v-btn
          color="primary"
          size="large"
          variant="elevated"
          class="qqss-ring mx-2"
          prepend-icon="mdi-refresh"
          @click="onPlayAgain"
        >
          Jugar de Nuevo
        </v-btn>
        <v-btn
          color="secondary"
          size="large"
          variant="elevated"
          class="qqss-ring mx-2"
          prepend-icon="mdi-account-switch"
          @click="onChangeUser"
        >
          Cambiar Usuario
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  points: { type: Number, default: 0 },
  confettiDelayMs: { type: Number, default: 220 },
})

const emit = defineEmits(['update:modelValue','play-again','change-user'])
const internalShow = ref(props.modelValue)
watch(() => props.modelValue, v => {
  internalShow.value = v
  if (v) startCelebration()
})
watch(internalShow, v => emit('update:modelValue', v))

const subtitle = computed(() => '¡Has completado el desafío y alcanzado la santidad!')

// Animación de conteo de puntos
const displayPoints = ref(0)
const glowAmt = ref(0) // 0..1
const messageVisible = ref(false)
function animatePoints(to) {
  const start = 0
  const duration = 1200
  const t0 = performance.now()
  function step(t){
    const p = Math.min(1, (t - t0)/duration)
    const ease = 1 - Math.pow(1 - p, 3)
    displayPoints.value = Math.round(start + (to - start) * ease)
    // 3 latidos durante el conteo
    const beat = Math.sin(ease * Math.PI * 3)
    glowAmt.value = Math.max(0, beat) ** 2
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// Confetti simple CSS
const confetti = ref([])
function makeConfetti(){
  const colors = ['#ff5252','#ffb300','#00e5ff','#7c4dff','#69f0ae','#ffd740']
  const arr = []
  const n = 80
  for (let i = 0; i < n; i++) {
    arr.push({
      left: Math.random()*100,
      size: 6 + Math.random()*10,
      color: colors[Math.floor(Math.random()*colors.length)],
      delay: Math.random()*600,
      duration: 2500 + Math.random()*1800,
      rotate: Math.random()*360
    })
  }
  confetti.value = arr
}

function startCelebration(){
  // sincronizar confetti con audio de victoria
  setTimeout(() => { makeConfetti() }, Math.max(0, props.confettiDelayMs))
  animatePoints(props.points || 0)
  // revelar mensaje con un pequeño retardo
  messageVisible.value = false
  setTimeout(() => { messageVisible.value = true }, 180)
}

// Acciones
function onPlayAgain(){
  emit('play-again')
  internalShow.value = false
}
function onChangeUser(){
  emit('change-user')
  internalShow.value = false
}

// estilo reactivo del resplandor del trofeo
const trophyGlowStyle = computed(() => {
  const blur = 2 + glowAmt.value * 6
  const spread = 10 + glowAmt.value * 24
  const alpha = 0.28 + glowAmt.value * 0.45
  return {
    boxShadow: `0 0 ${spread}px ${Math.max(8, spread * 0.35)}px rgba(255,215,64,${alpha})`,
    filter: `blur(${blur}px)`
  }
})
</script>

<style scoped>
.victory-card {
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at top, rgba(255,255,255,0.06), rgba(103,80,164,0.08));
}
.cele-bg {
  position: absolute;
  inset: 0;
  background: conic-gradient(from 180deg at 50% 50%, rgba(255,215,64,0.18), rgba(103,80,164,0.18), rgba(0,184,212,0.18), rgba(255,215,64,0.18));
  filter: blur(24px);
  opacity: .45;
  animation: swirl 8s linear infinite;
}
@keyframes swirl {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.04); }
  100% { transform: rotate(360deg) scale(1); }
}
.confetti-layer { pointer-events: none; position: absolute; inset: 0; overflow: hidden; }
.confetti {
  position: absolute;
  top: -10px;
  border-radius: 2px;
  opacity: 0.9;
  animation-name: fall, spin;
  animation-timing-function: ease-in, linear;
  animation-iteration-count: 1, infinite;
}
@keyframes fall {
  0% { transform: translateY(-20px) rotate(0deg); }
  100% { transform: translateY(110vh) rotate(360deg); }
}
@keyframes spin {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(90deg); }
}
.victory-header { position: relative; z-index: 1; padding-top: 12px; }
.trophy-wrap { position: relative; display: inline-block; }
.trophy-glow { position: absolute; inset: -10px; border-radius: 50%; z-index: 0; }
.trophy { filter: drop-shadow(0 8px 18px rgba(255,215,64,0.45)); animation: pop 900ms ease-out; }
@keyframes pop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
.burst { position: absolute; inset: -6px; border-radius: 50%; box-shadow: 0 0 0 0 rgba(255,215,64,0.5); animation: burst 1.2s ease-out 1; }
@keyframes burst { 0% { box-shadow: 0 0 0 0 rgba(255,215,64,0.65); } 100% { box-shadow: 0 0 0 28px rgba(255,215,64,0); } }
.victory-title { font-size: 32px; font-weight: 900; letter-spacing: .5px; margin-top: 8px; text-shadow: 0 2px 14px rgba(0,0,0,.2); }
.victory-sub { color: rgba(255,255,255,0.7); font-size: 14px; margin-top: 2px; }
.victory-message { font-size: 16px; margin-top: 8px; }
.fade-in-up { animation: fin 600ms ease-out 1 both; }
@keyframes fin { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.points-badge { margin-top: 14px; display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; background: rgba(255,255,255,0.06); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 26px rgba(0,0,0,.18); backdrop-filter: blur(4px); }
.points-text { font-size: 22px; font-weight: 800; letter-spacing: .4px; color: #ffeb3b; text-shadow: 0 0 12px rgba(255,235,59,.35); }

/* Sparkles layer around trophy */
.spark-layer { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; }
.spark { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,215,64,0.45) 60%, rgba(255,215,64,0) 70%); box-shadow: 0 0 12px rgba(255,215,64,.85); opacity: 0; animation: spark-flicker 1600ms ease-in-out infinite; }
/* Position sparks at fixed angles around trophy */
.spark.s1 { transform: rotate(0deg) translateX(68px); animation-delay: 0ms }
.spark.s2 { transform: rotate(30deg) translateX(72px); animation-delay: 120ms }
.spark.s3 { transform: rotate(60deg) translateX(66px); animation-delay: 240ms }
.spark.s4 { transform: rotate(90deg) translateX(74px); animation-delay: 360ms }
.spark.s5 { transform: rotate(120deg) translateX(70px); animation-delay: 480ms }
.spark.s6 { transform: rotate(150deg) translateX(68px); animation-delay: 600ms }
.spark.s7 { transform: rotate(180deg) translateX(72px); animation-delay: 720ms }
.spark.s8 { transform: rotate(210deg) translateX(66px); animation-delay: 840ms }
.spark.s9 { transform: rotate(240deg) translateX(74px); animation-delay: 960ms }
.spark.s10 { transform: rotate(270deg) translateX(70px); animation-delay: 1080ms }
.spark.s11 { transform: rotate(300deg) translateX(68px); animation-delay: 1200ms }
.spark.s12 { transform: rotate(330deg) translateX(72px); animation-delay: 1320ms }

@keyframes spark-flicker {
  0% { transform: scale(0.4) translateX(0); opacity: 0; filter: blur(0px); }
  20% { opacity: 1; }
  40% { transform: scale(1) translateX(0); opacity: .95; filter: blur(0.2px); }
  60% { transform: scale(0.9) translateX(2px); opacity: .9; }
  80% { transform: scale(1.1) translateX(-2px); opacity: .8; }
  100% { transform: scale(0.4) translateX(0); opacity: 0; }
}

@media (max-width: 480px) {
  .victory-title { font-size: 26px; }
  .points-text { font-size: 20px; }
}
</style>
