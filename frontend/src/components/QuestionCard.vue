<template>
  <div>
    <v-card v-if="question" class="pa-4 qqss-ring" elevation="8">
      <v-card-title class="text-h6 text-center py-4 question-title">{{ question.text }}</v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="6" v-for="(opt, i) in options" :key="i">
            <v-card 
              class="qqss-option pa-4" 
              :class="{
                'selected-option': selected === i,
                'correct-option': showResult && i === correctAnswer,
                'wrong-option': showResult && selected === i && i !== correctAnswer
              }"
              :style="{ '--option-index': i }"
              elevation="2"
              @click="$emit('select', i)"
              :disabled="disabled"
            >
              <v-card-text class="text-center">
                <span class="option-letter">{{ String.fromCharCode(65+i) }}.</span>
                <span class="option-text">{{ opt }}</span>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
defineProps({ 
  question: Object, 
  options: Array, 
  selected: Number,
  correctAnswer: Number,
  showResult: Boolean,
  disabled: Boolean
});
</script>

<style scoped>
.question-title {
  white-space: normal;
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .question-title {
    font-size: 1rem !important;
    max-height: 28vh;
    overflow-y: auto;
    padding-right: 6px; /* espacio para el scrollbar */
  }
}

.selected-option {
  background: linear-gradient(135deg, rgba(63,81,181,0.3) 0%, rgba(63,81,181,0.1) 100%) !important;
  border: 2px solid #3f51b5 !important;
  animation: pulse-glow 1s ease-in-out infinite !important;
}

.correct-option {
  background: linear-gradient(135deg, rgba(76,175,80,0.3) 0%, rgba(76,175,80,0.1) 100%) !important;
  border: 2px solid #4caf50 !important;
  animation: pulse-glow 1s ease-in-out infinite !important;
}

.wrong-option {
  background: linear-gradient(135deg, rgba(244,67,54,0.3) 0%, rgba(244,67,54,0.1) 100%) !important;
  border: 2px solid #f44336 !important;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.option-letter {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--qqss-accent);
  margin-right: 8px;
}

.option-text {
  font-size: 1rem;
  font-weight: 500;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.qqss-option:disabled {
  pointer-events: none;
  opacity: 0.7;
}
</style>
