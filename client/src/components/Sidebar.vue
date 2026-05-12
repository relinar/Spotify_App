<!-- client/src/components/Sidebar.vue -->
<template>
  <aside class="sidebar" :class="{ open: open }">
    <div class="logo">Spotify</div>

    <nav class="nav">
      <router-link to="/" class="nav-item">Home</router-link>
      <router-link to="/search" class="nav-item">Search</router-link>
      <router-link to="/library" class="nav-item">Your Library</router-link>
    </nav>

    <section class="playlists">
      <h4>Playlists</h4>
      <div v-if="playlists && playlists.length">
        <router-link
          v-for="p in playlists"
          :key="p.id"
          :to="`/playlist/${p.id}`"
          class="playlist-card"
        >
          {{ p.name }}
        </router-link>
      </div>
      <div v-else class="no-playlists">No playlists</div>
    </section>
  </aside>
</template>

<script setup>
const props = defineProps({
  playlists: { type: Array, default: () => [] },
  open: { type: Boolean, default: false }
})
</script>

<style scoped>
.sidebar{ background:#000; color:#fff; padding:16px; height:100vh; position:sticky; top:0; overflow:auto; z-index:20 }
.logo{ font-size:20px; font-weight:700; margin-bottom:12px }
.nav{ display:flex; flex-direction:column; gap:8px; margin-bottom:12px }
.nav-item{ color:var(--text-sub); text-decoration:none; padding:6px 0; display:block }
.nav-item.router-link-active{ color:#fff }
.playlists{ margin-top:12px }
.playlist-card{ display:block; padding:8px 6px; cursor:pointer; border-radius:6px; color:var(--text-sub); text-decoration:none }
.playlist-card:hover{ background:#111; color:#fff }
.no-playlists{ color:var(--text-sub); padding:8px 6px }
</style>
