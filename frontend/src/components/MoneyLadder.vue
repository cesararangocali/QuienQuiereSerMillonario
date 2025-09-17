<template>
  <v-card class="pa-2 qqss-ring ladder-card" elevation="6">
    <v-card-title class="text-subtitle-1 py-1">Puntuación</v-card-title>
    <v-list density="compact" class="ladder-list">
      <transition-group name="ladder" tag="div">
        <v-list-item
          v-for="(value, i) in visibleValues"
          :key="baseIndex + i"
          class="ladder-item"
        >
          <div
            class="ladder-row"
            :class="{ active: (baseIndex + i + 1) === current, safe: safeSteps.includes(baseIndex + i + 1) }"
          >
            <div class="left-accent" :class="{ show: (baseIndex + i + 1) === current }" />
            <div class="spark-layer" v-if="(baseIndex + i + 1) === current">
              <span class="spark s1" /><span class="spark s2" /><span class="spark s3" />
              <span class="spark s4" /><span class="spark s5" />
            </div>
            <v-list-item-title class="ladder-title" :class="{ 'text-yellow-accent-3': (baseIndex + i + 1) === current }">
              <span class="step-index">{{ (baseIndex + i + 1).toString().padStart(2,'0') }}</span>
              <span class="step-sep">—</span>
              <span class="step-value">
                <v-icon v-if="safeSteps.includes(baseIndex + i + 1)" size="14" class="mr-1" color="cyan">mdi-shield-check</v-icon>
                {{ formatPoints(value) }}
              </span>
            </v-list-item-title>
            <div class="shine" v-if="(baseIndex + i + 1) === current" />
          </div>
        </v-list-item>
      </transition-group>
    </v-list>
  </v-card>
 </template>
<script setup>
import { computed } from 'vue';
import { LADDER_VALUES, formatPoints } from '../constants/ladder.js';
const props = defineProps({ current: { type: Number, default: 1 } });
const steps = LADDER_VALUES;
const safeSteps = [5, 10, 15];

// Ventana de 7 elementos con el actual centrado (posición 4) cuando sea posible
const baseIndex = computed(() => {
  const currIdx = Math.max(0, Math.min(steps.length - 1, (props.current || 1) - 1));
  let start = currIdx - 3; // centrar actual en índice 3 de la ventana
  if (start < 0) start = 0;
  if (start + 7 > steps.length) start = Math.max(0, steps.length - 7);
  return start;
});
const visibleValues = computed(() => steps.slice(baseIndex.value, Math.min(steps.length, baseIndex.value + 7)));
</script>

<style scoped>
.ladder-card { max-width: 280px; width: 100%; }
.ladder-list { padding-top: 2px; position: relative; }
.ladder-item { min-height: 22px; padding-top: 0; padding-bottom: 0; }
.ladder-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1px 6px;
  border-radius: 6px;
}
.ladder-row.active {
  animation: pulse 1200ms ease-in-out infinite;
  background: linear-gradient(90deg, rgba(255,235,59,0.06), rgba(255,255,255,0.02));
  box-shadow: inset 0 0 0 1px rgba(255,235,59,0.12);
}
.ladder-row.safe:not(.active) {
  background: linear-gradient(90deg, rgba(0,188,212,0.06), rgba(255,255,255,0.02));
  box-shadow: inset 0 0 0 1px rgba(0,188,212,0.12);
}
.ladder-title { font-size: 0.92rem; line-height: 1.05; }
.ladder-row.active .ladder-title { font-size: 1rem; }
.step-index { opacity: .8; font-variant-numeric: tabular-nums; }
.step-sep { display: inline-block; padding: 0 6px; opacity: .5; }
.left-accent { position: absolute; left: 0; top: 4px; bottom: 4px; width: 3px; border-radius: 2px; background: linear-gradient(180deg, #ffe082, #ffd54f); opacity: 0; transition: opacity .18s; }
.left-accent.show { opacity: 1; }

/* Shine overlay for active row */
.shine { position: absolute; inset: 0; overflow: hidden; border-radius: 6px; pointer-events: none; }
.shine::after { content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.18), rgba(255,255,255,0)); transform: skewX(-20deg); animation: sweep 1800ms ease-in-out infinite; }
@keyframes sweep { 0% { left: -60%; } 60% { left: 120%; } 100% { left: 120%; } }
@keyframes pulse {
  0% { transform: scale(1); box-shadow: inset 0 0 0 1px rgba(255,235,59,0.12); }
  50% { transform: scale(1.01); box-shadow: inset 0 0 0 2px rgba(255,235,59,0.22); }
  100% { transform: scale(1); box-shadow: inset 0 0 0 1px rgba(255,235,59,0.12); }
}

.spark-layer { position: absolute; inset: 0; pointer-events: none; }
.spark { position: absolute; width: 4px; height: 4px; border-radius: 50%; opacity: 0; background: radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,215,64,0.5) 60%, rgba(255,215,64,0) 70%); box-shadow: 0 0 8px rgba(255,215,64,.6); animation: spark-out 1400ms ease-in-out infinite; }
.spark.s1 { top: 50%; left: 4px; transform: translate(-50%, -50%); animation-delay: 0ms }
.spark.s2 { top: 50%; right: 4px; transform: translate(50%, -50%); animation-delay: 220ms }
.spark.s3 { top: 4px; left: 50%; transform: translate(-50%, -50%); animation-delay: 440ms }
.spark.s4 { bottom: 4px; left: 40%; transform: translate(-50%, 50%); animation-delay: 660ms }
.spark.s5 { bottom: 6px; right: 30%; transform: translate(50%, 50%); animation-delay: 880ms }
@keyframes spark-out {
  0% { opacity: 0; transform: scale(0.6); }
  20% { opacity: .95; }
  50% { opacity: .9; }
  100% { opacity: 0; transform: scale(1.2); }
}

/* Transition-group animations */
.ladder-enter-from, .ladder-leave-to { opacity: 0; transform: translateY(4px); }
.ladder-enter-active, .ladder-leave-active { transition: all .18s ease; }
.ladder-move { transition: transform .2s ease; }

@media (max-width: 600px) {
  .ladder-card { max-width: 240px; }
  .ladder-title { font-size: 0.88rem; }
  .ladder-row.active .ladder-title { font-size: 0.96rem; }
  .ladder-scroll { max-height: 260px; }
}
</style>
