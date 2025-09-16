<template>
  <v-container class="py-0" :class="{ 'center-viewport': started }" @click="handleFirstInteraction">
    <!-- Header del juego (oculto cuando el juego está en curso) -->
  <section v-if="!started" class="qqss-hero text-center mb-3">
      <div class="qqss-title">¿Quién quiere ser santo?</div>
      <div class="qqss-sub">Demuestra tu conocimiento de la fe</div>
  <div class="mt-3 d-flex justify-center ga-4 flex-wrap">
        <v-btn size="large" variant="tonal" color="primary" class="qqss-ring secondary-btn" to="/" prepend-icon="mdi-home">Inicio</v-btn>
        <v-btn size="large" variant="tonal" color="grey" class="qqss-ring secondary-btn" @click="showRanking = true" prepend-icon="mdi-trophy">Ranking</v-btn>
        
        <!-- Controles de sonido -->
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn 
              v-bind="props"
              size="large" 
              variant="tonal" 
              :color="isMuted ? 'error' : (audioContextReady ? 'success' : 'warning')" 
              class="qqss-ring secondary-btn" 
              @click="toggleMute"
              :prepend-icon="isMuted ? 'mdi-volume-off' : (audioContextReady ? 'mdi-volume-high' : 'mdi-volume-medium')"
            >
              {{ isMuted ? 'Activar' : 'Silenciar' }}
            </v-btn>
          </template>
          <span v-if="!audioContextReady">Haz clic para habilitar el sonido</span>
          <span v-else-if="isMuted">Sonidos desactivados</span>
          <span v-else>Sonidos activados</span>
        </v-tooltip>
      </div>
    </section>

  <!-- Área del juego (padding vertical sutil) -->
  <v-card class="pa-3 py-2 qqss-ring game-stage position-relative" elevation="12" style="width: 100%;">
      <!-- Botón salir (X) flotante arriba-derecha -->
      <v-tooltip v-if="started" text="Salir del juego" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="position-absolute"
            style="top: 8px; right: 8px; z-index: 5;"
            icon
            color="red"
            variant="tonal"
            @click="onRequestExit"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
  <v-card-title class="d-flex align-center justify-center position-relative py-2">
        <!-- Ronda y Puntos anclados al costado superior izquierdo -->
        <div v-if="started" class="d-flex align-center ga-6 header-stats">
          <div class="game-stat">
            <div class="stat-label">Ronda</div>
            <div class="stat-value">{{ difficulty }}/15</div>
          </div>
          <div class="game-stat">
            <div class="stat-label">Puntos</div>
            <div class="stat-value text-yellow-accent-3">{{ points }}</div>
          </div>
        </div>
        <!-- Título centrado (oculto en móviles) -->
        <div class="d-flex align-center ga-3 header-main-title">
          <v-icon icon="mdi-gamepad-variant" size="large" color="accent" />
          <span class="text-h4 font-weight-bold">JUEGO</span>
        </div>
      </v-card-title>
  <v-divider class="my-2" />
      
      <!-- Temporizador - visible cuando el juego haya comenzado -->
      <div v-if="started" class="text-center mb-2 mt-1">
        <div class="d-flex justify-center ga-8 align-center">
          <Timer 
            v-if="timePerLevel > 0"
            ref="timerRef" 
            :seconds="timePerLevel" 
            :paused="timerPaused" 
            @timeout="onTimeout" 
            @tick="onTimerTick" 
          />
        </div>
      </div>

      <div v-if="!started" class="my-2 d-flex ga-2 align-end">
        <v-combobox
          v-model="playerName"
          v-model:search="nameInput"
          :items="previousPlayers"
          :loading="loadingPlayers"
          label="Tu nombre *"
          placeholder="Selecciona un jugador o escribe un nombre nuevo"
          :rules="nameRules"
          required
          variant="outlined"
          prepend-inner-icon="mdi-account"
          clearable
          hide-no-data
          auto-select-first
          :return-object="false"
          @update:modelValue="onPlayerPicked"
          class="flex-grow-1"
        >
          <template v-slot:prepend-item v-if="previousPlayers.length > 0">
            <v-list-item class="text-caption text-primary pa-3">
              <template v-slot:prepend>
                <v-icon size="small">mdi-history</v-icon>
              </template>
              <v-list-item-title class="text-caption font-weight-medium">
                Jugadores anteriores
              </v-list-item-title>
            </v-list-item>
            <v-divider />
          </template>
          
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" class="px-4">
              <template v-slot:prepend>
                <v-avatar size="32" color="primary">
                  <v-icon color="white" size="small">mdi-account</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ item.value }}</v-list-item-title>
              <div v-if="getPlayerInfo(item.value)" class="text-caption text-medium-emphasis">
                Mejor puntaje: {{ getPlayerInfo(item.value).points.toLocaleString() }} pts
              </div>
            </v-list-item>
          </template>
          
          <template v-slot:append-item v-if="previousPlayers.length > 0">
            <v-divider />
            <v-list-item class="text-caption text-grey px-4">
              <template v-slot:prepend>
                <v-icon size="small">mdi-information</v-icon>
              </template>
              <v-list-item-title class="text-wrap">
                También puedes escribir un nombre nuevo
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-combobox>
  <v-btn color="indigo" size="large" @click="start" prepend-icon="mdi-play">Comenzar</v-btn>
      </div>
      
      <!-- Información del jugador seleccionado o mensaje de nuevo jugador -->
      <div v-if="!started && playerName && playerName.trim()" class="mb-4">
        <v-card v-if="selectedPlayerInfo" variant="tonal" color="primary" class="pa-3">
          <div class="d-flex align-center">
            <v-avatar color="primary" class="mr-3">
              <v-icon color="white">mdi-trophy</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                ¡Bienvenido de vuelta, {{ selectedPlayerInfo.name }}!
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Tu mejor puntaje: <strong>{{ selectedPlayerInfo.points.toLocaleString() }} puntos</strong> - ¡Trata de superarlo!
              </div>
            </div>
          </div>
        </v-card>
        
        <v-card v-else variant="tonal" color="success" class="pa-3">
          <div class="d-flex align-center">
            <v-avatar color="success" class="mr-3">
              <v-icon color="white">mdi-star</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                ¡Bienvenido, {{ playerName.trim() }}!
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Jugador nuevo - ¡Demuestra tu conocimiento de la fe!
              </div>
            </div>
          </div>
        </v-card>
      </div>

      <div v-if="started">
        <v-row>
          <v-col cols="12" md="8">
            <QuestionCard :question="question" :options="options" :selected="selected" @select="onSelect" />
            
            <!-- Comodines directamente debajo de las opciones -->
            <div class="d-flex align-center game-lifelines">
              <v-btn variant="elevated" color="cyan-darken-3" class="qqss-ring" @click="fiftyFifty" :disabled="used.fifty" prepend-icon="mdi-percent" size="small">50-50</v-btn>
              <v-btn variant="elevated" color="amber-darken-3" class="qqss-ring" @click="showVerse" :disabled="used.verse" prepend-icon="mdi-lightbulb-on-outline" size="small">Pasaje iluminador</v-btn>
              <v-btn variant="elevated" color="purple-darken-3" class="qqss-ring" @click="callFriend" :disabled="used.call" prepend-icon="mdi-account-voice" size="small">Llamar a un amigo</v-btn>
            </div>
            
            <!-- Botón confirmar también aquí para fácil acceso -->
            <div class="d-flex justify-center game-confirm-btn">
              <v-btn color="success" size="large" class="qqss-ring" :disabled="selected===null" @click="confirmAnswer" prepend-icon="mdi-check">Confirmar</v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <MoneyLadder :current="difficulty" />
          </v-col>
        </v-row>
        <Animations :state="animState" />
      </div>
    </v-card>

    <!-- Confirmación de salida -->
    <v-dialog v-model="showExitConfirm" max-width="420" persistent>
      <v-card>
        <v-card-title class="text-h6">¿Salir del juego?</v-card-title>
        <v-card-text>
          Perderás el progreso de la partida actual. ¿Deseas salir?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="cancelExit">Cancelar</v-btn>
          <v-btn color="red" variant="elevated" @click="confirmExit" prepend-icon="mdi-exit-to-app">Salir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog personalizado -->
    <GameDialog 
      v-model:show="dialog.show"
      :type="dialog.type"
      :title="dialog.title"
      :message="dialog.message"
      :points="dialog.points"
      :button-text="dialog.buttonText"
      @close="onDialogClose"
    />

    <!-- Dialog de fin de juego con opciones -->
    <v-dialog v-if="!showVictory" v-model="gameEndDialog.show" max-width="500" persistent>
      <v-card class="game-dialog qqss-ring text-center" elevation="20">
        <div class="game-dialog-header">
          <v-icon icon="mdi-trophy" color="gold" size="48" class="dialog-icon" />
          <h2 class="dialog-title">{{ gameEndDialog.title }}</h2>
        </div>

        <v-card-text class="dialog-content">
          <p class="dialog-message">{{ gameEndDialog.message }}</p>
          <div class="points-display">
            <v-icon icon="mdi-star" color="yellow" class="mr-1" />
            <span class="points-text">{{ gameEndDialog.points }} puntos</span>
            <v-icon icon="mdi-star" color="yellow" class="ml-1" />
          </div>
        </v-card-text>

        <v-card-actions class="justify-center pa-4">
          <v-btn 
            color="primary" 
            size="large" 
            variant="elevated"
            class="qqss-ring mx-2" 
            prepend-icon="mdi-refresh"
            @click="playAgainSameUser"
          >
            Jugar de Nuevo
          </v-btn>
          <v-btn 
            color="secondary" 
            size="large" 
            variant="elevated"
            class="qqss-ring mx-2" 
            prepend-icon="mdi-account-switch"
            @click="playAgainNewUser"
          >
            Cambiar Usuario
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Nuevo modal de victoria con animaciones -->
    <VictoryModal
      v-model="showVictory"
      :title="victoryTitle"
      :message="victoryMessage"
      :points="gameEndDialog.points"
      :confetti-delay-ms="victoryConfettiDelayMs"
      @play-again="playAgainSameUser"
      @change-user="playAgainNewUser"
    />

    <!-- Dialog de bienvenida antes de comenzar -->
    <v-dialog v-model="welcomeDialog.show" max-width="520" persistent>
      <v-card class="game-dialog qqss-ring text-center" elevation="20">
        <div class="game-dialog-header">
          <v-icon icon="mdi-hand-wave" color="light-blue" size="48" class="dialog-icon" />
          <h2 class="dialog-title">{{ welcomeDialog.title }}</h2>
        </div>
        <v-card-text class="dialog-content">
          <p class="dialog-message">{{ welcomeDialog.message }}</p>
          <div class="text-medium-emphasis mt-2">Sonido de introducción reproduciéndose…</div>
          <div class="text-left mt-4">
            <div class="text-subtitle-2 mb-1">Reglas del juego</div>
            <ul class="text-body-2 pl-6">
              <li>Niveles 1 a 5: sin límite de tiempo.</li>
              <li>Niveles 6 a 10: 1 minuto por pregunta.</li>
              <li>Niveles 11 a 15: 2 minutos por pregunta.</li>
            </ul>
          </div>
          <div v-if="welcomeDialog.ticking" class="mt-4">
            <div class="countdown-circle">
              <span class="countdown-number">{{ welcomeDialog.countdown || 0 }}</span>
            </div>
            <div class="text-caption mt-1">Comenzando en…</div>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pa-4">
          <v-btn
            v-if="!welcomeDialog.ticking"
            color="primary"
            size="large"
            variant="elevated"
            class="qqss-ring"
            prepend-icon="mdi-play"
            @click="startAfterWelcome"
          >
            Iniciar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Popup del ranking -->
    <RankingPopup v-model="showRanking" />
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import QuestionCard from '../components/QuestionCard.vue';
import Timer from '../components/Timer.vue';
import Animations from '../components/Animations.vue';
import MoneyLadder from '../components/MoneyLadder.vue';
import GameDialog from '../components/GameDialog.vue';
import RankingPopup from '../components/RankingPopup.vue';
import VictoryModal from '../components/VictoryModal.vue';
import { useGameSounds } from '../composables/useGameSounds.js';
import { LADDER_VALUES } from '../constants/ladder.js';

