<template>
  <div class="app-container">
    <Navbar 
      :current-song="currentSong"
      :user-profile="userProfile"
      :categories="categories"
      @search="handleSearch"
      @category-select="handleCategorySelect"
    />
    
    <div class="app-layout">
      <Sidebar
        :playlists="userPlaylists"
        :selected-playlist="selectedPlaylist"
        @playlist-select="selectPlaylist"
        @playlist-create="createPlaylist"
      />
      
      <MainContent
        :songs="displaySongs"
        :podcasts="displayPodcasts"
        :loading="loading"
        @play-item="playSong"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import MainContent from './components/MainContent.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Sidebar,
    MainContent
  },
  setup() {
    const loading = ref(true)
    const songs = ref([])
    const podcasts = ref([])
    const userPlaylists = ref([])
    const categories = ref([])
    const userProfile = ref(null)
    const currentSong = ref(null)
    const selectedPlaylist = ref(null)
    const searchQuery = ref('')

    const api = axios.create({
      baseURL: 'http://localhost:3000/api'
    })

    // Computed properties for filtering
    const displaySongs = computed(() => {
      if (!searchQuery.value) return songs.value
      return songs.value.filter(song =>
        song.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        song.artist?.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const displayPodcasts = computed(() => {
      if (!searchQuery.value) return podcasts.value
      return podcasts.value.filter(podcast =>
        podcast.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    // API calls
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/user')
        userProfile.value = response.data
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    const fetchSongs = async () => {
      try {
        const response = await api.get('/songs')
        songs.value = response.data
      } catch (error) {
        console.error('Error fetching songs:', error)
      }
    }

    const fetchPodcasts = async () => {
      try {
        const response = await api.get('/podcasts')
        podcasts.value = response.data
      } catch (error) {
        console.error('Error fetching podcasts:', error)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        categories.value = response.data
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    const fetchUserPlaylists = async () => {
      try {
        const userId = userProfile.value?.id || 1
        const response = await api.get(`/user/${userId}/playlists`)
        userPlaylists.value = response.data
      } catch (error) {
        console.error('Error fetching playlists:', error)
      }
    }

    const selectPlaylist = (playlist) => {
      selectedPlaylist.value = playlist
    }

    const createPlaylist = async (name) => {
      try {
        const response = await api.post('/playlists', {
          name,
          description: '',
          userId: userProfile.value?.id || 1
        })
        userPlaylists.value.push(response.data)
      } catch (error) {
        console.error('Error creating playlist:', error)
        alert('Failed to create playlist')
      }
    }

    const playSong = (item) => {
      currentSong.value = item
    }

    const handleSearch = (query) => {
      searchQuery.value = query
    }

    const handleCategorySelect = (category) => {
      console.log('Selected category:', category)
      // Can implement category-specific filtering here
      searchQuery.value = ''
    }

    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchSongs(),
          fetchPodcasts(),
          fetchCategories()
        ])
        // Fetch playlists after user is loaded
        await fetchUserPlaylists()
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      songs,
      podcasts,
      userPlaylists,
      categories,
      userProfile,
      currentSong,
      selectedPlaylist,
      displaySongs,
      displayPodcasts,
      selectPlaylist,
      createPlaylist,
      playSong,
      handleSearch,
      handleCategorySelect
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  background: #0f0f0f;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  height: 100%;
}

#app {
  height: 100vh;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0f0f0f;
}

.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #0f0f0f;
}
</style>
