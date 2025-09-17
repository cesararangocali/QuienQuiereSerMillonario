<template>
  <v-container class="py-8 text-center">
    <h1 class="text-h5 mb-2">Vota por la respuesta</h1>
    <div class="text-body-2 mb-6">Elige una opción para ayudar al participante</div>
    <div v-if="loading" class="my-6"><v-progress-circular indeterminate color="primary" /></div>
    <div v-else>
      <div class="d-flex flex-column ga-2 mx-auto" style="max-width: 420px;">
        <v-btn v-for="(opt, i) in options" :key="i" color="primary" variant="elevated" size="large" @click="vote(i)" :disabled="sent">
          {{ letters[i] }}. {{ opt }}
        </v-btn>
      </div>
      <div v-if="sent" class="mt-6 text-success">¡Voto registrado! Gracias por participar.</div>
    </div>
  </v-container>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const pollId = route.params.pollId
const loading = ref(true)
const sent = ref(false)
const options = ref(['Opción A','Opción B','Opción C','Opción D'])
const letters = ['A','B','C','D']

onMounted(async ()=>{
  try {
    // opcionalmente podríamos cargar el texto real de opciones vía socket; aquí mantenemos 4 botones.
    await axios.get(`/api/game/poll/${pollId}`)
  } catch {}
  loading.value = false
})

async function vote(i){
  if (sent.value) return
  try {
    const voterKey = localStorage.getItem('voterKey') || Math.random().toString(36).slice(2)
    localStorage.setItem('voterKey', voterKey)
    await axios.post(`/api/game/poll/${pollId}/vote`, { optionIndex: i, voterKey })
    sent.value = true
  } catch {}
}
</script>

<style scoped>
</style>