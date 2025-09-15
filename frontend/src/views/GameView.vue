<template>
  <v-container class="py-0" @click="handleFirstInteraction">
    <!-- Header del juego -->
    <section class="qqss-hero text-center mb-4">
      <div class="qqss-title">¿Quién quiere ser santo?</div>
      <div class="qqss-sub">Demuestra tu conocimiento de la fe</div>
      <div class="mt-4 d-flex justify-center ga-4 flex-wrap">
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

    <!-- Área del juego -->
    <v-card class="pa-4 qqss-ring game-stage" elevation="12" style="width: 100%;">
      <v-card-title class="d-flex align-center justify-center">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-gamepad-variant" size="large" color="accent" />
          <span class="text-h4 font-weight-bold">JUEGO</span>
        </div>
      </v-card-title>
      <v-divider class="my-4" />
      
      <!-- Estadísticas del juego - Solo mostrar cuando el juego haya comenzado -->
      <div v-if="started" class="text-center mb-4">
        <div class="d-flex justify-center ga-8 align-center">
          <div class="game-stat">
            <div class="stat-label">Ronda</div>
            <div class="stat-value">{{ difficulty }}/15</div>
          </div>
          <div class="game-stat">
            <div class="stat-label">Puntos</div>
            <div class="stat-value text-yellow-accent-3">{{ points }}</div>
          </div>
          <Timer ref="timerRef" :seconds="30" :paused="timerPaused" @timeout="onTimeout" @tick="onTimerTick" />
        </div>
      </div>

      <div v-if="!started" class="my-2 d-flex ga-2 align-end">
        <v-autocomplete
          v-model="playerName" 
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
        </v-autocomplete>
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
    <v-dialog v-model="gameEndDialog.show" max-width="500" persistent>
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
    
    <!-- Popup del ranking -->
    <RankingPopup v-model="showRanking" />
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import axios from 'axios';
import QuestionCard from '../components/QuestionCard.vue';
import Timer from '../components/Timer.vue';
import Animations from '../components/Animations.vue';
import MoneyLadder from '../components/MoneyLadder.vue';
import GameDialog from '../components/GameDialog.vue';
import RankingPopup from '../components/RankingPopup.vue';
import { useGameSounds } from '../composables/useGameSounds.js';

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
  setMasterVolume
} = useGameSounds();

const playerName = ref('');
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

function onGameEndDialogClose() {
  gameEndDialog.show = false;
}

// Variable para controlar el cierre del dialog de explicaciones
let explanationResolver = null;
let explanationTimeout = null;

// Función específica para mostrar explicaciones con espera
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
  
  // Limpiar audio
  stopSuspense();
}

async function loadQuestion() {
  try {
    const { data } = await axios.get(`/api/game/question/${difficulty.value}`);
    question.value = data;
    options.value = data.options;
    indexMap.value = data.options.map((_, i) => i);
    selected.value = null;
    
    // Sonido de nueva pregunta (solo si no es la primera)
    if (difficulty.value > 1) {
      playQuestion();
    }
    
    // Reanudar el timer para la nueva pregunta
    timerPaused.value = false;
    if (timerRef.value) {
      timerRef.value.start();
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
    // Habilitar contexto de audio con la primera interacción del usuario
    await enableAudioContext();
    
    started.value = true;
    
    // Reproducir intro si el contexto de audio está habilitado
    if (audioContextReady.value) {
      playIntro();
      // Esperar un poco para que se escuche el intro antes de continuar
      setTimeout(async () => {
        playQuestion(); // Sonido de inicio de pregunta
        await loadQuestion();
        startSuspense(); // Iniciar música de suspenso
      }, 2000);
    } else {
      playQuestion(); // Sonido de inicio de pregunta
      await loadQuestion();
      startSuspense(); // Iniciar música de suspenso
    }
  } catch (error) {
    console.error('Error starting game:', error);
    started.value = false;
    showDialog('error', 'Error al Iniciar', 'No se pudo iniciar el juego. Verifica tu conexión.', null, 'Reintentar');
  }
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
      points.value += 100 * difficulty.value; // placeholder de puntuación
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
        
        showGameEndDialog('¡Felicitaciones!', message, points.value);
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
    options.value = data.keep.map(i => question.value.options[i]);
    indexMap.value = data.keep;
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
    const suggested = data.suggestedIndex;
    const letter = String.fromCharCode(65 + suggested);
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
    
    // Convertir a arrays ordenados por puntaje
    const sortedPlayers = Array.from(playersMap.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 20); // Limitar a 20 mejores jugadores
    
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
  if (!playerName.value) {
    selectedPlayerInfo.value = null;
    return;
  }
  
  const playerData = playersData.value.find(
    p => p.name.toLowerCase() === playerName.value.toLowerCase()
  );
  
  selectedPlayerInfo.value = playerData || null;
}

// Función para obtener información de un jugador por nombre
function getPlayerInfo(name) {
  return playersData.value.find(
    p => p.name.toLowerCase() === name.toLowerCase()
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
