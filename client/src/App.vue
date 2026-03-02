<template>
  <div class="app">

    <aside class="sidebar" :class="{ open: mobileMenu }">
      <div class="logo">Spotify</div>

      <div class="nav">
        <button class="nav-btn active">Home</button>
        <button class="nav-btn">Search</button>
        <button class="nav-btn">Your Library</button>
      </div>
    </aside>

    <div class="main">

      <header class="topbar">
        <button class="mobile-menu" @click="mobileMenu = !mobileMenu">☰</button>
        <input class="search" placeholder="What do you want to listen to?" />
      </header>

      <main class="content">
        <HomeView @play="play" />
      </main>

    </div>

    <PlayerBar :song="currentSong" />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import HomeView from './views/HomeView.vue'
import PlayerBar from './components/PlayerBar.vue'

const currentSong = ref(null)
const mobileMenu = ref(false)

function play(song){
  currentSong.value = song
}
</script>

<style>
:root{
  --bg-main:#121212;
  --bg-sidebar:#000000;
  --bg-card:#181818;
  --bg-card-hover:#282828;
  --bg-top:#101010;
  --text-main:#ffffff;
  --text-sub:#b3b3b3;
  --spotify-green:#1db954;
}

html,body,#app{
  margin:0;
  height:100%;
  background:var(--bg-main);
  font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto;
}

.app{
  display:grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 1fr 90px;
  height:100vh;
}

.sidebar{
  background:var(--bg-sidebar);
  color:var(--text-main);
  padding:18px 12px;
}

.logo{
  font-weight:700;
  font-size:20px;
  margin-bottom:22px;
}

.nav{
  display:flex;
  flex-direction:column;
  gap:6px;
}

.nav-btn{
  background:none;
  border:none;
  color:var(--text-sub);
  text-align:left;
  padding:10px 12px;
  border-radius:6px;
  font-size:14px;
  cursor:pointer;
}

.nav-btn.active,
.nav-btn:hover{
  color:var(--text-main);
  background:#1a1a1a;
}

.main{
  background:linear-gradient(180deg,#1f1f1f 0%, #121212 180px);
  display:flex;
  flex-direction:column;
  overflow:hidden;
}

.topbar{
  height:64px;
  display:flex;
  align-items:center;
  gap:12px;
  padding:0 20px;
  background:var(--bg-top);
}

.search{
  width:360px;
  max-width:100%;
  border-radius:500px;
  border:none;
  padding:10px 16px;
  background:#242424;
  color:white;
  outline:none;
}

.content{
  flex:1;
  overflow:auto;
  padding:24px;
}

.mobile-menu{
  display:none;
  background:none;
  border:none;
  color:white;
  font-size:22px;
}

@media (max-width: 900px){
  .app{
    grid-template-columns: 1fr;
  }

  .sidebar{
    position:fixed;
    top:0;
    left:-260px;
    width:240px;
    height:100%;
    z-index:20;
    transition:left .25s;
  }

  .sidebar.open{
    left:0;
  }

  .mobile-menu{
    display:block;
  }
}
</style>