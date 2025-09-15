<template>
  <v-card class="pa-2 qqss-ring" elevation="6">
    <v-card-title class="text-h6">Escalera</v-card-title>
    <v-list density="compact">
      <v-list-item v-for="(step, idx) in steps" :key="idx">
        <v-list-item-title :class="idx+1 === current ? 'text-yellow-accent-3' : ''">
          {{ (idx+1).toString().padStart(2,'0') }} — {{ formatPoints(step) }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script setup>
import { LADDER_VALUES, formatPoints } from '../constants/ladder.js';
const props = defineProps({ current: { type: Number, default: 1 } });
const steps = LADDER_VALUES;
</script>
