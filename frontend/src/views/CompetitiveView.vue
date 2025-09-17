<template>
  <v-container class="py-0" :class="{ 'center-viewport': !inRoom || !started }">
    <!-- Bienvenida / Unirse a sala -->
    <section v-if="!inRoom" class="qqss-hero text-center mb-4">
      <div class="qqss-title">Competitivo</div>
      <div class="qqss-sub">Juega contra otros en tiempo real</div>
      <div class="mt-6 d-flex flex-column align-center ga-4" style="width: 100%">
        <v-text-field
          v-model="playerName"
          label="Tu nombre *"
          variant="outlined"
          density="comfortable"
          clearable
          prepend-inner-icon="mdi-account"
          hide-details="auto"
          class="control-field"
        />
        <div class="d-flex ga-3 control-field">
          <v-text-field
            v-model="roomId"
            label="Sala"
            placeholder="Ej: parroquia"
            variant="outlined"
            hide-details="auto"
            density="comfortable"
            clearable
            prepend-inner-icon="mdi-pound"
            class="flex-grow-1"
          />
          <v-btn color="primary" size="large" class="qqss-ring" :prepend-icon="appIcons.start" @click="joinRoom" :disabled="!playerName.trim() || !roomId.trim()">
            Unirse
          </v-btn>
          <v-btn color="secondary" size="large" class="qqss-ring" :prepend-icon="appIcons.home" to="/">
            Inicio
          </v-btn>
          <v-btn variant="tonal" size="large" class="qqss-ring" @click="toggleMute" :prepend-icon="isMuted ? appIcons.mute : appIcons.unmute">
            {{ isMuted ? 'Activar' : 'Silenciar' }}
          </v-btn>
        </div>
      </div>
    </section>

    <!-- Lobby de la sala -->
    <v-card v-else-if="inRoom && !started" class="pa-4 qqss-ring game-stage position-relative" elevation="12">
      <div class="position-absolute d-flex ga-2" style="top: 8px; right: 8px; z-index: 5;">
        <v-btn icon variant="tonal" color="blue-grey" @click="toggleMute">
          <v-icon>{{ isMuted ? appIcons.mute : appIcons.unmute }}</v-icon>
        </v-btn>
        <v-btn icon variant="tonal" color="red" @click="leaveAndHome">
          <v-icon>{{ appIcons.exit }}</v-icon>
        </v-btn>
      </div>
      <v-card-title class="d-flex align-center justify-center position-relative">
        <div class="d-flex align-center ga-6 header-stats">
          <div class="game-stat"><div class="stat-label">Sala</div><div class="stat-value">{{ roomId }}</div></div>
          <div class="game-stat"><div class="stat-label">Jugadores</div><div class="stat-value">{{ players.length }}</div></div>
        </div>
        <div class="d-flex align-center ga-3">
          <v-icon :icon="appIcons.book" size="large" color="accent" />
          <span class="text-h5 font-weight-bold">Esperando a jugadores…</span>
        </div>
      </v-card-title>
      <v-divider class="my-4" />
      <v-row>
        <v-col cols="12" md="6">
          <v-list density="comfortable" class="qqss-ring">
            <v-list-item v-for="p in players" :key="p.name">
              <template #prepend>
                <v-avatar size="32" color="primary"><v-icon color="white">mdi-account</v-icon></v-avatar>
              </template>
              <v-list-item-title>{{ p.name }}</v-list-item-title>
              <div class="text-caption text-medium-emphasis">{{ p.score?.toLocaleString?.() || 0 }} pts</div>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12" md="6" class="d-flex align-center justify-center">
          <div class="d-flex align-center ga-4 flex-column flex-sm-row">
            <v-switch
              v-model="includeMatrimonios"
              color="indigo"
              inset
              hide-details
              :label="includeMatrimonios ? 'General + Matrimonios' : 'Solo General'"
            />
            <v-btn color="indigo" size="x-large" class="qqss-ring" :prepend-icon="appIcons.start" @click="startMatch">Iniciar partida</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Área de juego -->
    <v-card v-else class="pa-4 qqss-ring game-stage position-relative" elevation="12" style="width: 100%;">
      <div class="position-absolute d-flex ga-2" style="top: 8px; right: 8px; z-index: 5;">
        <v-btn icon variant="tonal" color="blue-grey" @click="toggleMute">
          <v-icon>{{ isMuted ? appIcons.mute : appIcons.unmute }}</v-icon>
        </v-btn>
        <v-btn icon variant="tonal" color="red" @click="leaveAndHome">
          <v-icon>{{ appIcons.exit }}</v-icon>
        </v-btn>
      </div>
      <v-card-title class="d-flex align-center justify-center position-relative">
        <div class="d-flex align-center ga-6 header-stats">
          <div class="game-stat"><div class="stat-label">Sala</div><div class="stat-value">{{ roomId }}</div></div>
          <div class="game-stat"><div class="stat-label">Dificultad</div><div class="stat-value">{{ difficulty }}</div></div>
          <div class="game-stat"><div class="stat-label">Tu puntaje</div><div class="stat-value text-yellow-accent-3">{{ myScore.toLocaleString() }}</div></div>
        </div>
        <div class="d-flex align-center ga-3">
          <v-icon :icon="appIcons.book" size="large" color="accent" />
          <span class="text-h5 font-weight-bold">COMPETITIVO</span>
          <v-chip v-if="question" color="red" class="ml-3" size="small" variant="elevated">{{ timeLeftSec }}s</v-chip>
        </div>
      </v-card-title>
      <v-divider class="my-4" />
      <v-row>
        <v-col cols="12" md="8">
          <QuestionCard v-if="question" :question="question" :options="question.options" :selected="selected" :disabled="answered || timeExpired" @select="onSelect" />
          <div v-if="question" class="d-flex justify-center game-confirm-btn">
            <v-btn color="success" size="large" class="qqss-ring" :disabled="selected===null || answered || timeExpired" :prepend-icon="appIcons.confirm" @click="confirmAnswer">Responder</v-btn>
          </div>
          <v-alert v-if="result" type="info" variant="tonal" class="mt-4">
            <div>Respuesta correcta: <strong>{{ correctLetter }}</strong></div>
            <div v-if="result.explanation" class="mt-1">{{ result.explanation }}</div>
            <div v-if="result.verseHint" class="mt-1">Pista: {{ result.verseHint }}</div>
            <div class="mt-2 text-caption">Esperando siguiente pregunta…</div>
          </v-alert>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-3 qqss-ring" elevation="6">
            <v-card-title class="text-h6">Marcador</v-card-title>
            <v-list density="compact">
              <v-list-item v-for="p in sortedScores" :key="p.name">
                <template #prepend>
                  <v-avatar size="28" :color="p.name===playerName ? 'green' : 'primary'">
                    <v-icon color="white" size="18">mdi-account</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ p.name }}</v-list-item-title>
                <div class="text-caption">{{ p.score.toLocaleString() }} pts</div>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Dialog de fin de juego -->
    <v-dialog v-model="gameOver.show" max-width="520" persistent>
      <v-card class="game-dialog qqss-ring text-center" elevation="20">
        <div class="game-dialog-header">
          <v-icon icon="mdi-trophy" color="gold" size="48" class="dialog-icon" />
          <h2 class="dialog-title">{{ gameOver.title }}</h2>
        </div>
        <v-card-text>
          <div class="text-subtitle-2 mb-1">Ranking final</div>
          <v-list density="comfortable">
            <v-list-item v-for="(r, i) in gameOver.ranking" :key="r.name">
              <template #prepend>
                <v-avatar color="amber" size="28"><v-icon color="white">mdi-numeric-{{ i+1 }}</v-icon></v-avatar>
              </template>
              <v-list-item-title>{{ r.name }}</v-list-item-title>
              <div class="text-caption">{{ r.score.toLocaleString() }} pts</div>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-center pa-4">
          <v-btn color="primary" variant="elevated" class="qqss-ring" :prepend-icon="appIcons.start" @click="playAgain">Jugar otra vez</v-btn>
          <v-btn color="secondary" variant="elevated" class="qqss-ring" :prepend-icon="appIcons.home" to="/">Inicio</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { createSocket } from '../utils/socket'