// Inicializar sistema de sonidos
const {
  initializeSounds,
  enableAudioContext,
  audioContextReady,
  playIntro,
  playCorrect,
  playWrong,
  playLifeline,
  startSuspense,
  stopSuspense,
  playQuestion,
  playFinalAnswer,
  playTimerTick,
  playVictory,
  toggleMute,
  isMuted,
  masterVolume,
  setMasterVolume,
  beep,
  stopAll
} = useGameSounds();

const router = useRouter();

const playerName = ref('');
const nameInput = ref('');
const started = ref(false);
const difficulty = ref(1);
const question = ref(null);
const options = ref([]);

// Control del ranking
const showRanking = ref(false);

// Lista de jugadores previos para autocompletado
const previousPlayers = ref([]);
const playersData = ref([]);
const loadingPlayers = ref(false);
const selectedPlayerInfo = ref(null);

// Reglas de validación para el nombre
const nameRules = [
  value => !!value || 'El nombre es obligatorio',
  value => (value && value.trim().length >= 2) || 'El nombre debe tener al menos 2 caracteres',
  value => (value && value.trim().length <= 30) || 'El nombre no puede exceder 30 caracteres'
];

// Mapea índices visibles -> índices originales (para comodines)
const indexMap = ref([]);
const selected = ref(null);
const used = reactive({ fifty: false, verse: false, call: false });
const points = ref(0);
const animState = ref('');

