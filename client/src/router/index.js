// client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlaylistView from '../views/PlaylistView.vue'
import SearchView from '../views/SearchView.vue'
import SongsView from '../views/SongsView.vue'
import ArtistView from '../views/ArtistView.vue'
import LibraryView from '../views/LibraryView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/playlist/:id', component: PlaylistView, props: true },
  { path: '/search', component: SearchView },
  { path: '/songs', component: SongsView },
  { path: '/artist/:id', component: ArtistView, props: true },
  { path: '/library', component: LibraryView },
  { path: '/recommended', component: HomeView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
