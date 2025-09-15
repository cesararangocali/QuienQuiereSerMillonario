<template>
  <v-container>
    <h2>Catequesis (sin límite de tiempo)</h2>
    <div v-if="!started" class="my-4">
      <v-text-field v-model="playerName" label="Tu nombre (opcional)" />
      <v-btn color="teal" @click="start">Comenzar</v-btn>
    </div>
    <div v-else>
      <QuestionCard :question="question" :options="options" :selected="selected" @select="onSelect" />
      <v-btn color="success" class="my-3" :disabled="selected===null" @click="check">Responder</v-btn>
      <div v-if="showExp" class="my-3">
        <v-alert type="info" variant="tonal">{{ question.explanation || 'Reflexiona sobre el pasaje relacionado.' }}</v-alert>
        <v-btn @click="next">Siguiente</v-btn>
      </div>
    </div>
  </v-container>
</template>
<script setup>
import { ref } from 'vue';
import axios from 'axios';
import QuestionCard from '../components/QuestionCard.vue';
import { useStatsStore } from '../store/stats';

const stats = useStatsStore();
const started = ref(false);
const playerName = ref('');
const difficulty = ref(1);
const question = ref(null);
const options = ref([]);
const selected = ref(null);
const showExp = ref(false);

async function loadQuestion(){
  try {
    const { data } = await axios.get(`/api/game/question/${difficulty.value}`);
    question.value = data; options.value = data.options; selected.value = null; showExp.value = false;
  } catch (error) {
    console.error('Error loading question:', error);
    // Aquí podrías mostrar un mensaje de error al usuario si tienes un componente de diálogo
  }
}

async function start(){ 
  started.value = true; 
  try {
    await loadQuestion(); 
  } catch (error) {
    console.error('Error starting catechesis:', error);
    started.value = false;
  }
}

async function check(){
  if (selected.value === null) return;
  try {
    const { data } = await axios.post('/api/game/answer', { questionId: question.value.id, index: selected.value });
    stats.recordAnswer({ category: question.value.category, verseHint: data.verseHint }, data.correct);
    question.value.explanation = data.explanation;
    showExp.value = true;
  } catch (error) {
    console.error('Error checking answer:', error);
  }
}

async function next(){
  try {
    difficulty.value = Math.min(difficulty.value + 1, 15);
    await loadQuestion();
  } catch (error) {
    console.error('Error loading next question:', error);
  }
}
</script>
