<template>
  <div>
    <h1 class="title has-text-white">Songs</h1>

    <table class="table is-fullwidth is-dark">
      <tr v-for="song in songs" :key="song.id">
        <td>{{ song.title }}</td>
        <td>{{ song.artist.name }}</td>
        <td>
          <button class="button is-small" @click="$emit('play', song)">
            ▶
          </button>
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { api } from "../api"

const songs = ref([])

onMounted(async () => {
  const res = await api.get("/songs")
  songs.value = res.data
})
</script>