<template>
  <div class="playlist-page">
    <header class="playlist-header">
      <h1>{{ playlist?.name || 'Playlist' }}</h1>
      <p class="desc">{{ playlist?.description }}</p>
    </header>

    <section v-if="loading" class="loading">Loading…</section>

    <section v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
    </section>

    <section v-else class="songs-list">
      <table class="song-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Duration</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(song, i) in playlist.songs" :key="song.id" :class="{ playing: currentSong?.id === song.id }">
            <td>{{ i + 1 }}</td>
            <td class="title">{{ song.title }}</td>
            <td>{{ song.artist?.name || 'Unknown' }}</td>
            <td>{{ formatDuration(song.duration) }}</td>
            <td class="actions">
              <button class="play" @click="playSong(song)">{{ currentSong?.id === song.id && isPlaying ? '⏸' : '▶' }}</button>
              <button
                :class="['btn-like', { liked: isLiked(song) }]"
                @click="likeSong(song)"
                :aria-pressed="isLiked(song)"
                :title="isLiked(song) ? 'Unlike' : 'Like'"
              >
                {{ isLiked(song) ? '♥' : '♡' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'
import { usePlayer } from '../stores/player'

const route = useRoute()
const playlist = ref(null)
const loading = ref(true)
const error = ref(null)

const player = usePlayer()
const currentSong = computed(() => player.current)
const isPlaying = computed(() => player.playing)

const likedIds = ref(new Set())

function formatDuration(sec) {
  if (!sec) return '0:00'
  const s = Math.floor(sec)
  const m = Math.floor(s / 60)
  const r = String(s % 60).padStart(2, '0')
  return `${m}:${r}`
}

async function load(id) {
  loading.value = true
  error.value = null
  try {
    const r = await api.get(`/playlists/${id}`)
    playlist.value = r.data
    const lib = await api.get('/user/library')
    const liked = (lib.data.playlists || []).find(p => p.name === 'Liked Songs')
    likedIds.value = new Set((liked?.songs || []).map(s => s.id))
  } catch (err) {
    console.error('Failed to load playlist', err)
    error.value = err.response?.data?.error || err.message || 'Failed to load playlist'
  } finally {
    loading.value = false
  }
}

function playSong(song) {
  player.play(song)
}

async function likeSong(song) {
  try {
    const r = await api.post(`/like/${song.id}`)
    const likedPl = r.data.likedPlaylist
    likedIds.value = new Set((likedPl?.songs || []).map(s => s.id))
  } catch (err) {
    console.error('Like failed', err)
  }
}

function isLiked(song) {
  return likedIds.value.has(song.id)
}

onMounted(() => {
  const id = Number(route.params.id)
  if (id) load(id)
})

watch(
  () => route.params.id,
  (newId) => {
    const id = Number(newId)
    if (id) load(id)
  }
)
</script>

<style scoped>
.playlist-header { margin-bottom: 18px }
.song-table { width:100%; border-collapse:collapse }
.song-table th, .song-table td { padding:8px 10px; text-align:left }
.play { background:var(--spotify-green); border:none; padding:6px 10px; border-radius:6px; cursor:pointer; margin-right:6px }
.playing { background: rgba(29,185,84,0.06) }
.title { max-width: 420px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
.error { color: #ff6b6b; padding:12px; background: rgba(255,107,107,0.06); border-radius:6px }
.actions{ display:flex; gap:6px; align-items:center }

/* Like button styles */
.btn-like{
  background:transparent;
  border:1px solid rgba(255,255,255,0.06);
  color:#fff;
  padding:6px 8px;
  border-radius:6px;
  cursor:pointer;
  font-weight:600;
  min-width:44px;
  text-align:center;
}

/* When liked, show filled green style */
.btn-like.liked{
  background:var(--spotify-green);
  color:#000;
  border:none;
}
</style>
