<template>
  <transition name="flash-success">
    <div v-if="state==='correct'" class="anim success">¡Bien hecho!</div>
  </transition>
  <transition name="flash-error">
    <div v-if="state==='wrong'" class="anim error">Sigue caminando en la fe</div>
  </transition>
</template>
<script setup>
defineProps({ state: String });
</script>
<style>
.anim { position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; font-size: 2rem; font-weight: 700; pointer-events:none; }
.anim.success { color: #2e7d32; }
.anim.error { color: #c62828; }
.flash-success-enter-active, .flash-success-leave-active { transition: opacity .5s; }
.flash-success-enter-from, .flash-success-leave-to { opacity: 0; }
.flash-error-enter-active, .flash-error-leave-active { transition: opacity .5s; }
.flash-error-enter-from, .flash-error-leave-to { opacity: 0; }
</style>