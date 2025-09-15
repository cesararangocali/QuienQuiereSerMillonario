<template>
  <GameDialog
    v-model:show="show"
    type="success"
    :title="title"
    :message="message"  
    :points="points"
    button-text="¡Genial!"
    @close="$emit('close')"
  />
</template>

<script setup>
import GameDialog from './GameDialog.vue';

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: '¡Excelente!'
  },
  message: String,
  points: Number
});

defineEmits(['update:show', 'close']);
</script>
