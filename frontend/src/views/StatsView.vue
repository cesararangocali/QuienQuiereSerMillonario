<template>
  <v-container>
    <h2>Estadísticas</h2>
    <p>Tasa de aciertos: {{ correctRate }}%</p>
    <h3>Categorías dominadas</h3>
    <v-list>
      <v-list-item v-for="(count, cat) in categoriesCount" :key="cat">
        <v-list-item-title>{{ cat }} — {{ count }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <h3>Versículos aprendidos</h3>
    <ul>
      <li v-for="v in learnedVerses" :key="v">{{ v }}</li>
    </ul>
  </v-container>
</template>
<script setup>
import { storeToRefs } from 'pinia';
import { useStatsStore } from '../store/stats';
const stats = useStatsStore();
const { categoriesCount, learnedVerses, correctRate } = storeToRefs(stats);
</script>
