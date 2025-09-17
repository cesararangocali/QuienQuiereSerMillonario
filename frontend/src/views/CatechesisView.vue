<template>
  <v-container class="py-0" :class="{ 'center-viewport': started }">
    <!-- Encabezado previo al inicio -->
    <section v-if="!started" class="qqss-hero text-center mb-4">
      <div class="qqss-title">Catequesis</div>
      <div class="qqss-sub">Aprende y profundiza: sin límite de tiempo</div>
  <div class="mt-6 d-flex flex-column align-center ga-4 controls-vertical">
        <v-text-field
          v-model="playerName"
          label="Tu nombre (opcional)"
          variant="outlined"
          density="comfortable"
          clearable
          prepend-inner-icon="mdi-account"
          hide-details="auto"
          class="control-field"
        />
        <div class="d-flex flex-column ga-2 control-field">
          <v-switch v-model="classMode" color="teal" inset hide-details label="Dinámica de clase" />
          <div class="d-flex align-center ga-3">
            <span class="text-caption" style="width: 56px; text-align: right;">{{ rangeLabel }}</span>
            <v-range-slider
              v-model="range"
              :min="1" :max="15" :step="1"
              :disabled="!classMode"
              class="flex-grow-1"
            />
          </div>
        </div>
        <v-switch
          v-model="includeMatrimonios"
          inset
          color="teal"
          hide-details
          class="control-field"
          :label="includeMatrimonios ? 'Modo: General + Matrimonios' : 'Modo: Solo General'"
        />
        <div class="d-flex ga-4 justify-center control-field">
          <v-btn size="large" color="teal" class="qqss-ring start-btn" @click="start" :prepend-icon="appIcons.start">
            Comenzar
          </v-btn>
          <v-btn size="large" color="secondary" class="qqss-ring" to="/" :prepend-icon="appIcons.home">
            Inicio
          </v-btn>
        </div>
      </div>
    </section>

    <!-- Área de catequesis -->
    <v-card v-if="started" class="pa-4 qqss-ring game-stage position-relative" elevation="12" style="width: 100%;">
      <!-- Botones: silenciar y salir (X) -->
      <div class="position-absolute d-flex ga-2" style="top: 8px; right: 8px; z-index: 5;">
        <v-tooltip :text="isMuted ? 'Activar sonido' : 'Silenciar'" location="bottom">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="tonal" color="blue-grey" @click="toggleMute">
              <v-icon>{{ isMuted ? appIcons.mute : appIcons.unmute }}</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Salir" location="bottom">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon color="red" variant="tonal" @click="onExit">
              <v-icon>{{ appIcons.exit }}</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>

      <v-card-title class="d-flex align-center justify-center position-relative">
        <!-- Stats a la izquierda -->
        <div class="d-flex align-center ga-6 header-stats">
          <div class="game-stat">
            <div class="stat-label">Ronda</div>
            <div class="stat-value">{{ round }}</div>
          </div>
          <div class="game-stat">
            <div class="stat-label">Aciertos</div>
            <div class="stat-value text-green-accent-3">{{ correctCount }}</div>
          </div>
          <div class="game-stat">
            <div class="stat-label">Dificultad</div>
            <div class="stat-value">{{ difficultyLevel }}</div>
          </div>
        </div>
        <!-- Título centrado -->
        <div class="d-flex align-center ga-3">
          <v-icon :icon="appIcons.book" size="large" color="accent" />
          <span class="text-h4 font-weight-bold">CATEQUESIS</span>
        </div>
      </v-card-title>
      <v-divider class="my-4" />

      <v-row>
        <v-col cols="12" md="8">
          <QuestionCard :question="question" :options="options" :selected="selected" @select="onSelect" />

          <!-- Comodines -->
          <div class="d-flex align-center game-lifelines">
            <v-btn variant="elevated" color="cyan-darken-3" class="qqss-ring" @click="fiftyFifty" :disabled="used.fifty" :prepend-icon="appIcons.lifeline50" size="small">50-50</v-btn>
            <v-btn variant="elevated" color="amber-darken-3" class="qqss-ring" @click="showVerse" :disabled="used.verse" :prepend-icon="appIcons.lifelineVerse" size="small">Pasaje iluminador</v-btn>
            <v-btn variant="elevated" color="purple-darken-3" class="qqss-ring" @click="callFriend" :disabled="used.call" :prepend-icon="appIcons.lifelineCall" size="small">Llamar a un amigo</v-btn>
          </div>

          <!-- Confirmar respuesta -->
          <div class="d-flex justify-center game-confirm-btn">
            <v-btn color="success" size="large" class="qqss-ring" :disabled="selected===null" @click="confirmAnswer" :prepend-icon="appIcons.confirm">Confirmar</v-btn>
            <v-btn v-if="classMode" color="info" variant="tonal" size="large" class="qqss-ring ml-3" @click="skipQuestion" :prepend-icon="appIcons.skip">Siguiente (sin responder)</v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <!-- Resumen de aprendizaje -->
          <v-card class="pa-3 qqss-ring" elevation="6">
            <v-card-title class="text-h6">Resumen</v-card-title>
            <div v-if="classMode" class="text-caption mb-2">Rango activo: <strong>{{ rangeLabel }}</strong></div>
            <div class="text-body-2 mb-2">Tasa de aciertos: <strong>{{ correctRate }}%</strong></div>
            <div class="text-subtitle-2 mb-1">Categorías dominadas</div>
            <v-list density="compact">
              <v-list-item v-for="(count, cat) in categoriesCount" :key="cat">
                <v-list-item-title>{{ cat }} — {{ count }}</v-list-item-title>
              </v-list-item>
            </v-list>
            <div class="text-subtitle-2 mt-2">Versículos aprendidos</div>
            <ul class="text-caption pl-6">
              <li v-for="verse in learnedVerses" :key="verse">{{ verse }}</li>
            </ul>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Diálogo reutilizable para explicaciones -->
    <GameDialog 
      v-model:show="dialog.show"
      :type="dialog.type"
      :title="dialog.title"
      :message="dialog.message"
      :points="null"
      :button-text="dialog.buttonText"
      @close="onDialogClose"
    />

    <!-- Fin del módulo -->
    <v-dialog v-model="endDialog.show" max-width="500" persistent>
      <v-card class="game-dialog qqss-ring text-center" elevation="20">
        <div class="game-dialog-header">
          <v-icon :icon="appIcons.book" color="gold" size="48" class="dialog-icon" />
          <h2 class="dialog-title">{{ endDialog.title }}</h2>
        </div>
        <v-card-text>
          <p>{{ endDialog.message }}</p>
          <div class="mt-2">Aciertos: <strong>{{ correctCount }}</strong> de {{ answeredCount }}</div>
        </v-card-text>
        <v-card-actions class="justify-center pa-4">
          <v-btn color="primary" variant="elevated" class="qqss-ring" prepend-icon="mdi-refresh" @click="restart">Reiniciar</v-btn>
          <v-btn color="secondary" variant="elevated" class="qqss-ring" :prepend-icon="appIcons.home" to="/">Inicio</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import QuestionCard from '../components/QuestionCard.vue'
