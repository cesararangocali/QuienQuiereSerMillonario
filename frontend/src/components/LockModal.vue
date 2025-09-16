<template>
  <v-dialog v-model="visible" persistent max-width="560">
    <v-card class="qqss-ring text-center" elevation="16">
      <v-card-text class="pa-8">
        <v-icon size="80" color="warning" class="mb-3">mdi-shield-lock</v-icon>
        <h2 class="text-h5 font-weight-bold mb-2">Sitio bloqueado por jornada</h2>
        <p class="text-body-2 mb-4">En este momento el sitio está reservado para una presentación pública. Vuelve más tarde.</p>
        <div v-if="reason" class="text-caption text-medium-emphasis">{{ reason }}</div>
        <div class="hidden-admin-trigger" @click="goLogin" title="Acceso administrador" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLockStore } from '../store/lock'

const router = useRouter()
const lock = useLockStore()
const visible = computed({ get:()=>lock.showModal, set:()=>{} })
const reason = computed(()=>lock.reason)

function goLogin(){ router.push('/admin') }

window.addEventListener('keydown', (e)=>{
  if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key==='a' || e.key==='A')) {
    goLogin()
  }
})
</script>

<style scoped>
.hidden-admin-trigger { position: fixed; right: 10px; bottom: calc(10px + env(safe-area-inset-bottom)); width: 18px; height: 18px; opacity: 0.12; border-radius: 50%; background: var(--v-theme-warning); cursor: pointer; }
.hidden-admin-trigger:hover { opacity: 0.3 }
</style>
