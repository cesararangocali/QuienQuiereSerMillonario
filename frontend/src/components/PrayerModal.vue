<template>
  <v-dialog v-model="model" max-width="700">
    <v-card>
      <v-card-title>Oración</v-card-title>
      <v-card-text>
        <div v-html="text"></div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="close">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, watch } from 'vue';
const props = defineProps({ modelValue: Boolean, text: String });
const emit = defineEmits(['update:modelValue']);
const model = ref(props.modelValue);
watch(() => props.modelValue, v => model.value = v);
function close(){ emit('update:modelValue', false); }
</script>
