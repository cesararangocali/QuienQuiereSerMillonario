import { defineStore } from 'pinia'

export const useLockStore = defineStore('lock', {
  state: () => ({ locked: false, reason: null, at: null, showModal: false }),
  actions: {
    setLocked(v, meta){ this.locked = !!v; this.reason = meta?.reason||null; this.at = meta?.at||null; this.showModal = !!v },
    open(){ this.showModal = true },
    close(){ if (!this.locked) this.showModal = false },
  }
})
