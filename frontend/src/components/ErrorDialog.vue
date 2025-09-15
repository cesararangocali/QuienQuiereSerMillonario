<template>
  <GameDialog
    v-model:show="show"
    type="error"
    :title="title"
    :message="message"
    :points="points"
    button-text="Intentar de nuevo"
    @close="$emit('close')"
  />
</template>

<script setup>
import GameDialog from './GameDialog.vue';

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Respuesta Incorrecta'
  },
  message: String,
  points: Number
});

defineEmits(['update:show', 'close']);
</script>
