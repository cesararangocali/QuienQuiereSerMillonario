// Composable para gestionar sonidos del juego con Web Audio API y fallback
import { ref } from 'vue'

const files = {
  intro: '/audio/intro.mp3',
  correct: '/audio/correct.mp3',
  wrong: '/audio/wrong.mp3',
  lifeline: '/audio/lifeline.mp3',
  suspense_loop: '/audio/suspense_loop.mp3',
  question: '/audio/question.mp3',
  final_answer: '/audio/final_answer.mp3',
  timer_tick: '/audio/timer_tick.mp3',
  victory: '/audio/victory.mp3'
}

const defaultVolumes = {
  intro: 0.5,
  correct: 0.9,
  wrong: 0.9,
  lifeline: 0.7,
  suspense_loop: 0.4,
  question: 0.6,
  final_answer: 0.8,
  timer_tick: 0.6,
  victory: 0.8
}

export function useGameSounds() {
  const enabled = ref(false)
  const isMuted = ref(false)
  const masterVolume = ref(1)
  const sounds = ref({}) // Fallback HTMLAudio

  // Web Audio API
  const audioCtx = ref(null)
  const masterGain = ref(null)
  const musicGain = ref(null)
  const fxGain = ref(null)
  const buffers = ref({})
  const playing = ref({}) // name -> { source, gain, category, loop }
  let fxDuckingUntil = 0

  const categories = {
    intro: 'music',
    suspense_loop: 'music',
    victory: 'music'
  }

  const applyVolumes = () => {
    const mv = Math.max(0, Math.min(1, masterVolume.value))
    if (masterGain.value) masterGain.value.gain.value = isMuted.value ? 0 : mv
    if (musicGain.value) musicGain.value.gain.value = 1
    if (fxGain.value) fxGain.value.gain.value = 1
    for (const [name, audio] of Object.entries(sounds.value)) {
      const base = defaultVolumes[name] ?? 0.7
      audio.volume = isMuted.value ? 0 : base * mv
    }
  }

  const ensureLoaded = () => {
    if (!Object.keys(sounds.value).length) {
      for (const [name, src] of Object.entries(files)) {
        const audio = new Audio(src)
        audio.preload = 'metadata'
        audio.loop = name === 'suspense_loop'
        const base = defaultVolumes[name] ?? 0.7
        audio.volume = isMuted.value ? 0 : base * masterVolume.value
        audio.onerror = () => {}
        sounds.value[name] = audio
      }
    }
  }

  const decodeAudioData = (arrayBuffer) => new Promise((resolve, reject) => {
    audioCtx.value.decodeAudioData(arrayBuffer, resolve, reject)
  })

  const preloadBuffers = async () => {
    if (!audioCtx.value) return
    const entries = Object.entries(files)
    await Promise.all(entries.map(async ([name, url]) => {
      if (buffers.value[name]) return
      try {
        const res = await fetch(url)
        const arr = await res.arrayBuffer()
        const buf = await decodeAudioData(arr)
        buffers.value[name] = buf
      } catch (_) {
        // fallback
      }
    }))
  }

  const enable = async () => {
    ensureLoaded()
    try {
      if (!audioCtx.value) {
        audioCtx.value = new (window.AudioContext || window.webkitAudioContext)()
        masterGain.value = audioCtx.value.createGain()
        musicGain.value = audioCtx.value.createGain()
        fxGain.value = audioCtx.value.createGain()
        musicGain.value.connect(masterGain.value)
        fxGain.value.connect(masterGain.value)
        masterGain.value.connect(audioCtx.value.destination)
        applyVolumes()
      }
      if (audioCtx.value.state === 'suspended') {
        await audioCtx.value.resume()
      }
      const silent = audioCtx.value.createBuffer(1, 1, audioCtx.value.sampleRate)
      const src = audioCtx.value.createBufferSource()
      src.buffer = silent
      src.connect(masterGain.value)
      src.start(0)
      enabled.value = true
      await preloadBuffers()
    } catch (_) {
      enabled.value = true
    }
  }

  const stop = (name) => {
    const item = playing.value[name]
    if (item && item.source) {
      try { item.source.stop() } catch {}
      try { item.source.disconnect() } catch {}
      try { item.gain.disconnect() } catch {}
    }
    delete playing.value[name]
    ensureLoaded()
    const a = sounds.value[name]
    if (a) { a.pause(); a.currentTime = 0 }
  }

  const fadeOut = (name, ms = 600) => {
    const item = playing.value[name]
    if (item && item.gain && audioCtx.value) {
      const g = item.gain.gain
      const now = audioCtx.value.currentTime
      try {
        g.cancelScheduledValues(now)
        g.setValueAtTime(g.value, now)
        g.linearRampToValueAtTime(0, now + ms / 1000)
        setTimeout(() => stop(name), ms)
      } catch { stop(name) }
      return
    }
    ensureLoaded()
    const a = sounds.value[name]
    if (!a) return
    const steps = 15
    const step = (a.volume) / steps
    let i = 0
    const id = setInterval(() => {
      i++
      a.volume = Math.max(0, a.volume - step)
      if (i >= steps) {
        clearInterval(id)
        a.pause(); a.currentTime = 0
        const base = defaultVolumes[name] ?? 0.7
        a.volume = isMuted.value ? 0 : base * masterVolume.value
      }
    }, ms / steps)
  }

  const stopAll = () => {
    Object.keys(playing.value).forEach(stop)
    ensureLoaded()
    Object.keys(sounds.value).forEach((n) => {
      const a = sounds.value[n]
      if (a) { a.pause(); a.currentTime = 0 }
    })
  }

  const play = async (name, { fadePrevious = true } = {}) => {
    ensureLoaded()
    if (!enabled.value) {
      await enable().catch(() => {})
    }
    if (fadePrevious) stopAll()
    if (audioCtx.value && buffers.value[name]) {
      const src = audioCtx.value.createBufferSource()
      src.buffer = buffers.value[name]
      const loop = name === 'suspense_loop'
      src.loop = loop
      const gain = audioCtx.value.createGain()
      const category = categories[name] || 'fx'
      const bus = category === 'music' ? musicGain.value : fxGain.value
      const baseVol = (defaultVolumes[name] ?? 0.7)
      if (name === 'suspense_loop') {
        gain.gain.setValueAtTime(0, audioCtx.value.currentTime)
        gain.gain.linearRampToValueAtTime(isMuted.value ? 0 : baseVol, audioCtx.value.currentTime + 0.6)
      } else {
        gain.gain.value = isMuted.value ? 0 : baseVol
      }
      src.connect(gain)
      gain.connect(bus)
      try { src.start(0) } catch {}
      playing.value[name] = { source: src, gain, category, loop }
      if (category === 'fx' && musicGain.value && audioCtx.value) {
        const now = Date.now()
        const durMs = Math.ceil((src.buffer?.duration ?? 0.4) * 1000) + 120
        fxDuckingUntil = Math.max(fxDuckingUntil, now + durMs)
        try {
          const ct = audioCtx.value.currentTime
          const mg = musicGain.value.gain
          mg.cancelScheduledValues(ct)
          mg.setValueAtTime(mg.value, ct)
          mg.linearRampToValueAtTime(0.6, ct + 0.05)
        } catch {}
        setTimeout(() => {
          if (Date.now() >= fxDuckingUntil && audioCtx.value) {
            try {
              const ct2 = audioCtx.value.currentTime
              const mg2 = musicGain.value.gain
              mg2.cancelScheduledValues(ct2)
              mg2.setValueAtTime(mg2.value, ct2)
              mg2.linearRampToValueAtTime(1, ct2 + 0.15)
            } catch {}
          }
        }, durMs)
      }
      if (!loop) src.onended = () => {
        if (playing.value[name]?.source === src) delete playing.value[name]
        try { src.disconnect(); gain.disconnect() } catch {}
      }
      return
    }
    const a = sounds.value[name]
    if (!a) return
    try { a.currentTime = 0; await a.play() } catch {}
  }

  const initializeSounds = () => ensureLoaded()
  const enableAudioContext = () => enable()
  const audioContextReady = enabled

  const playIntro = () => play('intro')
  const playCorrect = () => play('correct')
  const playWrong = () => play('wrong')
  const playLifeline = () => play('lifeline', { fadePrevious: false })
  const startSuspense = () => play('suspense_loop', { fadePrevious: false })
  const stopSuspense = () => fadeOut('suspense_loop', 800)
  const playQuestion = () => play('question', { fadePrevious: false })
  const playFinalAnswer = () => play('final_answer')
  const playTimerTick = () => play('timer_tick', { fadePrevious: false })
  const playVictory = () => play('victory')

  const toggleMute = () => { isMuted.value = !isMuted.value; applyVolumes() }
  const setMasterVolume = (v) => { masterVolume.value = Math.max(0, Math.min(1, Number(v))); applyVolumes() }

  return {
    enabled: audioContextReady,
    audioContextReady,
    isMuted,
    masterVolume,
    initializeSounds,
    enableAudioContext,
    play,
    stop,
    stopAll,
    fadeOut,
    toggleMute,
    setMasterVolume,
    playIntro,
    playCorrect,
    playWrong,
    playLifeline,
    startSuspense,
    stopSuspense,
    playQuestion,
    playFinalAnswer,
    playTimerTick,
    playVictory
  }
}