import QuestionCard from '../components/QuestionCard.vue'
import { useGameSounds } from '../composables/useGameSounds.js'
import { appIcons } from '../constants/icons'

const socket = createSocket()

// Sonidos
const { playQuestion, playFinalAnswer, playCorrect, playWrong, toggleMute, isMuted, stopAll } = useGameSounds()

// Estado principal
const roomId = ref('')
const playerName = ref('')
const inRoom = ref(false)
const started = ref(false)
const players = ref([]) // { name, score }
const question = ref(null)
const difficulty = ref(1)
const selected = ref(null)
const answered = ref(false)
const result = ref(null) // { correctIndex, explanation, verseHint, results: [{name, ok, score}] }
const scores = ref({}) // name -> score
const deadline = ref(null)
const now = ref(Date.now())
let ticker = null

// Modo de categorías: por defecto solo "General"
const includeMatrimonios = ref(false)
const mode = computed(() => includeMatrimonios.value ? 'matrimonios' : 'general')

const myScore = computed(() => scores.value[playerName.value] || 0)
const sortedScores = computed(() => Object.entries(scores.value).map(([name, score]) => ({ name, score })).sort((a,b)=>b.score-a.score))
const correctLetter = computed(() => result.value ? String.fromCharCode(65 + (result.value.correctIndex ?? 0)) : '')