// Control del timer
const timerRef = ref(null);
const timerPaused = ref(false);
const timePerLevel = computed(() => {
  if (difficulty.value >= 11) return 120;
  if (difficulty.value >= 6) return 60;
  return 0; // sin tiempo para niveles 1-5
});

// Estado del dialog personalizado
const dialog = reactive({
  show: false,
  type: 'info',
  title: '',
  message: '',
  points: null,
  buttonText: 'Aceptar'
});

// Estado del dialog de fin de juego con opciones
const gameEndDialog = reactive({
  show: false,
  type: 'success',
  title: '',
  message: '',
  points: 0
});

// Dialog de bienvenida antes de iniciar el juego
const welcomeDialog = reactive({
  show: false,
  title: '',
  message: '',
  countdown: 0,
  ticking: false,
});

// Confirmación para salir del juego
const showExitConfirm = ref(false);

function onRequestExit() {
  // Pausar timer y música de suspenso mientras decide
  timerPaused.value = true;
  if (timerRef.value) timerRef.value.pause();
  stopSuspense();
  showExitConfirm.value = true;
}

function cancelExit() {
  showExitConfirm.value = false;
  // Reanudar si hay tiempo en este nivel
  timerPaused.value = false;
  if (timerRef.value) {
    if (timePerLevel.value > 0 && typeof timerRef.value.resume === 'function') {
      timerRef.value.resume();
    }
  }
  startSuspense();
}

