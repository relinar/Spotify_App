<template>
  <nav class="navbar">
    <div class="navbar-left">
      <div class="spotify-logo">
        <span class="logo-icon">🎵</span>
      </div>
      <button class="nav-button" title="Home">
        <span>🏠</span>
      </button>
      <div class="search-container">
        <input 
          type="text" 
          class="search-input" 
          placeholder="What do you want to play?"
          @input="$emit('search', $event.target.value)"
        />
      </div>
    </div>

    <div class="navbar-center">
      <div class="categories-dropdown">
        <button class="category-button" @click="showCategories = !showCategories" title="Look around">
          👀
        </button>
        <div v-if="showCategories" class="categories-menu">
          <div v-for="cat in categories" :key="cat.id" class="category-item" @click="selectCategory(cat)">
            {{ cat.name }}
          </div>
        </div>
      </div>
    </div>

    <div class="navbar-right">
      <div class="now-playing">
        <div v-if="currentSong" class="playing-info">
          <img :src="currentSong.image" :alt="currentSong.title" />
          <div class="song-details">
            <p class="song-title">{{ currentSong.title }}</p>
            <p class="song-artist">{{ currentSong.artist?.name }}</p>
          </div>
        </div>
      </div>

      <div class="user-actions">
        <button class="icon-button" title="Notifications">
          🔔
        </button>
        <button class="icon-button" title="Friends">
          👥
        </button>
        <button class="profile-button">
          <img v-if="userProfile?.avatar" :src="userProfile.avatar" :alt="userProfile.name" />
          <span v-else>👤</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Navbar',
  props: {
    currentSong: Object,
    userProfile: Object,
    categories: Array
  },
  emits: ['search', 'category-select'],
  setup(props, { emit }) {
    const showCategories = ref(false)

    const selectCategory = (category) => {
      emit('category-select', category)
      showCategories.value = false
    }

    return {
      showCategories,
      selectCategory
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #1a1a1a, #282828);
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #333;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 0 0 auto;
}

.spotify-logo {
  font-size: 1.5rem;
  cursor: pointer;
}

.logo-icon {
  color: #1db954;
}

.nav-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.search-container {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: #1db954;
}

.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.categories-dropdown {
  position: relative;
}

.category-button {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.category-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.categories-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #282828;
  border: 1px solid #333;
  border-radius: 8px;
  min-width: 150px;
  margin-top: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.category-item {
  padding: 0.75rem 1rem;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.category-item:hover {
  background: rgba(29, 185, 84, 0.2);
  color: #1db954;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 0 0 auto;
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  min-width: 200px;
}

.playing-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.playing-info img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 0.85rem;
  color: white;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.icon-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.profile-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: background 0.2s;
}

.profile-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.profile-button img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
</style>