import GameDialog from '../components/GameDialog.vue'
import { useGameSounds } from '../composables/useGameSounds.js'
import { useStatsStore } from '../store/stats'
import { appIcons } from '../constants/icons'

const stats = useStatsStore()

// Sonidos
const { playCorrect, playWrong, playLifeline, playQuestion, playFinalAnswer, stopAll, isMuted, toggleMute } = useGameSounds()

// Estado principal
const started = ref(false)
const playerName = ref('')
const round = ref(1)
const classMode = ref(false)
const range = ref([1, 15])
const question = ref(null)
const options = ref([])
const indexMap = ref([])
const selected = ref(null)
const used = reactive({ fifty: false, verse: false, call: false })
const includeMatrimonios = ref(false)

// Métricas derivadas
const rangeSpan = computed(() => Math.max(1, (range.value?.[1] ?? 15) - (range.value?.[0] ?? 1) + 1))
const difficultyLevel = computed(() => {
  const base = classMode.value ? (range.value?.[0] ?? 1) : 1
  const span = classMode.value ? rangeSpan.value : 15
  return base + ((round.value - 1) % span)
})
const rangeLabel = computed(() => `${range.value?.[0] ?? 1}–${range.value?.[1] ?? 15}`)
const correctCount = computed(() => stats.answers.filter(a => a.correct).length)
const answeredCount = computed(() => stats.answers.length)
const categoriesCount = computed(() => stats.categoriesCount)
const learnedVerses = computed(() => stats.learnedVerses)
const correctRate = computed(() => stats.correctRate)