function confirmExit() {
  showExitConfirm.value = false;
  // Detener sonidos y limpiar estado
  stopAll();
  resetGame();
  router.push('/');
}

function showDialog(type, title, message, dialogPoints = null, buttonText = 'Aceptar') {
  dialog.type = type;
  dialog.title = title;
  dialog.message = message;
  dialog.points = dialogPoints;
  dialog.buttonText = buttonText;
  dialog.show = true;
}

// Función para mostrar el diálogo de fin de juego con opciones
function showGameEndDialog(title, message, points) {
  gameEndDialog.title = title;
  gameEndDialog.message = message;
  gameEndDialog.points = points;
  gameEndDialog.show = true;
}

// Estado para modal de victoria
const showVictory = ref(false)
const victoryTitle = ref('')
const victoryMessage = ref('')
const victoryConfettiDelayMs = ref(220)

// Función específica para mostrar explicaciones with espera
async function showExplanationDialog(explanation, isCorrect) {
  const title = isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta';
  const type = isCorrect ? 'success' : 'info';
  const buttonText = 'Continuar';
  
  // Pausar el timer mientras se muestra la explicación
  timerPaused.value = true;
  if (timerRef.value) {
    timerRef.value.pause();
  }
    
  dialog.type = type;
  dialog.title = title;
  dialog.message = explanation;
  dialog.points = null;
  dialog.buttonText = buttonText;
  dialog.show = true;
  
  // Crear una promesa que se resuelva cuando se cierre el dialog
  return new Promise(resolve => {
    explanationResolver = resolve;
    
    // Timeout de seguridad para evitar promesas colgadas
    explanationTimeout = setTimeout(() => {
      if (explanationResolver) {
        const resolver = explanationResolver;
        explanationResolver = null;
        explanationTimeout = null;
        dialog.show = false;
        
        // Reanudar el timer
        timerPaused.value = false;
        if (timerRef.value) {
          timerRef.value.resume();
        }
        
        resolver();
      }
    }, 30000); // 30 segundos timeout
  });
}

