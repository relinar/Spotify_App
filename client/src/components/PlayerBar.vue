<!-- client/src/components/PlayerBar.vue -->
<template>
  <div class="player-bar" v-if="player.current">
    <div class="left">
      <img :src="player.current.image || '/spotifylogo.png'" class="cover" />
      <div class="meta">
        <div class="title">{{ player.current.title }}</div>
        <div class="artist">{{ player.current.artist?.name }}</div>
      </div>
    </div>

    <div class="controls">
      <button @click="togglePlay" class="control-btn">{{ player.playing ? '⏸' : '▶' }}</button>
      <div class="progress">
        <input type="range" min="0" :max="duration" step="0.1" v-model="pos" @change="seek" />
        <div class="times">{{ formatTime(pos) }} / {{ formatTime(duration) }}</div>
      </div>
    </div>

    <div class="right">
      <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="setVolume" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayer } from '../stores/player'

const player = usePlayer()
const pos = ref(0)
const duration = ref(0)
const volume = ref(1)

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const r = String(Math.floor(s % 60)).padStart(2, '0')
  return `${m}:${r}`
}

function togglePlay() {
  if (!player.current) return
  player.play(player.current)
}

function seek() {
  player.setTime(Number(pos.value))
}

function setVolume() {
  player.setVolume(Number(volume.value))
}

let raf = null
function update() {
  const a = player.audio
  if (a) {
    pos.value = a.currentTime || 0
    duration.value = a.duration || 0
  }
  raf = requestAnimationFrame(update)
}

onMounted(() => {
  if (player.audio) player.audio.volume = volume.value
  raf = requestAnimationFrame(update)
})
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<style scoped>
/* container allows clicks to pass through except interactive controls */
.player-bar{
  position:fixed;
  left:0;
  right:0;
  bottom:0;
  height:72px;
  background:#121212;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:8px 16px;
  gap:12px;
  z-index:9999;
  box-shadow: 0 -6px 20px rgba(0,0,0,0.6);
  pointer-events: none; /* allow clicks to pass through the bar except its children */
}
.cover{width:56px;height:56px;object-fit:cover;border-radius:6px}
.meta{margin-left:12px}
.title{font-weight:600}
.artist{color:var(--text-sub)}
.controls{display:flex;flex-direction:column;align-items:center;gap:6px}

/* enable pointer events only for interactive elements */
.player-bar button,
.player-bar input,
.player-bar a { pointer-events: auto; }

.control-btn{background:var(--spotify-green);border:none;padding:8px 12px;border-radius:6px;color:#000;cursor:pointer}
.progress input[type="range"]{width:360px}
</style>