// Diálogo reutilizable
const dialog = reactive({ show: false, type: 'info', title: '', message: '', buttonText: 'Continuar' })
let explanationResolver = null

function showDialog(type, title, message) {
  dialog.type = type
  dialog.title = title
  dialog.message = message
  dialog.buttonText = 'Continuar'
  dialog.show = true
  return new Promise(resolve => { explanationResolver = resolve })
}

function onDialogClose() {
  dialog.show = false
  if (explanationResolver) { const r = explanationResolver; explanationResolver = null; r() }
}

const endDialog = reactive({ show: false, title: '', message: '' })

async function loadQuestion() {
  try {
  const mode = includeMatrimonios.value ? 'matrimonios' : 'general'
  const { data } = await axios.get(`/api/game/question/${difficultyLevel.value}?mode=${mode}`)
    question.value = data
    const order = data.options.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
    options.value = order.map(i => data.options[i])
    indexMap.value = order
    selected.value = null
    playQuestion()
  } catch (error) {
    if (error.response && error.response.status === 404) {
      endDialog.title = '¡No hay más preguntas!'
      endDialog.message = `No hay preguntas disponibles en este momento.`
      endDialog.show = true
    } else {
      await showDialog('error', 'Error de Conexión', 'No se pudo cargar la pregunta. Intenta de nuevo.')
    }
  }
}

async function start() {
  stats.reset()
  used.fifty = used.verse = used.call = false
  round.value = 1
  started.value = true
  await loadQuestion()
}

function onSelect(i) { selected.value = i }

async function confirmAnswer() {
  if (selected.value === null) return
  playFinalAnswer()
  setTimeout(check, 400)
}

async function check() {
  const pickedOriginal = indexMap.value[selected.value]
  const { data } = await axios.post('/api/game/answer', { questionId: question.value.id, index: pickedOriginal })
  stats.recordAnswer({ category: question.value.category, verseHint: data.verseHint }, data.correct)
  if (data.correct) {
    playCorrect()
    await showDialog('success', '¡Correcto!', data.explanation || '¡Bien hecho!')
  } else {
    playWrong()
    await showDialog('info', 'Respuesta', data.explanation || 'Revisa la explicación y continúa')
  }
  await next()
}

async function next() {
  round.value++
  await loadQuestion()
}

async function skipQuestion() {
  // Avanza de ronda sin registrar respuesta
  selected.value = null
  await next()
}

// Comodines (sin cronómetro, mismos endpoints)
async function fiftyFifty() {
  playLifeline()
  const { data } = await axios.post('/api/game/lifeline/50-50', { questionId: question.value.id })
  const keep = [...data.keep]
  for (let i = keep.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [keep[i], keep[j]] = [keep[j], keep[i]] }
  options.value = keep.map(i => question.value.options[i])
  indexMap.value = keep
  used.fifty = true
}

async function showVerse() {
  playLifeline()
  const { data } = await axios.get(`/api/game/lifeline/verse/${question.value.id}`)
  await showDialog('hint', 'Pasaje Iluminador', data.verseHint || 'Sin pista disponible para esta pregunta.')
  used.verse = true
}

async function callFriend() {
  playLifeline()
  const { data } = await axios.post('/api/game/lifeline/call', { questionId: question.value.id })
  const suggestedOriginal = data.suggestedIndex
  const suggestedVisible = indexMap.value.indexOf(suggestedOriginal)
  const idx = suggestedVisible >= 0 ? suggestedVisible : 0
  const letter = String.fromCharCode(65 + idx)
  await showDialog('info', 'Llamada a un Amigo', `Tu amigo sugiere la opción ${letter}.`)
  used.call = true
}

function onExit() {
  stopAll()
  restart()
}

function restart() {
  started.value = false
  stats.reset()
  round.value = 1
  question.value = null
  options.value = []
  selected.value = null
  used.fifty = used.verse = used.call = false
  endDialog.show = false
}
</script>

<style scoped>
.center-viewport { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; }
.header-stats { position: absolute; left: 0; top: 50%; transform: translateY(-50%); padding-left: 8px; }
.controls-row { gap: 12px 0; }
.start-btn { min-width: 220px; }
.controls-vertical { width: 100%; }
.control-field { width: 100%; max-width: 640px; }
</style>
