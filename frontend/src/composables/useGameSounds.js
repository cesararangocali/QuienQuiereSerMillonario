import { ref } from 'vue';

// Configuración de sonidos
const soundsConfig = {
  intro: { file: '/audio/intro.mp3', volume: 0.7 },
  correct: { file: '/audio/correct.mp3', volume: 0.8 },
  wrong: { file: '/audio/wrong.mp3', volume: 0.8 },
  lifeline: { file: '/audio/lifeline.mp3', volume: 0.6 },
  suspense: { file: '/audio/suspense_loop.mp3', volume: 0.4, loop: true },
  question: { file: '/audio/question.mp3', volume: 0.5 },
  finalAnswer: { file: '/audio/final_answer.mp3', volume: 0.7 },
  timerTick: { file: '/audio/timer_tick.mp3', volume: 0.3 },
  victory: { file: '/audio/victory.mp3', volume: 0.9 }
};

export function useGameSounds() {
  const sounds = ref({});
  const isMuted = ref(false);
  const masterVolume = ref(0.7);
  const currentMusic = ref(null);
  const audioContextReady = ref(false);
  
  // Inicializar sonidos
  const initializeSounds = () => {
    Object.keys(soundsConfig).forEach(key => {
      const config = soundsConfig[key];
      const audio = new Audio(config.file);
      audio.volume = config.volume * masterVolume.value;
      audio.loop = config.loop || false;
      
      // Manejar errores de carga silenciosamente
      audio.onerror = () => {
        // No mostrar warning si el archivo no existe (modo demo sin archivos de audio)
      };
      
      // Preparar para interacción del usuario si está disponible
      audio.preload = 'metadata'; // Cambiar a metadata para evitar errores de descarga
      
      sounds.value[key] = audio;
    });
  };
  
  // Habilitar audio después de la primera interacción del usuario
  const enableAudioContext = async () => {
    if (audioContextReady.value) return;
    
    try {
      // Intentar reproducir un sonido silencioso para "despertar" el contexto de audio
      const testAudio = new Audio();
      testAudio.volume = 0;
      await testAudio.play();
      audioContextReady.value = true;
      console.log('Contexto de audio habilitado');
    } catch (error) {
      console.warn('Contexto de audio no disponible aún:', error.message);
    }
  };
  
  // Reproducir sonido
  const playSound = async (soundName, options = {}) => {
    if (isMuted.value) return;
    
    const sound = sounds.value[soundName];
    if (!sound) {
      console.warn(`Sonido no encontrado: ${soundName}`);
      return;
    }
    
    try {
      // Intentar habilitar el contexto de audio si no está listo
      if (!audioContextReady.value) {
        await enableAudioContext();
      }
      
      // Configurar opciones
      if (options.volume !== undefined) {
        sound.volume = options.volume * masterVolume.value;
      }
      
      // Detener sonido anterior si se especifica
      if (options.interrupt) {
        sound.currentTime = 0;
      }
      
      // Reproducir
      sound.currentTime = 0;
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        
        // Si es música de fondo, guardar referencia
        if (options.isMusic) {
          currentMusic.value = sound;
        }
      }
      
    } catch (error) {
      // Manejar específicamente errores de autoplay
      if (error.name === 'NotAllowedError') {
        console.warn(`Autoplay bloqueado para ${soundName}. El sonido se reproducirá después de la interacción del usuario.`);
      } else if (error.name === 'AbortError' || error.message.includes('could not be decoded')) {
        // Archivo de audio vacío o inválido - modo demo silencioso
        return;
      } else {
        console.warn(`Error al reproducir sonido ${soundName}:`, error.message);
      }
    }
  };
  
  // Detener sonido
  const stopSound = (soundName) => {
    const sound = sounds.value[soundName];
    if (sound && !sound.paused) {
      sound.pause();
      sound.currentTime = 0;
    }
  };
  
  // Detener toda la música de fondo
  const stopMusic = () => {
    if (currentMusic.value && !currentMusic.value.paused) {
      currentMusic.value.pause();
      currentMusic.value.currentTime = 0;
      currentMusic.value = null;
    }
  };
  
  // Alternar sonido
  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    if (isMuted.value) {
      Object.values(sounds.value).forEach(sound => {
        if (!sound.paused) {
          sound.pause();
        }
      });
    }
  };
  
  // Cambiar volumen maestro
  const setMasterVolume = (volume) => {
    masterVolume.value = Math.max(0, Math.min(1, volume));
    Object.keys(soundsConfig).forEach(key => {
      const config = soundsConfig[key];
      const sound = sounds.value[key];
      if (sound) {
        sound.volume = config.volume * masterVolume.value;
      }
    });
  };
  
  // Funciones específicas del juego
  const playIntro = () => {
    stopMusic();
    playSound('intro', { isMusic: true });
  };
  
  const playCorrect = () => {
    stopMusic();
    playSound('correct', { interrupt: true });
  };
  
  const playWrong = () => {
    stopMusic();
    playSound('wrong', { interrupt: true });
  };
  
  const playLifeline = () => {
    playSound('lifeline');
  };
  
  const startSuspense = () => {
    playSound('suspense', { isMusic: true, volume: 0.3 });
  };
  
  const stopSuspense = () => {
    stopSound('suspense');
  };
  
  const playQuestion = () => {
    stopMusic();
    playSound('question');
  };
  
  const playFinalAnswer = () => {
    stopMusic();
    playSound('finalAnswer');
  };
  
  const playTimerTick = () => {
    playSound('timerTick');
  };
  
  const playVictory = () => {
    stopMusic();
    playSound('victory', { isMusic: true });
  };
  
  return {
    sounds,
    isMuted,
    masterVolume,
    audioContextReady,
    initializeSounds,
    enableAudioContext,
    playSound,
    stopSound,
    stopMusic,
    toggleMute,
    setMasterVolume,
    // Funciones específicas
    playIntro,
    playCorrect,
    playWrong,
    playLifeline,
    startSuspense,
    stopSuspense,
    playQuestion,
    playFinalAnswer,
    playTimerTick,
    playVictory
  };
}
