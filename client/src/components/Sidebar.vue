<template>
  <aside class="sidebar" :class="{ open: open }" @click.stop>
    <div class="sidebar-header">
      <h3>Your Library</h3>
    </div>

    <div class="playlists-container">
      <div v-for="playlist in playlists" :key="playlist.id" class="playlist-item"
           :class="{ active: selectedPlaylist?.id === playlist.id }"
           @click="$emit('playlist-select', playlist)">
        <span class="playlist-icon">📋</span>
        <span class="playlist-name">{{ playlist.name }}</span>
      </div>

      <div class="add-playlist-form">
        <input v-model="newPlaylistName" placeholder="New playlist" class="playlist-input"/>
        <button @click="createPlaylist">Create</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ playlists:Array, selectedPlaylist:Object, open:Boolean })
const emit = defineEmits(['playlist-select','playlist-create','close'])
const newPlaylistName = ref('')
function createPlaylist(){
  if(newPlaylistName.value.trim()){
    emit('playlist-create', newPlaylistName.value)
    newPlaylistName.value=''
  }
}
watch(()=>props.open,val=>{if(!val)newPlaylistName.value=''})
</script>

<style scoped>
.sidebar{
  width:240px;
  background:var(--bg-sidebar);
  color:var(--text-main);
  padding:16px;
  height:100%;
  position:sticky;
  top:0;
  overflow-y:auto;
  transition:left .25s;
}
.sidebar-header h3{
  margin:0 0 16px 0;
}
.playlist-item{
  display:flex;
  align-items:center;
  gap:8px;
  padding:6px 8px;
  border-radius:4px;
  cursor:pointer;
  color:var(--text-sub);
}
.playlist-item.active{
  background:var(--spotify-green);
  color:black;
}
.add-playlist-form{
  margin-top:16px;
  display:flex;
  flex-direction:column;
  gap:6px;
}
.playlist-input{
  padding:6px 8px;
  border-radius:4px;
  border:none;
  background:#242424;
  color:white;
}
button{
  padding:6px;
  border:none;
  border-radius:4px;
  cursor:pointer;
  background:var(--spotify-green);
  color:black;
}
@media(max-width:900px){
  .sidebar{
    position:fixed;
    top:0;
    left:-260px;
    z-index:20;
    height:100%;
  }
  .sidebar.open{
    left:0;
  }
}
</style>