function onDialogClose() {
  dialog.show = false;
  // Si hay un resolver pendiente para explicaciones, ejecutarlo
  if (explanationResolver) {
    const resolver = explanationResolver;
    explanationResolver = null;
    
    // Limpiar timeout
    if (explanationTimeout) {
      clearTimeout(explanationTimeout);
      explanationTimeout = null;
    }
    
    // Reanudar el timer después de cerrar la explicación
    timerPaused.value = false;
    if (timerRef.value) {
      timerRef.value.resume();
    }
    
    resolver();
  }
}

// Funciones para manejar el reinicio del juego
function playAgainSameUser() {
  resetGame();
  // No iniciar automáticamente - dejar que el usuario decida cuándo comenzar
}

function playAgainNewUser() {
  resetGame();
  playerName.value = '';
  selectedPlayerInfo.value = null;
}

function resetGame() {
  difficulty.value = 1;
  points.value = 0;
  question.value = null;
  options.value = [];
  selected.value = null;
  used.fifty = false;
  used.verse = false;
  used.call = false;
  animState.value = '';
  started.value = false;
  timerPaused.value = false;
  gameEndDialog.show = false;
  showVictory.value = false;
  
  // Limpiar audio
  stopSuspense();
}

async function loadQuestion() {
  try {
    const { data } = await axios.get(`/api/game/question/${difficulty.value}`);
    question.value = data;
    // Barajar opciones para aleatorizar la posición de la respuesta correcta
    const order = data.options.map((_, i) => i);
    // Fisher–Yates shuffle
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    options.value = order.map(i => data.options[i]);
    indexMap.value = order; // mapa: índice visible -> índice original
    selected.value = null;
    
    // Sonido de nueva pregunta (solo si no es la primera)
    if (difficulty.value > 1) {
      playQuestion();
    }
    
    // Gestionar el temporizador según el nivel
    timerPaused.value = false;
    if (timePerLevel.value > 0) {
      // Si hay límite de tiempo, iniciar/reiniciar el timer
      if (timerRef.value) timerRef.value.start();
    } else {
      // Sin límite de tiempo: asegurar que el timer no esté corriendo
      if (timerRef.value) timerRef.value.pause();
    }
  } catch (error) {
    console.error('Error loading question:', error);
    
    // Manejo específico para cuando no hay preguntas disponibles
    if (error.response && error.response.status === 404) {
      const scoreResult = await submitScore();
      let message = `Has alcanzado el nivel ${difficulty.value}. ¡No hay más preguntas por el momento, pero has demostrado un gran conocimiento de la fe! ¡Sigue creciendo espiritualmente!`;
      
      if (scoreResult?.updated) {
        message += ` ¡Nuevo récord personal! Tu puntaje anterior ha sido actualizado.`;
      } else if (scoreResult?.isNew) {
        message += ` Tu puntaje ha sido registrado en el ranking.`;
      }
      
      showGameEndDialog('¡Excelente Progreso!', message, points.value);
    } else {
      showDialog('error', 'Error de Conexión', 'No se pudo cargar la pregunta. Verifica tu conexión.', null, 'Reintentar');
      started.value = false;
    }
  }
}

