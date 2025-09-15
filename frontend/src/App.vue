<template>
  <v-app>
  <v-navigation-drawer v-if="showBar" v-model="drawer" class="pt-10" temporary app>
      <v-list nav>
        <v-list-item prepend-icon="mdi-home" title="Inicio" to="/" />
        <v-list-item prepend-icon="mdi-play-circle" :title="$t('play')" to="/juego" />
        <v-list-item prepend-icon="mdi-book-open-page-variant" :title="$t('catechesis')" to="/catequesis" />
        <v-list-item prepend-icon="mdi-sword-cross" :title="$t('competitive')" to="/competitivo" />
        <v-list-item prepend-icon="mdi-shield-account" :title="$t('admin')" to="/admin" />
      </v-list>
    </v-navigation-drawer>

  <v-app-bar v-if="showBar" color="indigo-darken-4" elevation="4" app>
      <v-container class="d-flex align-center ga-2">
        <v-btn class="d-sm-none" icon="mdi-menu" @click="drawer = !drawer" />
        <v-app-bar-title class="font-weight-bold">{{ $t('appTitle') }}</v-app-bar-title>
        <v-spacer />
        <div class="d-none d-sm-flex ga-1">
          <v-btn to="/" variant="text" prepend-icon="mdi-home">Inicio</v-btn>
          <v-btn to="/juego" variant="text" prepend-icon="mdi-play-circle">{{ $t('play') }}</v-btn>
          <v-btn to="/catequesis" variant="text" prepend-icon="mdi-book-open-page-variant">{{ $t('catechesis') }}</v-btn>
          <v-btn to="/competitivo" variant="text" prepend-icon="mdi-sword-cross">{{ $t('competitive') }}</v-btn>
          <v-btn to="/admin" variant="text" prepend-icon="mdi-shield-account">{{ $t('admin') }}</v-btn>
        </div>
        <v-divider vertical class="mx-2 d-none d-sm-flex" />
        <v-btn icon="mdi-music" @click="toggleMusic" :color="playing ? 'yellow' : undefined" />
        <v-select :items="langs" v-model="lang" density="compact" variant="solo" style="width:110px" class="ml-2" />
      </v-container>
    </v-app-bar>

  <v-main class="pb-0">
      <router-view />
    </v-main>
    
    <!-- Footer elegante -->
    <v-footer v-if="showBar" class="qqss-footer">
      <v-container>
        <v-row align="center" justify="space-between" no-gutters>
          <v-col cols="12" md="4" class="text-center text-md-start">
            <div class="footer-brand">
              <v-icon class="mr-2 footer-icon">mdi-church</v-icon>
              <span class="footer-title">¿Quién quiere ser santo?</span>
            </div>
            <div class="footer-subtitle">Aprende, juega y crece en la fe</div>
          </v-col>
          
          <v-col cols="12" md="4" class="text-center my-3 my-md-0">
            <div class="footer-links">
              <v-btn variant="text" size="small" prepend-icon="mdi-heart" class="footer-link">
                Donaciones
              </v-btn>
              <v-btn variant="text" size="small" prepend-icon="mdi-help-circle" class="footer-link">
                Ayuda
              </v-btn>
              <v-btn variant="text" size="small" prepend-icon="mdi-email" class="footer-link">
                Contacto
              </v-btn>
            </div>
          </v-col>
          
          <v-col cols="12" md="4" class="text-center text-md-end">
            <div class="footer-social">
              <v-btn icon size="small" class="footer-social-btn">
                <v-icon>mdi-facebook</v-icon>
              </v-btn>
              <v-btn icon size="small" class="footer-social-btn">
                <v-icon>mdi-instagram</v-icon>
              </v-btn>
              <v-btn icon size="small" class="footer-social-btn">
                <v-icon>mdi-youtube</v-icon>
              </v-btn>
            </div>
            <div class="footer-copyright">
              © {{ currentYear }} KOLBE. Hecho con ❤️ para la fe
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
    
    <audio ref="audioRef" src="/audio/bg.mp3" loop preload="none"></audio>
  </v-app>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
const audioRef = ref();
const playing = ref(false);
const drawer = ref(false);
const langs = ['es','en'];
const lang = ref('es');
const { locale } = useI18n();
const route = useRoute();
const showBar = computed(() => !['/juego','/competitivo'].includes(route.path));
const currentYear = computed(() => new Date().getFullYear());

function toggleMusic(){
  const a = audioRef.value; if(!a) return;
  if (playing.value) { a.pause(); playing.value = false; }
  else { a.play().then(()=> playing.value = true).catch(()=>{}); }
}
watch(lang, (v)=> locale.value = v);
</script>
