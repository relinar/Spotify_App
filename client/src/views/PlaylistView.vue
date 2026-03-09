<template>
  <div>
    <h1 class="title has-text-white">Playlists</h1>

    <div v-for="pl in playlists" :key="pl.id" class="box">
      <h2>{{ pl.name }}</h2>

      <ul>
        <li v-for="song in pl.songs" :key="song.id">
          {{ song.title }} – {{ song.artist.name }}
          <button class="button is-small" @click="$emit('play', song)">▶</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { api } from "../api"

const playlists = ref([])

onMounted(async () => {
  const res = await api.get("/playlists")
  playlists.value = res.data
})
</script>