<template>
  <v-container class="py-0">
    <section class="qqss-hero text-center">
      <div class="qqss-title">Bienvenido a ¿Quién quiere ser santo?</div>
      <div class="qqss-sub">Aprende, juega y crece en la fe.</div>
      <div class="mt-4 d-flex justify-center ga-4 flex-wrap">
        <v-btn size="x-large" color="indigo" class="qqss-ring game-btn" to="/juego" prepend-icon="mdi-play-circle">Jugar</v-btn>
        <v-btn size="x-large" color="teal" class="qqss-ring game-btn" to="/catequesis" prepend-icon="mdi-book-open-page-variant">Catequesis</v-btn>
        <v-btn size="x-large" color="deep-purple" class="qqss-ring game-btn" to="/competitivo" prepend-icon="mdi-sword-cross">Competitivo</v-btn>
      </div>
      <div class="mt-2 d-flex justify-center ga-4 flex-wrap">
        <v-btn size="large" variant="tonal" color="primary" class="qqss-ring secondary-btn" @click="openPrayer('inicio')" prepend-icon="mdi-church">Oración inicial</v-btn>
        <v-btn size="large" variant="tonal" color="grey" class="qqss-ring secondary-btn" @click="showRanking = true" prepend-icon="mdi-trophy">Ranking</v-btn>
      </div>
    </section>

    <v-container class="py-6">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="9">
          <div class="info-card qqss-ring compact">
            <div class="info-title">¿Cómo se juega?</div>
            <div class="info-text ml-6" style="text-align:left">
              <ul style="margin:0; padding-left: 1.1rem; line-height:1.45;">
                <li><strong>15 preguntas</strong> y <strong>3 comodines</strong> (50/50, Llamar a un amigo, Preguntar al público).</li>
                <li><strong>Tiempos:</strong> 1–5 sin límite; 6–10: 60 s; 11–15: 120 s.</li>
                <li><strong>Pausas</strong> tras 5 y 10; pulsa <em>Iniciar</em> para seguir.</li>
                <li><strong>Escalones seguros</strong>: 5 y 10 (si fallas luego, conservas ese puntaje).</li>
                <li><strong>Confirma</strong> tu opción; si el tiempo llega a 0, cuenta como incorrecta.</li>
              </ul>
              <div class="d-flex justify-end mt-2 mr-11">
                <v-btn variant="text" density="compact" size="small" prepend-icon="mdi-information-outline" @click="showHowTo = true">Ver detalles</v-btn>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <RankingPopup v-model="showRanking" />
    <v-dialog v-model="showHowTo" :fullscreen="isMobile" max-width="720" transition="dialog-bottom-transition">
      <v-card :class="isMobile ? 'howto-card-full' : 'howto-card'">
        <v-card-title class="text-h6">¿Cómo se juega? (detallado)</v-card-title>
        <v-card-text>
          <div class="howto-scroll">
          <ul style="margin:0; padding-left: 1.2rem; line-height:1.6;">
            <li><strong>Objetivo:</strong> responde correctamente <strong>15 preguntas</strong>. Si aciertas todas, ganas el juego.</li>
            <li><strong>Comodines (1 uso cada uno):</strong>
              <br>- <strong>50/50</strong>: elimina 2 respuestas incorrectas.
              <br>- <strong>Llamar a un amigo</strong>: sugiere una opción (puede no ser correcta).
              <br>- <strong>Preguntar al público</strong>: escanea el <strong>QR</strong> que aparece y deja que voten desde el celular.</li>
            <li><strong>Tiempo por pregunta:</strong>
              <br>- Niveles <strong>1–5</strong>: <em>sin límite</em> de tiempo.
              <br>- Niveles <strong>6–10</strong>: <strong>60 s</strong> por pregunta.
              <br>- Niveles <strong>11–15</strong>: <strong>120 s</strong> por pregunta.</li>
            <li><strong>Pausas:</strong> después de las preguntas <strong>5</strong> y <strong>10</strong> se muestra una pausa informativa. Pulsa <em>Iniciar</em> para continuar.</li>
            <li><strong>Puntuación y escalones seguros:</strong> los niveles <strong>5</strong> y <strong>10</strong> son seguros; si fallas más adelante, conservas ese puntaje.</li>
            <li><strong>Confirmación:</strong> elige una opción y pulsa <em>Confirmar</em>. Si el tiempo llega a cero, se considera <strong>incorrecta</strong>.</li>
            <li><strong>Ranking:</strong> al finalizar, guarda tu <strong>nombre</strong> y <strong>puntaje</strong> para aparecer en el ranking.</li>
          </ul>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" color="primary" @click="showHowTo = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2500">{{ snack.text }}</v-snackbar>
    <PrayerModal v-model="showPrayer" :text="prayerText" />
  </v-container>
</template>

<script setup>
 import { ref, reactive, computed } from 'vue';
import RankingPopup from '../components/RankingPopup.vue';
import PrayerModal from '../components/PrayerModal.vue';
import axios from 'axios';
 import { useDisplay } from 'vuetify';
const showRanking = ref(false);
const showHowTo = ref(false);
const showPrayer = ref(false);
const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);
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

<style scoped>
.howto-card { max-height: 80dvh; }
.howto-card-full { height: 100dvh; display: flex; flex-direction: column; }
.howto-card .v-card-text, .howto-card-full .v-card-text { padding-top: 8px; }
.howto-scroll { max-height: 60dvh; overflow: auto; padding-right: 6px; }
@media (max-width: 600px) {
  .howto-scroll { max-height: calc(100dvh - 140px); }
}
</style>
