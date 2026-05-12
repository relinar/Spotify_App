<template>
  <div>
    <h1 class="title has-text-white">Artists</h1>

    <div v-for="artist in artists" :key="artist.id" class="box">
      <h2>{{ artist.name }}</h2>

      <ul>
        <li v-for="song in artist.songs" :key="song.id">
          {{ song.title }}
          <button class="button is-small" @click="$emit('play', song)">▶</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { api } from "../api"

const artists = ref([])

onMounted(async () => {
  const res = await api.get("/artists")
  artists.value = res.data
})
</script>