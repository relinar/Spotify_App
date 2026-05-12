<!-- client/src/views/HomeView.vue -->
<template>
  <div class="home">
    <section class="recommended">
      <h2>Recommended for you</h2>
      <div class="rec-grid">
        <div v-for="r in recommended" :key="r.id" class="rec-card" @click="openPlaylist(r.id)">
          <img :src="r.cover || '/spotifylogo.png'" alt="" />
          <div class="meta">
            <div class="name">{{ r.name }}</div>
            <div class="sub">{{ r.description || 'Playlist' }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="your-playlists">
      <h2>Your Playlists</h2>
      <div class="pl-grid">
        <div v-for="p in playlists" :key="p.id" class="pl-card" @click="openPlaylist(p.id)">
          <div class="name">{{ p.name }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'

const router = useRouter()
const recommended = ref([])
const playlists = ref([])

function openPlaylist(id) { router.push(`/playlist/${id}`) }

onMounted(async () => {
  try {
    // prefer dedicated recommended endpoint if available
    const recRes = await api.get('/recommended').catch(() => null)
    if (recRes && recRes.data && recRes.data.length) {
      recommended.value = recRes.data
    } else {
      const r1 = await api.get('/playlists')
      playlists.value = r1.data || []
      recommended.value = playlists.value.slice(0, 6)
    }
    // ensure playlists populated for the "Your Playlists" section
    if (!playlists.value.length) {
      const rAll = await api.get('/playlists')
      playlists.value = rAll.data || playlists.value
    }
  } catch (e) {
    playlists.value = []
    recommended.value = []
  }
})
</script>

<style scoped>
.rec-grid{ display:flex; gap:12px; overflow:auto; padding:8px 0 }
.rec-card{ width:160px; background:#181818; padding:12px; border-radius:8px; cursor:pointer }
.rec-card img{ width:100%; height:100px; object-fit:cover; border-radius:6px }
.pl-grid{ display:flex; gap:12px; flex-wrap:wrap; margin-top:12px }
.pl-card{ width:180px; height:100px; background:#181818; display:flex; align-items:center; justify-content:center; border-radius:8px; cursor:pointer }
.name{ color:#fff }
</style>
