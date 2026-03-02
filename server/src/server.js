import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

app.get('/api/user', async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      include: {
        playlists: {
          include: {
            songs: {
              include: {
                artist: true
              }
            }
          }
        }
      }
    })

    res.json(user || { id: 1, email: 'demo@spotify.com', name: 'Demo User' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/categories', async (req, res) => {
  try {
    // If the Prisma client doesn't have a Category model (schema mismatch),
    // return an empty array so the frontend doesn't receive a 500.
    if (!prisma.category || typeof prisma.category.findMany !== 'function') {
      console.warn('Prisma client has no Category model; returning empty categories')
      return res.json([])
    }

    const categories = await prisma.category.findMany()
    res.json(categories)
  } catch (error) {
    console.error('[/api/categories] failed:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/artists', async (req, res) => {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        songs: true
      }
    })
    res.json(artists)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/songs', async (req, res) => {
  try {
    const songs = await prisma.song.findMany({
      include: {
        artist: true,
        playlists: true
      }
    })
    res.json(songs)
  } catch (error) {
    console.error('[/api/songs] failed:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/songs/:genre', async (req, res) => {
  try {
    const { genre } = req.params
    const songs = await prisma.song.findMany({
      where: { genre },
      include: { artist: true }
    })
    res.json(songs)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/podcasts', async (req, res) => {
  try {
    const podcasts = await prisma.podcast.findMany()
    res.json(podcasts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/podcasts/:category', async (req, res) => {
  try {
    const { category } = req.params
    const podcasts = await prisma.podcast.findMany({
      where: { category }
    })
    res.json(podcasts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        user: true,
        songs: {
          include: {
            artist: true
          }
        }
      }
    })
    res.json(playlists)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/user/:userId/playlists', async (req, res) => {
  try {
    const { userId } = req.params
    const playlists = await prisma.playlist.findMany({
      where: { userId: parseInt(userId) },
      include: {
        songs: {
          include: {
            artist: true
          }
        }
      }
    })
    res.json(playlists)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/playlists', async (req, res) => {
  try {
    const { name, description, userId } = req.body
    const playlist = await prisma.playlist.create({
      data: { name, description, userId: userId || 1 }
    })
    res.status(201).json(playlist)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/playlists/:id/songs', async (req, res) => {
  try {
    const { id } = req.params
    const { songId } = req.body

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: parseInt(id) },
      data: {
        songs: {
          connect: { id: parseInt(songId) }
        }
      },
      include: {
        songs: {
          include: {
            artist: true
          }
        }
      }
    })

    res.json(updatedPlaylist)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.playlist.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Playlist deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/history', async (req, res) => {
  try {
    const { userId, songId } = req.body

    const entry = await prisma.listeningHistory.create({
      data: {
        userId: Number(userId),
        songId: Number(songId)
      }
    })

    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Spotify App Server running on http://localhost:${PORT}`)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})