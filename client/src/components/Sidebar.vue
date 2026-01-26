<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3>Your Library</h3>
    </div>

    <div class="playlists-container">
      <div class="playlists-header">
        <h4>Playlists</h4>
        <button class="add-playlist-btn" @click="showAddPlaylist = !showAddPlaylist" title="Create playlist">
          ➕
        </button>
      </div>

      <!-- Add Playlist Form -->
      <div v-if="showAddPlaylist" class="add-playlist-form">
        <input 
          v-model="newPlaylistName"
          type="text"
          placeholder="Playlist name"
          class="playlist-input"
        />
        <button @click="createPlaylist" class="create-btn">Create</button>
        <button @click="showAddPlaylist = false" class="cancel-btn">Cancel</button>
      </div>

      <!-- Playlists List -->
      <div v-if="playlists.length > 0" class="playlists-list">
        <div 
          v-for="playlist in playlists"
          :key="playlist.id"
          class="playlist-item"
          :class="{ active: selectedPlaylist?.id === playlist.id }"
          @click="selectPlaylist(playlist)"
        >
          <span class="playlist-icon">📋</span>
          <span class="playlist-name">{{ playlist.name }}</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>No playlists yet</p>
        <p class="empty-hint">Create one to get started!</p>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Sidebar',
  props: {
    playlists: Array,
    selectedPlaylist: Object
  },
  emits: ['playlist-select', 'playlist-create'],
  setup(props, { emit }) {
    const showAddPlaylist = ref(false)
    const newPlaylistName = ref('')

    const selectPlaylist = (playlist) => {
      emit('playlist-select', playlist)
    }

    const createPlaylist = () => {
      if (newPlaylistName.value.trim()) {
        emit('playlist-create', newPlaylistName.value)
        newPlaylistName.value = ''
        showAddPlaylist.value = false
      }
    }

    return {
      showAddPlaylist,
      newPlaylistName,
      selectPlaylist,
      createPlaylist
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #121212;
  border-right: 1px solid #282828;
  padding: 1rem;
  height: calc(100vh - 70px);
  overflow-y: auto;
  position: sticky;
  top: 70px;
}

.sidebar-header {
  margin-bottom: 1.5rem;
}

.sidebar-header h3 {
  color: white;
  font-size: 1.1rem;
  margin: 0;
  padding: 0.5rem 0;
}

.playlists-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.playlists-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.playlists-header h4 {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0;
}

.add-playlist-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.add-playlist-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.add-playlist-form {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.playlist-input {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 0.9rem;
}

.playlist-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.playlist-input:focus {
  outline: none;
  border-color: #1db954;
  background: rgba(255, 255, 255, 0.15);
}

.create-btn,
.cancel-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.create-btn {
  background: #1db954;
  color: white;
}

.create-btn:hover {
  background: #1ed760;
}

.cancel-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.4);
}

.playlists-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.7);
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.playlist-item.active {
  background: rgba(29, 185, 84, 0.3);
  color: #1db954;
  border-left: 3px solid #1db954;
  padding-left: calc(0.75rem - 3px);
}

.playlist-icon {
  font-size: 1rem;
}

.playlist-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-hint {
  font-size: 0.85rem;
}

/* Scrollbar styling */
.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
