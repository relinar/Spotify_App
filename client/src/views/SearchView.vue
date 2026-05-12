<template>
  <div class="search-page">
    <section class="search-results">
      <div class="search-header">
        <h2>Search</h2>
        <div class="query-info" v-if="q">Results for “{{ q }}”</div>
      </div>

      <div class="suggestions" v-if="q && suggestions.length">
        <div class="suggest-title">Suggestions</div>
        <ul>
          <li v-for="s in suggestions" :key="s.id" class="suggest-item">
            <div class="left">
              <div class="title">{{ s.title }}</div>
              <div class="artist">{{ s.artist?.name }}</div>
            </div>
            <div class="right">
              <button class="play" @click="play(s)">{{ player.current?.id === s.id && player.playing ? '⏸' : '▶' }}</button>
              <button
                :class="['btn-like', { liked: isLiked(s) }]"
                @click="toggleLike(s)"
                :aria-pressed="isLiked(s)"
                :title="isLiked(s) ? 'Unlike' : 'Like'"
              >
                {{ isLiked(s) ? '♥' : '♡' }}
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div class="full-results" v-if="!loading && (results.songs.length || results.artists.length)">
        <h3>Songs</h3>
        <ul class="song-results">
          <li v-for="s in results.songs" :key="s.id" class="song-item">
            <div class="left">
              <div class="title">{{ s.title }}</div>
              <div class="artist">{{ s.artist?.name }}</div>
            </div>
            <div class="right">
              <button class="play" @click="play(s)">{{ player.current?.id === s.id && player.playing ? '⏸' : '▶' }}</button>
              <button
                :class="['btn-like', { liked: isLiked(s) }]"
                @click="toggleLike(s)"
                :aria-pressed="isLiked(s)"
                :title="isLiked(s) ? 'Unlike' : 'Like'"
              >
                {{ isLiked(s) ? '♥' : '♡' }}
              </button>
            </div>
          </li>
        </ul>

        <h3>Artists</h3>
        <ul class="artist-results">
          <li v-for="a in results.artists" :key="a.id">
            <router-link :to="`/artist/${a.id}`">{{ a.name }}</router-link>
          </li>
        </ul>
      </div>

      <div v-if="!q" class="empty-hint">Type a letter in the top search bar to get suggestions instantly.</div>
      <div v-if="!loading && q && !results.songs.length && !results.artists.length" class="no-results">No results</div>
      <div v-if="loading" class="loading">Searching…</div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'
import { usePlayer } from '../stores/player'

const route = useRoute()
const q = ref(route.query.q || '')
const loading = ref(false)
const results = ref({ songs: [], artists: [] })
const suggestions = ref([])
const player = usePlayer()
const likedIds = ref(new Set())

let inflight = 0
let debounceTimer = null

async function fetchSearch(query) {
  if (!query) {
    results.value = { songs: [], artists: [] }
    suggestions.value = []
    return
  }
  loading.value = true
  const thisReq = ++inflight
  try {
    const r = await api.get('/search', { params: { q: query } })
    if (thisReq !== inflight) return
    const data = r.data || { songs: [], artists: [] }
    results.value = data
    suggestions.value = (data.songs || []).slice(0, 6)
    const lib = await api.get('/user/library')
    const liked = (lib.data.playlists || []).find(p => p.name === 'Liked Songs')
    likedIds.value = new Set((liked?.songs || []).map(s => s.id))
  } catch (err) {
    console.error('Search failed', err)
    results.value = { songs: [], artists: [] }
    suggestions.value = []
  } finally {
    if (thisReq === inflight) loading.value = false
  }
}

function doSearchImmediate(query) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchSearch(query), 120)
}

watch(
  () => route.query.q,
  (newQ) => {
    q.value = newQ || ''
    doSearchImmediate(q.value)
  },
  { immediate: true }
)

onMounted(() => {
  const initial = route.query.q
  if (initial) doSearchImmediate(initial)
})

function play(song) {
  player.play(song)
}

async function toggleLike(song) {
  try {
    await api.post(`/like/${song.id}`)
    const lib = await api.get('/user/library')
    const liked = (lib.data.playlists || []).find(p => p.name === 'Liked Songs')
    likedIds.value = new Set((liked?.songs || []).map(s => s.id))
  } catch (err) {
    console.error('Like toggle failed', err)
  }
}

function isLiked(song) {
  return likedIds.value.has(song.id)
}
</script>

<style scoped>
.search-header{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px }
.query-info{ color:var(--text-sub) }

.suggestions{ margin-bottom:12px }
.suggest-title{ color:var(--text-sub); margin-bottom:6px }
.suggest-item{ display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.03) }
.left .title{ font-weight:600 }
.left .artist{ color:var(--text-sub); font-size:13px }

.song-results, .suggestions ul { list-style:none; padding:0; margin:0 }
.song-item, .suggest-item{ display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.03) }
.artist-results li{ padding:6px 0 }

.empty-hint{ color:var(--text-sub); padding:12px 0 }
.no-results{ color:#ff6b6b; padding:12px 0 }
.loading{ color:var(--text-sub); padding:12px 0 }

/* Green play button (same look as playlist view) */
.play{
  background:var(--spotify-green);
  border:none;
  padding:6px 10px;
  border-radius:6px;
  cursor:pointer;
  color:#000;
  font-weight:700;
  min-width:44px;
}

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
.btn-like.liked{
  background:var(--spotify-green);
  color:#000;
  border:none;
}
</style>
