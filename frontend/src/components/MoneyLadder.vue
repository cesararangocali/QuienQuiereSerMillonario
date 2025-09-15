<template>
  <v-card class="pa-2 qqss-ring" elevation="6">
    <v-card-title class="text-h6">Escalera</v-card-title>
    <v-list density="compact">
      <v-list-item v-for="(step, idx) in steps" :key="idx">
        <v-list-item-title :class="idx+1 === current ? 'text-yellow-accent-3' : ''">
          {{ (idx+1).toString().padStart(2,'0') }} — {{ step }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script setup>
const props = defineProps({ current: { type: Number, default: 1 } });
const steps = [
  '100', '200', '300', '500', '1.000',
  '2.000', '4.000', '8.000', '16.000', '32.000',
  '64.000', '125.000', '250.000', '500.000', '1.000.000',
];
</script>