async function start() {
  // Validar que el usuario haya ingresado su nombre
  // Confirmar nombre desde el buffer de búsqueda si aplica
  if (nameInput.value && nameInput.value.trim()) {
    playerName.value = nameInput.value.trim();
  }

  if (!playerName.value || playerName.value.trim() === '') {
    showDialog('warning', 'Nombre Requerido', 'Por favor ingresa tu nombre para comenzar el juego. Es obligatorio para guardar tu puntuación en el ranking.', null, 'Entendido');
    return;
  }
  
  // Validar longitud del nombre
  if (playerName.value.trim().length < 2) {
    showDialog('warning', 'Nombre Muy Corto', 'Tu nombre debe tener al menos 2 caracteres para poder guardarlo correctamente.', null, 'Entendido');
    return;
  }
  
  if (playerName.value.trim().length > 30) {
    showDialog('warning', 'Nombre Muy Largo', 'Tu nombre no puede exceder 30 caracteres. Por favor acórtalo.', null, 'Entendido');
    return;
  }
  
  try {
    // Habilitar audio y mostrar diálogo de bienvenida con la intro
    await enableAudioContext();
    playIntro();
    welcomeDialog.title = `¡Bienvenido, ${playerName.value.trim()}!`;
    welcomeDialog.message = 'Prepárate para poner a prueba tus conocimientos. Respira profundo, concéntrate y ¡vamos a por ello!';
    welcomeDialog.countdown = 0;
    welcomeDialog.ticking = false;
    welcomeDialog.show = true;
  } catch (error) {
    console.error('Error starting game:', error);
    started.value = false;
    showDialog('error', 'Error al Iniciar', 'No se pudo iniciar el juego. Verifica tu conexión.', null, 'Reintentar');
  }
}

function onPlayerPicked(val) {
  // Sincronizar el buffer de búsqueda para evitar divergencias
  if (typeof val === 'string') {
    nameInput.value = val
  } else if (val && val.value) {
    nameInput.value = val.value
    playerName.value = val.value
  }
  updateSelectedPlayerInfo()
}

function onSelect(i) { selected.value = i; }

function confirmAnswer() {
  if (selected.value === null) return;
  playFinalAnswer();
  // Pequeña pausa para que se escuche el sonido antes de procesar
  setTimeout(() => {
    next();
  }, 500);
}

async function next() {
  if (selected.value === null) return;
  try {
    // Validar en backend
    const pickedOriginal = indexMap.value[selected.value];
    const { data } = await axios.post('/api/game/answer', { questionId: question.value.id, index: pickedOriginal });
    
    if (data.correct) {
  // Asignar puntos según la escalera visible
  const stepIndex = Math.max(0, Math.min(LADDER_VALUES.length - 1, difficulty.value - 1));
  points.value += LADDER_VALUES[stepIndex];
      animState.value = 'correct'; setTimeout(()=> animState.value = '', 800);
      playCorrect();
      
      // Mostrar explicación de la respuesta correcta
      try {
        await showExplanationDialog(data.explanation || 'Respuesta correcta. ¡Bien hecho!', true);
      } catch (explanationError) {
        console.error('Error showing explanation:', explanationError);
      }
      
      difficulty.value++;
      if (difficulty.value > 15) {
        stopSuspense();
        playVictory();
        const scoreResult = await submitScore();
        let message = '¡Has completado todas las preguntas y te has convertido en santo! Has demostrado un conocimiento excepcional de la fe.';
        
        if (scoreResult?.updated) {
          message += ` ¡Nuevo récord personal! Tu puntaje anterior ha sido actualizado.`;
        } else if (scoreResult?.isNew) {
          message += ` Tu puntaje ha sido registrado en el ranking.`;
        }
        
        // Mostrar modal de victoria animado
        victoryTitle.value = '¡Felicitaciones!';
        victoryMessage.value = message;
        gameEndDialog.show = false;
        showVictory.value = true;
        return;
      }
      await loadQuestion();
    } else {
      animState.value = 'wrong'; setTimeout(()=> animState.value = '', 800);
      stopSuspense();
      playWrong();
      
      // Mostrar explicación de la respuesta incorrecta
      try {
        await showExplanationDialog(data.explanation || 'Respuesta incorrecta. ¡Sigue practicando!', false);
      } catch (explanationError) {
        console.error('Error showing explanation:', explanationError);
      }
      
      const scoreResult = await submitScore();
      let message = `No te preocupes, ¡sigue practicando para crecer en la fe! Llegaste hasta el nivel ${difficulty.value}.`;
      
      if (scoreResult?.updated) {
        message += ` ¡Nuevo récord personal! Tu puntaje anterior ha sido actualizado.`;
      } else if (scoreResult?.isNew) {
        message += ` Tu puntaje ha sido registrado en el ranking.`;
      }
      
      showGameEndDialog('Fin del Juego', message, points.value);
    }
  } catch (error) {
    console.error('Error processing answer:', error);
    showDialog('error', 'Error de Conexión', 'No se pudo procesar tu respuesta. Verifica tu conexión.', points.value, 'Continuar');
    started.value = false;
  }
}

