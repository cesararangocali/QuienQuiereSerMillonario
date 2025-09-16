<template>
  <v-card class="pa-2 qqss-ring ladder-card" elevation="6">
    <v-card-title class="text-h6 py-2">Escalera</v-card-title>
    <v-list density="compact" class="ladder-list">
      <v-list-item
        v-for="(step, idx) in steps"
        :key="idx"
        class="ladder-item"
      >
        <div class="ladder-row" :class="{ active: idx + 1 === current }">
          <div class="spark-layer" v-if="idx + 1 === current">
            <span class="spark s1" /><span class="spark s2" /><span class="spark s3" />
            <span class="spark s4" /><span class="spark s5" />
          </div>
          <v-list-item-title class="ladder-title" :class="{ 'text-yellow-accent-3': idx + 1 === current }">
            {{ (idx+1).toString().padStart(2,'0') }} — {{ formatPoints(step) }}
          </v-list-item-title>
        </div>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script setup>
import { LADDER_VALUES, formatPoints } from '../constants/ladder.js';
const props = defineProps({ current: { type: Number, default: 1 } });
const steps = LADDER_VALUES;
</script>

<style scoped>
.ladder-card {
  max-width: 280px;
  width: 100%;
}
.ladder-list {
  padding-top: 4px;
}
.ladder-item {
  min-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.ladder-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 8px;
}
.ladder-row.active {
  animation: pulse 1200ms ease-in-out infinite;
  background: linear-gradient(90deg, rgba(255,235,59,0.06), rgba(255,255,255,0.02));
  box-shadow: inset 0 0 0 1px rgba(255,235,59,0.12);
}
.ladder-title {
  font-size: 0.96rem;
}
.ladder-row.active .ladder-title {
  font-size: 1.06rem;
}
@keyframes pulse {
  0% { transform: scale(1); box-shadow: inset 0 0 0 1px rgba(255,235,59,0.12); }
  50% { transform: scale(1.01); box-shadow: inset 0 0 0 2px rgba(255,235,59,0.22); }
  100% { transform: scale(1); box-shadow: inset 0 0 0 1px rgba(255,235,59,0.12); }
}

.spark-layer { position: absolute; inset: 0; pointer-events: none; }
.spark { position: absolute; width: 6px; height: 6px; border-radius: 50%; opacity: 0; background: radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,215,64,0.5) 60%, rgba(255,215,64,0) 70%); box-shadow: 0 0 10px rgba(255,215,64,.7); animation: spark-out 1400ms ease-in-out infinite; }
.spark.s1 { top: 50%; left: 6px; transform: translate(-50%, -50%); animation-delay: 0ms }
.spark.s2 { top: 50%; right: 6px; transform: translate(50%, -50%); animation-delay: 220ms }
.spark.s3 { top: 6px; left: 50%; transform: translate(-50%, -50%); animation-delay: 440ms }
.spark.s4 { bottom: 6px; left: 40%; transform: translate(-50%, 50%); animation-delay: 660ms }
.spark.s5 { bottom: 8px; right: 30%; transform: translate(50%, 50%); animation-delay: 880ms }
@keyframes spark-out {
  0% { opacity: 0; transform: scale(0.6); }
  20% { opacity: .95; }
  50% { opacity: .9; }
  100% { opacity: 0; transform: scale(1.2); }
}

@media (max-width: 600px) {
  .ladder-card { max-width: 240px; }
  .ladder-title { font-size: 0.9rem; }
  .ladder-row.active .ladder-title { font-size: 1rem; }
}
</style>
