<template>
  <div class="player">

    <div class="left">
      <div v-if="song">
        <div class="track">{{ song.title }}</div>
        <div class="artist">{{ song.artist?.name }}</div>
      </div>
    </div>

    <div class="center">
      <button class="icon">⏮</button>
      <button class="icon play">▶</button>
      <button class="icon">⏭</button>
    </div>

    <div class="right">
      <button class="icon" @click="save">＋</button>
    </div>

  </div>
</template>

<script setup>
import { api } from '../api'

const props = defineProps({ song:Object })

async function save(){
  if(!props.song) return
  await api.post('/history',{
    userId:1,
    songId:props.song.id
  })
}
</script>

<style scoped>
.player{
  grid-column:1 / 3;
  background:#181818;
  border-top:1px solid #282828;
  display:grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items:center;
  padding:0 16px;
  color:white;
}

.left{
  display:flex;
  align-items:center;
}

.track{
  font-size:13px;
}

.artist{
  font-size:11px;
  color:#b3b3b3;
}

.center{
  display:flex;
  justify-content:center;
  gap:18px;
}

.right{
  display:flex;
  justify-content:flex-end;
}

.icon{
  background:none;
  border:none;
  color:white;
  font-size:18px;
  cursor:pointer;
}

.play{
  background:white;
  color:black;
  width:36px;
  height:36px;
  border-radius:50%;
  font-size:16px;
}

@media (max-width:900px){
  .player{
    grid-template-columns:1fr;
    padding:8px 12px;
    gap:6px;
  }

  .right{
    display:none;
  }
}
</style>