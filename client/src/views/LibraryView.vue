<template>
  <div class="library-page">
    <header class="library-header">
      <h1>Your Library</h1>
      <div class="create">
        <input v-model="newName" placeholder="New playlist name" />
        <button class="btn-green" @click="createPlaylist">Create</button>
      </div>
    </header>

    <section class="playlists">
      <h2>Playlists</h2>
      <div v-if="playlistsStore.loading">Loading…</div>
      <div v-else>
        <div v-if="playlistsStore.playlists.length === 0">No playlists yet.</div>
        <ul class="pl-list">
          <li v-for="pl in playlistsStore.playlists" :key="pl.id" class="pl-item">
            <!-- Use the same visual style as Sidebar: playlist-card -->
            <router-link :to="`/playlist/${pl.id}`" class="playlist-card">
              {{ pl.name }}
            </router-link>

            <div class="pl-actions">
              <button class="btn-green" @click="selectPlaylist(pl)">Open</button>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="add-songs" v-if="selectedPlaylist">
      <h2>Add songs to "{{ selectedPlaylist.name }}"</h2>
      <div class="add-controls">
        <select v-model="selectedSongId">
          <option value="">Select a song</option>
          <option v-for="s in allSongs" :key="s.id" :value="s.id">{{ s.title }} — {{ s.artist?.name }}</option>
        </select>
        <button class="btn-green" @click="addSongToPlaylist" :disabled="!selectedSongId">Add</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePlaylists } from '../stores/playlists'
import { api } from '../api'
import { useRouter } from 'vue-router'

const playlistsStore = usePlaylists()
const allSongs = ref([])
const newName = ref('')
const selectedPlaylist = ref(null)
const selectedSongId = ref('')
const router = useRouter()

async function loadAllSongs() {
  try {
    const sres = await api.get('/songs')
    allSongs.value = sres.data || []
  } catch (err) {
    allSongs.value = []
  }
}

async function createPlaylist() {
  const name = (newName.value || '').trim()
  if (!name) return
  try {
    const pl = await playlistsStore.create(name)
    newName.value = ''
    if (pl?.id) {
      router.push(`/playlist/${pl.id}`)
      selectedPlaylist.value = pl
    }
  } catch (err) {
    console.error('Create playlist failed', err)
  }
}

function selectPlaylist(pl) {
  selectedPlaylist.value = pl
  selectedSongId.value = ''
}

async function addSongToPlaylist() {
  if (!selectedPlaylist.value || !selectedSongId.value) return
  try {
    const updated = await playlistsStore.addSong(selectedPlaylist.value.id, selectedSongId.value)
    selectedPlaylist.value = updated
    selectedSongId.value = ''
  } catch (err) {
    console.error('Add song failed', err)
  }
}

onMounted(async () => {
  if (!playlistsStore.playlists.length) await playlistsStore.load()
  await loadAllSongs()
})
</script>

<style scoped>
.library-header{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px }
.create input{ padding:8px; border-radius:6px; border:none; background:#242424; color:#fff; margin-right:8px }

.pl-list{ list-style:none; padding:0; margin:0 }
.pl-item{ display:flex; align-items:center; justify-content:space-between; padding:6px 0; }

/* Match Sidebar playlist look */
.playlist-card{
  display:block;
  padding:8px 10px;
  border-radius:6px;
  color:var(--text-sub);
  text-decoration:none;
  background:transparent;
  transition: background .12s ease, color .12s ease;
  width:100%;
  box-sizing:border-box;
}

/* Remove default link underline and ensure consistent font */
.playlist-card:link,
.playlist-card:visited,
.playlist-card:hover,
.playlist-card:active{
  text-decoration:none;
  color:var(--text-sub);
}

/* Hover/focus state like sidebar */
.playlist-card:hover,
.playlist-card:focus{
  background:#111;
  color:var(--text-main);
}

/* Keep spacing between name and actions */
.pl-actions{ margin-left:12px; display:flex; gap:8px; align-items:center }

/* Green primary button used across the app */
.btn-green{
  background:var(--spotify-green);
  color:#000;
  border:none;
  padding:8px 12px;
  border-radius:6px;
  cursor:pointer;
  font-weight:600;
}

/* Disabled state */
.btn-green:disabled{
  opacity:0.6;
  cursor:not-allowed;
}

/* Add-songs controls */
.add-controls{ display:flex; gap:8px; align-items:center; margin-top:8px }
.add-controls select{ padding:8px; border-radius:6px; background:#242424; color:#fff; border:none }
</style>
