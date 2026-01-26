<template>
  <main class="main-content">
    <!-- Filter Tabs -->
    <div class="content-header">
      <div class="filter-tabs">
        <button 
          v-for="filter in filters"
          :key="filter"
          class="filter-tab"
          :class="{ active: activeFilter === filter }"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-grid">
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        Loading content...
      </div>

      <!-- Songs/Podcasts Grid -->
      <div v-else class="items-grid">
        <div 
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card"
          @click="playItem(item)"
        >
          <div class="card-image">
            <img :src="item.image" :alt="item.title" />
            <div class="play-button">
              ▶
            </div>
          </div>
          <div class="card-info">
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-subtitle">
              {{ item.artist?.name || item.host || item.category }}
            </p>
            <p class="item-duration">
              {{ formatDuration(item.duration) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredItems.length === 0" class="empty-state">
        <p>No content found</p>
        <p class="hint">Try adjusting your filters</p>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'MainContent',
  props: {
    songs: Array,
    podcasts: Array,
    loading: Boolean
  },
  emits: ['play-item'],
  setup(props, { emit }) {
    const activeFilter = ref('All')
    const filters = ['All', 'Music', 'Podcasts']

    const filteredItems = computed(() => {
      let items = []

      if (activeFilter.value === 'All') {
        items = [...(props.songs || []), ...(props.podcasts || [])]
      } else if (activeFilter.value === 'Music') {
        items = props.songs || []
      } else if (activeFilter.value === 'Podcasts') {
        items = props.podcasts || []
      }

      return items
    })

    const playItem = (item) => {
      emit('play-item', item)
    }

    const formatDuration = (seconds) => {
      if (!seconds) return ''
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    return {
      activeFilter,
      filters,
      filteredItems,
      playItem,
      formatDuration
    }
  }
}
</script>

<style scoped>
.main-content {
  flex: 1;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
  padding: 2rem;
  height: calc(100vh - 70px);
  overflow-y: auto;
}

.content-header {
  margin-bottom: 2rem;
}

.filter-tabs {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.filter-tab.active {
  background: #1db954;
  color: white;
  border-color: #1db954;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.loading {
  grid-column: 1 / -1;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 2rem;
}

.items-grid {
  display: contents;
}

.item-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.item-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.item-card:hover .card-image img {
  transform: scale(1.05);
}

.play-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 48px;
  height: 48px;
  background: #1db954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s;
}

.item-card:hover .play-button {
  opacity: 1;
  transform: scale(1);
}

.card-info {
  padding: 1rem;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-title {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.item-subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-duration {
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  font-size: 0.8rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state p {
  margin: 0.5rem 0;
}

.hint {
  font-size: 0.9rem;
}

/* Scrollbar styling */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .content-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }
}
</style>
