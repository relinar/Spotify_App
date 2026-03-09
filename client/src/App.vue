<template>
  <div class="app">
    <Sidebar
      :playlists="playlists"
      :selectedPlaylist="selectedPlaylist"
      @playlist-select="selectPlaylist"
      @playlist-create="createPlaylist"
      :open="mobileMenu"
      @close="mobileMenu = false"
    />

    <div class="main" @click="mobileMenu=false">
      <header class="topbar">
        <button class="mobile-menu" @click.stop="mobileMenu = !mobileMenu">☰</button>
        <input class="search" placeholder="Search playlists, songs, podcasts..." />
      </header>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="{ active: activeTab === tab }"
        >
          {{ tab }}
        </button>
      </div>

    <main class="content">
  <div v-if="activeTab === 'All'" class="placeholder">
    <p>Songs and podcasts will be shown here</p>
  </div>

  <div v-if="activeTab === 'Music'" class="placeholder">
    <p>No songs yet</p>
  </div>

  <div v-if="activeTab === 'Podcasts'" class="placeholder">
    <p>No podcasts yet</p>
  </div>
</main>
    </div>

    <PlayerBar :song="currentSong" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import HomeView from './views/HomeView.vue'
import SongsView from './views/SongsView.vue'
import PlaylistView from './views/PlaylistView.vue'
import PlayerBar from './components/PlayerBar.vue'
import { api } from './api'

const currentSong = ref(null)
const mobileMenu = ref(false)
const playlists = ref([])
const selectedPlaylist = ref(null)
const tabs = ['All', 'Music', 'Podcasts']
const activeTab = ref('All')

function play(song) {
  currentSong.value = song
}

function selectPlaylist(pl) {
  selectedPlaylist.value = pl
}

function createPlaylist(name) {
  playlists.value.push({ id: Date.now(), name, songs: [] })
}

onMounted(async () => {
  const res = await api.get('/playlists')
  playlists.value = res.data
})
</script>

<style>
:root{
  --bg-main:#121212;
  --bg-sidebar:#000000;
  --bg-card:#181818;
  --bg-card-hover:#282828;
  --bg-top:#101010;
  --text-main:#ffffff;
  --text-sub:#b3b3b3;
  --spotify-green:#1db954;
}

html,body,#app{
  margin:0;
  height:100%;
  background:var(--bg-main);
  font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto;
}

.app{
  display:grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 1fr 90px;
  height:100vh;
}

.main{
  display:flex;
  flex-direction:column;
  overflow:hidden;
}

.topbar{
  height:64px;
  display:flex;
  align-items:center;
  gap:12px;
  padding:0 20px;
  background:var(--bg-top);
}

.search{
  width:360px;
  max-width:100%;
  border-radius:500px;
  border:none;
  padding:10px 16px;
  background:#242424;
  color:white;
  outline:none;
}

.tabs{
  display:flex;
  gap:16px;
  padding:12px 20px;
  background:#181818;
  justify-content:flex-start;
}

.tabs button{
  background:none;
  border:none;
  color:var(--text-sub);
  font-size:14px;
  cursor:pointer;
  padding:6px 12px;
  border-radius:4px;
}

.tabs button.active{
  color:white;
  background:#1db954;
}

.content{
  flex:1;
  overflow:auto;
  padding:24px;
}

.mobile-menu{
  display:none;
  background:none;
  border:none;
  color:white;
  font-size:22px;
}

@media (max-width:900px){
  .app{
    grid-template-columns: 1fr;
  }
  .mobile-menu{
    display:block;
  }
}
</style>