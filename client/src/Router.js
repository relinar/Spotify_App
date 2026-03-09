import { createRouter, createWebHistory } from 'vue-router'

import HomeView from './views/HomeView.vue'
import SearchView from './views/SearchView.vue'
import SongsView from './views/SongsView.vue'
import ArtistView from './views/ArtistView.vue'
import PlaylistView from './views/PlaylistView.vue'
import LibraryView from './views/LibraryView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/search', component: SearchView },
  { path: '/songs', component: SongsView },
  { path: '/artists', component: ArtistView },
  { path: '/playlists', component: PlaylistView },
  { path: '/library', component: LibraryView }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})