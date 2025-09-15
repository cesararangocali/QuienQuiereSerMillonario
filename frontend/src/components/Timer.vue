<template>
  <div class="d-flex align-center ga-2">
    <v-progress-circular :model-value="percent" :size="40" :width="5" color="indigo" />
    <span>{{ remaining }}s</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({ 
  seconds: { type: Number, default: 30 },
  paused: { type: Boolean, default: false }
});

const emit = defineEmits(['timeout', 'tick']);

const remaining = ref(props.seconds);
let timer = null;

const percent = computed(() => (100 * remaining.value) / props.seconds);

function start() { 
  clear(); 
  remaining.value = props.seconds; 
  if (!props.paused) {
    timer = setInterval(() => { 
      remaining.value--; 
      
      // Emitir tick en los últimos 10 segundos
      if (remaining.value <= 10 && remaining.value > 0) {
        emit('tick', remaining.value);
      }
      
      if (remaining.value <= 0) { 
        clear(); 
        emit('timeout'); 
      } 
    }, 1000); 
  }
}

function pause() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function resume() {
  if (!timer && remaining.value > 0) {
    timer = setInterval(() => { 
      remaining.value--; 
      
      // Emitir tick en los últimos 10 segundos
      if (remaining.value <= 10 && remaining.value > 0) {
        emit('tick', remaining.value);
      }
      
      if (remaining.value <= 0) { 
        clear(); 
        emit('timeout'); 
      } 
    }, 1000);
  }
}

function clear() { 
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

// Exponer funciones para uso externo
defineExpose({ pause, resume, start });

onMounted(start);
onBeforeUnmount(clear);

watch(() => props.seconds, () => start());
watch(() => props.paused, (newPaused) => {
  if (newPaused) {
    pause();
  } else {
    resume();
  }
});
</script>