function joinRoom(){
  socket.emit('join-room', roomId.value.trim(), playerName.value.trim())
}

function startMatch(){ socket.emit('start-competitive', roomId.value, { mode: mode.value }) }

function onSelect(i){ selected.value = i }

function confirmAnswer(){
  if (selected.value === null || answered.value) return
  answered.value = true
  playFinalAnswer()
  socket.emit('answer', roomId.value, selected.value)
}

function leaveAndHome(){
  try { socket.emit('leave-room', roomId.value) } catch { }
  stopAll(); inRoom.value = false; started.value = false; question.value = null; result.value = null
  window.location.href = '/'
}

onMounted(() => {
  socket.on('player-joined', ({ playerName: name, players: list }) => {
    if (list) players.value = list; else players.value = Array.from(new Set([...(players.value||[]).map(p=>p.name), name])).map(n=>({ name:n, score: scores.value[n]||0 }))
    scores.value[name] = scores.value[name] || 0
    inRoom.value = true
  })
  socket.on('player-left', ({ playerName: name, players: list }) => {
    if (list) players.value = list; else players.value = (players.value||[]).filter(p=>p.name!==name)
    const s = { ...scores.value }; delete s[name]; scores.value = s
  })
  socket.on('player-list', (list)=>{ players.value = list || []; list?.forEach(p=>{ scores.value[p.name] = p.score || 0 }) })
  socket.on('competitive-start', () => { started.value = true; result.value = null; selected.value = null })
  socket.on('question', (q) => {
    result.value = null; answered.value = false; selected.value = null; question.value = q; difficulty.value = q.difficulty || q.level || difficulty.value; playQuestion()
    deadline.value = q.deadline || (Date.now() + (q.durationMs || 30000))
    if (ticker) { clearInterval(ticker); ticker = null }
    now.value = Date.now()
    ticker = setInterval(() => { now.value = Date.now() }, 200)
  })
  socket.on('result', (r) => {
    result.value = r; question.value = null
    const you = r.results?.find?.(x => x.name === playerName.value)
    if (you?.ok) playCorrect(); else playWrong()
    // actualizar marcador
    const ns = { ...scores.value }
    r.results?.forEach?.(x => { ns[x.name] = x.score || 0 })
    scores.value = ns
    if (ticker) { clearInterval(ticker); ticker = null }
  })
  socket.on('game-over', ({ ranking }) => { started.value = false; result.value = null; question.value = null; 
    gameOver.ranking = ranking || sortedScores.value; gameOver.title = '¡Fin de la partida!'; gameOver.show = true 
  })
})

onBeforeUnmount(()=>{ try { socket.emit('leave-room', roomId.value) } catch {} socket.off(); if (ticker) clearInterval(ticker) })

const gameOver = reactive({ show: false, title: '', ranking: [] })
function playAgain(){ gameOver.show = false; started.value = false; selected.value = null; answered.value = false; result.value = null }

const timeLeftMs = computed(() => Math.max(0, (deadline.value || 0) - now.value))
const timeLeftSec = computed(() => Math.ceil(timeLeftMs.value / 1000))
const timeExpired = computed(() => timeLeftMs.value <= 0 && !!question.value)

watch(timeExpired, (v) => {
  if (v && !answered.value) {
    answered.value = true
  }
})
</script>

<style scoped>
.center-viewport { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; }
.header-stats { position: absolute; left: 0; top: 50%; transform: translateY(-50%); padding-left: 8px; }
.control-field { width: 100%; max-width: 720px; }

@media (max-width: 600px) {
  .header-stats { position: static; transform: none; padding: 0; margin-bottom: 8px; justify-content: center; }
}

.game-stage { max-height: 100dvh; overflow: auto; }

@media (max-width: 600px) {
  .control-field { max-width: 100%; }
}
</style>
