// client/src/stores/player.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayer = defineStore('player', () => {
  const current = ref(null)
  const audio = ref(null)
  const playing = ref(false)

  function ensureAudio() {
    if (!audio.value) {
      audio.value = new Audio()
      audio.value.addEventListener('play', () => (playing.value = true))
      audio.value.addEventListener('pause', () => (playing.value = false))
      audio.value.addEventListener('ended', () => (playing.value = false))
      audio.value.addEventListener('error', (e) => {
        console.error('Audio element error', e)
      })
    }
  }

  async function play(song) {
    ensureAudio()
    if (!song) return
    if (current.value?.id === song.id) {
      if (audio.value.paused) await audio.value.play()
      else audio.value.pause()
      return
    }
    current.value = song
    audio.value.src = song.audioPath || song.url || ''
    audio.value.currentTime = 0
    try {
      await audio.value.play()
    } catch (err) {
      console.error('Failed to play audio', err)
      throw err
    }
  }

  function pause() { if (audio.value) audio.value.pause() }
  function setTime(t) { if (audio.value) audio.value.currentTime = t }
  function setVolume(v) { if (audio.value) audio.value.volume = v }

  return { current, audio, playing, play, pause, setTime, setVolume }
})
