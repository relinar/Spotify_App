// client/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Ensure axios default base points to backend API so relative calls go to backend
axios.defaults.baseURL = 'http://localhost:3000/api'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