async function fiftyFifty() {
  try {
    playLifeline();
    const { data } = await axios.post('/api/game/lifeline/50-50', { questionId: question.value.id });
    // Reconstruir opciones visibles y mapa de índices
    const keep = [...data.keep];
    // barajar el orden para que la correcta no quede siempre primera
    for (let i = keep.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keep[i], keep[j]] = [keep[j], keep[i]];
    }
    options.value = keep.map(i => question.value.options[i]);
    indexMap.value = keep;
    used.fifty = true;
  } catch (error) {
    console.error('Error using 50-50 lifeline:', error);
    showDialog('error', 'Error', 'No se pudo usar el comodín 50-50. Intenta de nuevo.', null, 'Aceptar');
  }
}

async function showVerse() {
  try {
    playLifeline();
    const { data } = await axios.get(`/api/game/lifeline/verse/${question.value.id}`);
    showDialog('hint', 'Pasaje Iluminador', data.verseHint || 'Sin pista disponible para esta pregunta.', null, 'Entendido');
    used.verse = true;
  } catch (error) {
    console.error('Error getting verse hint:', error);
    showDialog('error', 'Error', 'No se pudo obtener la pista. Intenta de nuevo.', null, 'Aceptar');
  }
}

async function callFriend() {
  try {
    playLifeline();
    const { data } = await axios.post('/api/game/lifeline/call', { questionId: question.value.id });
    const suggestedOriginal = data.suggestedIndex;
    const suggestedVisible = indexMap.value.indexOf(suggestedOriginal);
    const idx = suggestedVisible >= 0 ? suggestedVisible : 0;
    const letter = String.fromCharCode(65 + idx);
    showDialog('info', 'Llamada a un Amigo', `Tu amigo ha analizado la pregunta y sugiere la opción ${letter}.`, null, 'Gracias');
    used.call = true;
  } catch (error) {
    console.error('Error calling friend:', error);
    showDialog('error', 'Error', 'No se pudo contactar a tu amigo. Intenta de nuevo.', null, 'Aceptar');
  }
}

