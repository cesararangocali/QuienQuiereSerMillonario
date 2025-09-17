<template>
  <v-app>
    <LockModal />

    <v-main class="pb-0">
      <router-view />
    </v-main>

  <v-footer class="qqss-footer">
      <v-container>
        <v-row align="center" justify="space-between" no-gutters>
          <v-col cols="12" md="4" class="text-center text-md-start">
            <div class="footer-brand" @click="onSecretClick" title="">
              <v-icon class="mr-2 footer-icon">mdi-church</v-icon>
              <span class="footer-title">¿Quién quiere ser santo?</span>
            </div>
            <div class="footer-subtitle">Aprende, juega y crece en la fe</div>
          </v-col>

          <v-col cols="12" md="4" class="text-center my-3 my-md-0">
            <div class="footer-links">
              <v-btn variant="text" size="small" prepend-icon="mdi-home" class="footer-link" to="/">
                Inicio
              </v-btn>
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
              © {{ currentYear }} César Arango. Hecho con ❤️ para LAM
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>

    <audio ref="audioRef" src="/audio/bg.mp3" loop preload="none"></audio>
  </v-app>
  
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { createSocket } from './utils/socket'
import LockModal from './components/LockModal.vue'
import { useLockStore } from './store/lock'

// Sockets y bloqueo global
const lock = useLockStore()
const ioClient = createSocket()
ioClient.on('force-logout', (p)=>{ lock.setLocked(true, { reason: p?.reason }) })
ioClient.on('lock-status', (meta)=>{ lock.setLocked(!!meta?.locked, meta) })

// Footer y utilidades
const audioRef = ref()
const playing = ref(false)
const langs = ['es','en']
const lang = ref('es')
const { locale } = useI18n()
const route = useRoute()
const router = useRouter()
const currentYear = computed(() => new Date().getFullYear())

// Acceso oculto al panel de administración: 5 clics en 6s
const secretClicks = ref(0)
let secretTimer = null
function onSecretClick(){
  if (secretClicks.value === 0) {
    secretTimer = setTimeout(() => { secretClicks.value = 0 }, 6000)
  }
  secretClicks.value += 1
  if (secretClicks.value >= 5) {
    if (secretTimer) { clearTimeout(secretTimer); secretTimer = null }
    secretClicks.value = 0
    router.push('/admin')
  }
}

function toggleMusic(){
  const a = audioRef.value; if(!a) return
  if (playing.value) { a.pause(); playing.value = false }
  else { a.play().then(()=> playing.value = true).catch(()=>{}) }
}

watch(lang, (v)=> locale.value = v)
</script>
