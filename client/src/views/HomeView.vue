<template>
  <div>

    <h2 class="section">Made for you</h2>

    <div class="grid">
      <div
        v-for="song in songs"
        :key="song.id"
        class="card"
        @click="$emit('play', song)"
      >
        <div class="image">
          <img :src="song.image || fallback">
          <button class="play-btn">▶</button>
        </div>

        <div class="title">{{ song.title }}</div>
        <div class="subtitle">{{ song.artist.name }}</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { api } from '../api'

const songs = ref([])
const fallback = '/spotifylogo.png'

onMounted(async ()=>{
  const r = await api.get('/songs')
  songs.value = r.data
})
</script>

<style scoped>
.section{
  color:white;
  font-size:22px;
  margin-bottom:18px;
}

.grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(170px,1fr));
  gap:20px;
}

.card{
  background:var(--bg-card);
  border-radius:8px;
  padding:16px;
  cursor:pointer;
  transition:background .2s;
}

.card:hover{
  background:var(--bg-card-hover);
}

.image{
  position:relative;
  margin-bottom:12px;
}

.image img{
  width:100%;
  aspect-ratio:1/1;
  object-fit:cover;
  border-radius:6px;
}

.play-btn{
  position:absolute;
  right:8px;
  bottom:8px;
  width:42px;
  height:42px;
  border-radius:50%;
  border:none;
  background:var(--spotify-green);
  color:black;
  font-size:18px;
  cursor:pointer;
  opacity:0;
  transform:translateY(6px);
  transition:.2s;
}

.card:hover .play-btn{
  opacity:1;
  transform:translateY(0);
}

.title{
  color:white;
  font-size:14px;
  font-weight:600;
  margin-bottom:4px;
}

.subtitle{
  color:var(--text-sub);
  font-size:12px;
}
</style>