async function submitScore() {
  try {
    if (!playerName.value) return null;
    const response = await axios.post('/api/game/score', { 
      playerName: playerName.value, 
      points: points.value 
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting score:', error);
    // No mostramos error al usuario aquí ya que es una operación en segundo plano
    return null;
  }
}

async function onTimeout(){
  // Tiempo agotado: finalizar ronda y guardar puntaje
  try {
    stopSuspense();
    playWrong(); // Sonido de error por tiempo agotado
    const scoreResult = await submitScore();
    let message = `Se acabó el tiempo para responder esta pregunta. Llegaste hasta el nivel ${difficulty.value}.`;
    
    if (scoreResult?.updated) {
      message += ` ¡Nuevo récord personal! Tu puntaje anterior ha sido actualizado.`;
    } else if (scoreResult?.isNew) {
      message += ` Tu puntaje ha sido registrado en el ranking.`;
    }
    
    showGameEndDialog('Tiempo Agotado', message, points.value);
  } catch (error) {
    console.error('Error on timeout:', error);
    stopSuspense();
    showGameEndDialog('Tiempo Agotado', `Se acabó el tiempo para responder esta pregunta. Llegaste hasta el nivel ${difficulty.value}.`, points.value);
  }
}

// Función para manejar el tick del timer
function onTimerTick(remainingSeconds) {
  // Solo reproducir sonido en los últimos 5 segundos para crear más tensión
  if (remainingSeconds <= 5) {
    playTimerTick();
  }
}

// Confirmar inicio real del juego desde el diálogo de bienvenida
async function startAfterWelcome() {
  try {
    // Iniciar cuenta regresiva 3-2-1 antes de comenzar
    if (!welcomeDialog.ticking) {
      welcomeDialog.ticking = true;
      welcomeDialog.countdown = 3;
      const tick = async () => {
        if (welcomeDialog.countdown <= 0) {
          // Beep de arranque, más pronunciado y fuerte
          beep({ freq: 520, ms: 240, volume: 1.0 });
          // Le damos un breve margen al beep antes de iniciar
          setTimeout(async () => {
            welcomeDialog.ticking = false;
            welcomeDialog.show = false;
            started.value = true;
            stopAll();
            playQuestion();
            await loadQuestion();
            startSuspense();
          }, 150);
          return;
        }
        // Beep por número (descendente). El "1" más largo/fuerte.
        const base = 900; // Hz
        const freq = base - (3 - welcomeDialog.countdown) * 120;
        if (welcomeDialog.countdown === 1) {
          beep({ freq, ms: 200, volume: 0.9 });
        } else {
          beep({ freq, ms: 120, volume: 0.6 });
        }
        welcomeDialog.countdown -= 1;
        setTimeout(tick, 900);
      };
      setTimeout(tick, 900);
    }
  } catch (e) {
    console.error('Error starting after welcome:', e);
    showDialog('error', 'Error', 'No se pudo iniciar la partida.', null, 'Cerrar');
  }
}

// Función para cargar jugadores previos
async function loadPreviousPlayers() {
  loadingPlayers.value = true;
  try {
    const { data } = await axios.get('/api/ranking');
    // Crear un mapa para almacenar el mejor puntaje de cada jugador
    const playersMap = new Map();
    
    data.forEach(player => {
      const name = player.playerName?.trim();
      if (name && name.length >= 2) {
        const key = name.toLowerCase();
        if (!playersMap.has(key) || player.points > playersMap.get(key).points) {
          playersMap.set(key, {
            name: name,
            points: player.points,
            date: player.createdAt
          });
        }
      }
    });
    
    // Convertir a arrays ordenados por puntaje (sin limitar cantidad)
    const sortedPlayers = Array.from(playersMap.values()).sort((a, b) => b.points - a.points);
    
    previousPlayers.value = sortedPlayers.map(p => p.name);
    playersData.value = sortedPlayers;
    
  } catch (error) {
    console.error('Error loading previous players:', error);
    previousPlayers.value = [];
    playersData.value = [];
  } finally {
    loadingPlayers.value = false;
  }
}

// Función para obtener información del jugador seleccionado
function updateSelectedPlayerInfo() {
  if (!playerName.value || !playerName.value.trim()) {
    selectedPlayerInfo.value = null;
    return;
  }
  const typed = playerName.value.trim().toLowerCase();
  const playerData = playersData.value.find(
    p => p.name.trim().toLowerCase() === typed
  );
  
  selectedPlayerInfo.value = playerData || null;
}

// Función para obtener información de un jugador por nombre
function getPlayerInfo(name) {
  const typed = name?.trim().toLowerCase();
  if (!typed) return null;
  return playersData.value.find(
    p => p.name?.trim().toLowerCase() === typed
  );
}

// Cargar jugadores previos al montar el componente
onMounted(() => {
  loadPreviousPlayers();
  initializeSounds();
  // No reproducir intro automáticamente - esperaremos la primera interacción del usuario
});

// Watcher para actualizar información del jugador seleccionado
watch(playerName, () => {
  updateSelectedPlayerInfo();
});

// Función para habilitar audio con cualquier interacción
function handleFirstInteraction() {
  if (!audioContextReady.value) {
    enableAudioContext();
  }
}
</script>

<style scoped>
.center-viewport {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.header-stats {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  padding-left: 8px;
}
.countdown-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, rgba(103,80,164,0.35), rgba(103,80,164,0.08));
  box-shadow: 0 0 24px rgba(103,80,164,0.35), inset 0 0 18px rgba(255,255,255,0.08);
  animation: pulse 900ms ease-in-out infinite;
}
.countdown-number {
  font-size: 42px;
  font-weight: 800;
  color: #c7b7ff;
  text-shadow: 0 0 8px rgba(199,183,255,0.6);
}
@media (max-width: 600px) {
  .header-main-title { display: none; }
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
</style>
