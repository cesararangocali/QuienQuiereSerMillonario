<template>
  <v-container>
    <h2>Competitivo en línea</h2>
    <v-text-field v-model="roomId" label="Sala" />
    <v-text-field v-model="playerName" label="Tu nombre" />
    <v-btn class="ma-1" @click="join">Unirse</v-btn>
    <v-btn class="ma-1" color="indigo" @click="start">Iniciar</v-btn>
    <div class="my-4">
      <div v-if="question">
        <h3>Dificultad {{ difficulty }}</h3>
        <p>{{ question.text }}</p>
        <div class="d-grid" style="gap:8px">
          <v-btn v-for="(opt,i) in question.options" :key="i" :disabled="answered" @click="answer(i)">
            {{ String.fromCharCode(65+i) }}. {{ opt }}
          </v-btn>
        </div>
      </div>
      <div v-if="result">
        <v-alert type="info" variant="tonal">
          Respuesta correcta: {{ String.fromCharCode(65+result.correctIndex) }}
          <div v-if="result.explanation">{{ result.explanation }}</div>
          <div v-if="result.verseHint">Pista: {{ result.verseHint }}</div>
        </v-alert>
        <v-list>
          <v-list-item v-for="r in result.results" :key="r.name">
            <v-list-item-title>{{ r.name }} — {{ r.ok ? '✔' : '✘' }} — {{ r.score }} pts</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
      <p v-for="(msg,i) in messages" :key="i">{{ msg }}</p>
    </div>
  </v-container>
</template>
<script setup>
import { ref } from 'vue';
import { io } from 'socket.io-client';

const socket = io();
const roomId = ref('sala1');
const playerName = ref('');
const messages = ref([]);
const question = ref(null);
const difficulty = ref(1);
const result = ref(null);
const answered = ref(false);

function join() {
  socket.emit('join-room', roomId.value, playerName.value);
  messages.value.push('Te uniste a ' + roomId.value);
}

function start() {
  socket.emit('start-competitive', roomId.value);
}

socket.on('player-joined', ({ playerName }) => messages.value.push(`${playerName} se unió`));
socket.on('competitive-start', () => messages.value.push('¡Comienza la partida!'));

socket.on('question', (q) => {
  result.value = null; answered.value = false; question.value = q; difficulty.value = q.difficulty;
});
socket.on('result', (r) => { result.value = r; question.value = null; });
socket.on('game-over', ({ ranking }) => {
  messages.value.push('Fin del juego');
  ranking.forEach((r, i) => messages.value.push(`#${i+1} ${r.name} — ${r.score} pts`));
});

function answer(i){
  answered.value = true;
  socket.emit('answer', roomId.value, i);
}
</script>
