<template>
  <v-container class="py-0">
    <section class="qqss-hero text-center">
      <div class="qqss-title">Bienvenido a ¿Quién quiere ser santo?</div>
      <div class="qqss-sub">Aprende, juega y crece en la fe.</div>
      <div class="mt-6 d-flex justify-center ga-4 flex-wrap">
        <v-btn size="x-large" color="indigo" class="qqss-ring game-btn" to="/juego" prepend-icon="mdi-play-circle">Jugar</v-btn>
        <v-btn size="x-large" color="teal" class="qqss-ring game-btn" to="/catequesis" prepend-icon="mdi-book-open-page-variant">Catequesis</v-btn>
        <v-btn size="x-large" color="deep-purple" class="qqss-ring game-btn" to="/competitivo" prepend-icon="mdi-sword-cross">Competitivo</v-btn>
      </div>
      <div class="mt-4 d-flex justify-center ga-4 flex-wrap">
        <v-btn size="large" variant="tonal" color="primary" class="qqss-ring secondary-btn" @click="openPrayer('inicio')" prepend-icon="mdi-church">Oración inicial</v-btn>
        <v-btn size="large" variant="tonal" color="grey" class="qqss-ring secondary-btn" @click="showRanking = true" prepend-icon="mdi-trophy">Ranking</v-btn>
      </div>
    </section>

    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <v-row>
            <v-col cols="12" md="6">
              <div class="info-card qqss-ring">
                <div class="info-title">¿Cómo se juega?</div>
                <div class="info-text">Responde 15 preguntas con 3 comodines. Tiempo: niveles 1-5 sin límite, 6-10 con 1 minuto y 11-15 con 2 minutos por pregunta. ¡Llega a la última para convertirte en santo!</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-card qqss-ring">
                <div class="info-title">Consejos</div>
                <div class="info-text">Úsalo en catequesis, reuniones o en familia. Ajusta el contenido desde el panel de Admin.</div>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <RankingPopup v-model="showRanking" />
    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2500">{{ snack.text }}</v-snackbar>
    <PrayerModal v-model="showPrayer" :text="prayerText" />
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue';
import RankingPopup from '../components/RankingPopup.vue';
import PrayerModal from '../components/PrayerModal.vue';
import axios from 'axios';
const showRanking = ref(false);
const showPrayer = ref(false);
const prayers = ref([]);
const prayerText = ref('');
const snack = reactive({ show:false, text:'', color:'success' });
function notify(ok, text){ snack.text = text; snack.color = ok ? 'success' : 'error'; snack.show = true; }

async function loadPrayers(){
  if (prayers.value.length) return;
  try { 
    const { data } = await axios.get('/api/game/prayers'); 
    prayers.value = data; 
  }
  catch (error) { 
    console.error('Error loading prayers:', error);
    notify(false, 'No se pudieron cargar las oraciones'); 
  }
}

async function openPrayer(key){
  try {
    await loadPrayers();
    const p = prayers.value.find(x => x.key === key);
    prayerText.value = p?.text || 'Señor, acompáñanos en este juego.';
    showPrayer.value = true;
  } catch (error) {
    console.error('Error opening prayer:', error);
    notify(false, 'Error al abrir la oración');
  }
}
</script>
