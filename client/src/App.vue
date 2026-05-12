<!-- client/src/App.vue -->
<template>
  <div class="app">
    <Sidebar
      :playlists="playlistsStore.playlists"
      :selectedPlaylist="selectedPlaylist"
      @playlist-select="selectPlaylist"
      @playlist-create="createPlaylist"
      :open="mobileMenu"
      @close="mobileMenu = false"
    />

    <div class="main" @click="mobileMenu = false">
      <header class="topbar">
        <button class="mobile-menu" @click.stop="mobileMenu = !mobileMenu">☰</button>

        <div class="top-title-and-search">
          <div class="app-title">My Music</div>

          <div class="top-search">
            <input
              v-model="searchQuery"
              @input="onInput"
              placeholder="Search songs, artists, genres..."
              class="top-search-input"
              autocomplete="off"
            />
            <button @click="goSearch" class="search-btn">Search</button>
          </div>
        </div>
      </header>

      <main class="content">
        <RouterView @play="play" />
      </main>
    </div>

    <PlayerBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import PlayerBar from './components/PlayerBar.vue'
import { usePlaylists } from './stores/playlists'

const router = useRouter()
const mobileMenu = ref(false)
const selectedPlaylist = ref(null)
const searchQuery = ref('')

const playlistsStore = usePlaylists()

// debounce helper
let debounceTimer = null
function onInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const q = (searchQuery.value || '').trim()
    router.replace({ path: '/search', query: q ? { q } : {} }).catch(() => {})
  }, 250)
}

function goSearch() {
  const q = (searchQuery.value || '').trim()
  router.push({ path: '/search', query: q ? { q } : {} }).catch(() => {})
}

function play(song) {
  // compatibility hook; player store handles playback
}

function selectPlaylist(pl) {
  selectedPlaylist.value = pl
  if (pl?.id) router.push(`/playlist/${pl.id}`)
}

async function createPlaylist(name) {
  try {
    const pl = await playlistsStore.create(name)
    // navigate to the new playlist page
    if (pl?.id) router.push(`/playlist/${pl.id}`)
  } catch (err) {
    // error already logged in store
  }
}

onMounted(async () => {
  await playlistsStore.load()
})
</script>

<style>
/* keep your existing styles */
:root{
  --bg-main:#121212;
  --bg-top:#101010;
  --spotify-green:#1db954;
  --text-main:#fff;
  --text-sub:#b3b3b3;
}
html,body,#app{ margin:0; height:100%; background:var(--bg-main); color:var(--text-main); font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto; }
.app{ display:grid; grid-template-columns: 240px 1fr; grid-template-rows: 1fr auto; min-height:100vh; background:var(--bg-main); }
.main{ display:flex; flex-direction:column; overflow:hidden; }
.topbar{ height:64px; display:flex; align-items:center; gap:12px; padding:0 20px; background:var(--bg-top) }
.top-title-and-search{ display:flex; align-items:center; gap:16px; width:100% }
.app-title{ font-weight:700; font-size:18px; color:var(--text-main) }
.top-search{ margin-left:auto; display:flex; gap:8px; align-items:center }
.top-search-input{ width:360px; max-width:60vw; border-radius:500px; border:none; padding:10px 16px; background:#242424; color:white; outline:none }
.search-btn{ background:var(--spotify-green); color:#000; border:none; padding:8px 12px; border-radius:8px; cursor:pointer }
.content{ flex:1; overflow:auto; padding:24px; padding-bottom:120px; }
.mobile-menu{ display:none; background:none; border:none; color:white; font-size:22px; }
@media (max-width:900px){
  .app{ grid-template-columns: 1fr; }
  .mobile-menu{ display:block; }
  .top-search-input{ width:60vw }
  .content{ padding-bottom:140px; }
}
</style>
