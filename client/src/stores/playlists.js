// client/src/stores/playlists.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api'

export const usePlaylists = defineStore('playlists', () => {
  const playlists = ref([])
  const loading = ref(false)

  /**
   * Load all playlists from the server and populate the store.
   */
  async function load() {
    loading.value = true
    try {
      const r = await api.get('/playlists')
      playlists.value = Array.isArray(r.data) ? r.data : []
    } catch (err) {
      console.error('[playlists.load] Failed to load playlists', err)
      playlists.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new playlist on the server and add it to the store.
   * Returns the created playlist object.
   */
  async function create(name, description = '') {
    if (!name || !name.trim()) throw new Error('Playlist name required')
    try {
      const r = await api.post('/playlists', { name: name.trim(), description })
      // server returns created playlist
      const created = r.data
      if (created) playlists.value.push(created)
      return created
    } catch (err) {
      console.error('[playlists.create] Create playlist failed', err)
      throw err
    }
  }

  /**
   * Add a song to a playlist. Updates the store with the returned playlist.
   * Returns the updated playlist object.
   */
  async function addSong(playlistId, songId) {
    try {
      const r = await api.post(`/playlists/${playlistId}/add-song`, { songId: Number(songId) })
      const updated = r.data
      if (!updated) throw new Error('No playlist returned from server')
      const idx = playlists.value.findIndex(p => p.id === updated.id || p.id === Number(playlistId))
      if (idx !== -1) playlists.value[idx] = updated
      else playlists.value.push(updated)
      return updated
    } catch (err) {
      console.error('[playlists.addSong] Add song to playlist failed', err)
      throw err
    }
  }

  /**
   * Refresh a single playlist from the server and update the store.
   */
  async function refreshPlaylist(playlistId) {
    try {
      const r = await api.get(`/playlists/${playlistId}`)
      const updated = r.data
      if (!updated) throw new Error('No playlist returned from server')
      const idx = playlists.value.findIndex(p => p.id === Number(playlistId))
      if (idx !== -1) playlists.value[idx] = updated
      else playlists.value.push(updated)
      return updated
    } catch (err) {
      console.error('[playlists.refreshPlaylist] Refresh playlist failed', err)
      throw err
    }
  }

  /**
   * Remove a playlist locally (does not call server).
   */
  function removeLocal(playlistId) {
    playlists.value = playlists.value.filter(p => p.id !== Number(playlistId))
  }

  return { playlists, loading, load, create, addSong, refreshPlaylist, removeLocal }
})
