// server/src/server.js
import express from 'express'
import cors from 'cors'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Serve static files and audio folder
app.use(express.static(path.join(process.cwd(), 'public')))
app.use('/audio', express.static(path.join(process.cwd(), 'public', 'audio')))

/** Health */
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

/** Seed endpoint (for local testing) */
app.get('/api/seed', async (req, res) => {
  try {
    const artistCount = await prisma.artist.count()
    if (artistCount > 0) {
      return res.json({ seeded: false, message: 'Database already has data' })
    }

    const artist = await prisma.artist.create({
      data: { name: 'Sample Artist' }
    })

    const sampleSongs = [
      { title: 'Rainy Road', duration: 185, genre: 'indie', audioFileName: 'rainy_road.mp3' },
      { title: 'Rising Sun', duration: 210, genre: 'pop', audioFileName: 'rising_sun.mp3' },
      { title: 'Midnight Drive', duration: 240, genre: 'electronic', audioFileName: 'midnight_drive.mp3' },
      { title: 'Ambient Breeze', duration: 200, genre: 'ambient', audioFileName: 'ambient_breeze.mp3' },
      { title: 'Lonely River', duration: 195, genre: 'folk', audioFileName: 'lonely_river.mp3' }
    ]

    const created = []
    for (const s of sampleSongs) {
      const song = await prisma.song.create({
        data: {
          title: s.title,
          duration: s.duration,
          genre: s.genre,
          audioFileName: s.audioFileName,
          artist: { connect: { id: artist.id } }
        }
      })
      created.push(song)
    }

    const playlist = await prisma.playlist.create({
      data: {
        name: 'Sample Playlist',
        description: 'A seeded playlist for testing',
        songs: { connect: created.map(s => ({ id: s.id })) }
      },
      include: { songs: true }
    })

    return res.json({ seeded: true, artist, songs: created, playlist })
  } catch (err) {
    console.error('[/api/seed] error:', err && err.stack ? err.stack : err)
    return res.status(500).json({ error: 'Seeding failed' })
  }
})

/** List songs (all) */
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await prisma.song.findMany({ include: { artist: true }, orderBy: { id: 'asc' } })
    const mapped = songs.map(s => {
      const filename = s.audioFileName || s.filename || s.fileName || s.file || `song_${s.id}.mp3`
      return { ...s, audioPath: s.audioPath || `/audio/${filename}` }
    })
    res.json(mapped)
  } catch (err) {
    console.error('[/api/songs] error:', err && err.stack ? err.stack : err)
    res.status(500).json({ error: 'Failed to load songs' })
  }
})

/** List playlists */
app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: { songs: { include: { artist: true } } },
      orderBy: { id: 'asc' }
    })

    const mapped = playlists.map(pl => ({
      ...pl,
      songs: pl.songs.map(s => {
        const filename = s.audioFileName || s.filename || s.fileName || s.file || `song_${s.id}.mp3`
        return { ...s, audioPath: s.audioPath || `/audio/${filename}` }
      })
    }))

    res.json(mapped)
  } catch (err) {
    console.error('[/api/playlists] error:', err && err.stack ? err.stack : err)
    res.status(500).json({ error: 'Failed to load playlists' })
  }
})

/** Create playlist */
app.post('/api/playlists', async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ error: 'Playlist name required' })

    // For simplicity assume single user with id = 1. Adjust to use real auth if available.
    const userId = 1
    const pl = await prisma.playlist.create({
      data: {
        name,
        description: description || '',
        user: { connect: { id: userId } }
      },
      include: { songs: true }
    })
    res.status(201).json(pl)
  } catch (err) {
    console.error('[/api/playlists POST] error:', err && err.stack ? err.stack : err)
    res.status(500).json({ error: 'Failed to create playlist' })
  }
})

/** Add song to playlist */
app.post('/api/playlists/:id/add-song', async (req, res) => {
  try {
    const playlistId = Number(req.params.id)
    const { songId } = req.body
    if (!songId || Number.isNaN(playlistId)) return res.status(400).json({ error: 'Invalid playlist or song id' })

    const updated = await prisma.playlist.update({
      where: { id: playlistId },
      data: { songs: { connect: { id: Number(songId) } } },
      include: { songs: { include: { artist: true } } }
    })

    updated.songs = updated.songs.map(s => {
      const filename = s.audioFileName || s.filename || s.fileName || s.file || `song_${s.id}.mp3`
      return { ...s, audioPath: s.audioPath || `/audio/${filename}` }
    })

    res.json(updated)
  } catch (err) {
    console.error('[/api/playlists/:id/add-song] error:', err && err.stack ? err.stack : err)
    try {
      const pl = await prisma.playlist.findUnique({ where: { id: Number(req.params.id) }, include: { songs: { include: { artist: true } } } })
      if (pl) {
        pl.songs = pl.songs.map(s => {
          const filename = s.audioFileName || s.filename || s.fileName || s.file || `song_${s.id}.mp3`
          return { ...s, audioPath: s.audioPath || `/audio/${filename}` }
        })
        return res.json(pl)
      }
    } catch (e) { /* ignore */ }
    return res.status(500).json({ error: 'Failed to add song to playlist' })
  }
})

/** Get single playlist by id */
app.get('/api/playlists/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: { songs: { include: { artist: true } }, user: true }
    })

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' })

    playlist.songs = playlist.songs.map(s => {
      const filename = s.audioFileName || s.filename || s.fileName || s.file || `song_${s.id}.mp3`
      const audioPath = s.audioPath || `/audio/${filename}`
      return { ...s, audioPath }
    })

    res.json(playlist)
  } catch (err) {
    console.error('[/api/playlists/:id] error:', err && err.stack ? err.stack : err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/** Toggle like/unlike a song (adds/removes from user's "Liked Songs") */
app.post('/api/like/:songId', async (req, res) => {
  try {
    const songId = Number(req.params.songId)
    if (Number.isNaN(songId)) return res.status(400).json({ error: 'Invalid song id' })

    const userId = 1 // single-user assumption for now

    // find or create "Liked Songs" playlist for user
    let liked = await prisma.playlist.findFirst({
      where: { name: 'Liked Songs', userId },
      include: { songs: { include: { artist: true } } }
    })

    if (!liked) {
      liked = await prisma.playlist.create({
        data: {
          name: 'Liked Songs',
          description: 'Songs you liked',
          user: { connect: { id: userId } }
        },
        include: { songs: { include: { artist: true } } }
      })
    }

    // Check whether the song is already in the liked playlist
    const alreadyLiked = liked.songs.some(s => s.id === songId)

    if (alreadyLiked) {
      // remove (disconnect) the song
      await prisma.playlist.update({
        where: { id: liked.id },
        data: { songs: { disconnect: { id: songId } } }
      })
    } else {
      // add (connect) the song
      try {
        await prisma.playlist.update({
          where: { id: liked.id },
          data: { songs: { connect: { id: songId } } }
        })
      } catch (e) {
        // ignore duplicate connect errors
      }
    }

    // return updated liked playlist
    const updated = await prisma.playlist.findUnique({
      where: { id: liked.id },
      include: { songs: { include: { artist: true } } }
    })

    updated.songs = updated.songs.map(s => {
      const filename = s.audioFileName || s.filename || s.fileName || s.file || `song_${s.id}.mp3`
      return { ...s, audioPath: s.audioPath || `/audio/${filename}` }
    })

    return res.json({ likedPlaylist: updated, action: alreadyLiked ? 'unliked' : 'liked' })
  } catch (err) {
    console.error('[/api/like/:songId] error:', err && err.stack ? err.stack : err)
    return res.status(500).json({ error: 'Failed to toggle like' })
  }
})

/** Get user library (playlists + liked songs) */
app.get('/api/user/library', async (req, res) => {
  try {
    const userId = 1
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: { songs: { include: { artist: true } } },
      orderBy: { id: 'asc' }
    })
    const mapped = playlists.map(pl => ({
      ...pl,
      songs: pl.songs.map(s => {
        const filename = s.audioFileName || s.filename || s.fileName || s.file || `song_${s.id}.mp3`
        return { ...s, audioPath: s.audioPath || `/audio/${filename}` }
      })
    }))
    res.json({ playlists: mapped })
  } catch (err) {
    console.error('[/api/user/library] error:', err && err.stack ? err.stack : err)
    res.status(500).json({ error: 'Failed to load library' })
  }
})

/** Debug endpoints */
app.get('/api/search-debug', async (req, res) => {
  try {
    const songCount = await prisma.song.count()
    const artistCount = await prisma.artist.count()
    const playlistCount = await prisma.playlist.count()
    return res.json({ songCount, artistCount, playlistCount })
  } catch (err) {
    console.error('[/api/search-debug] error:', err && err.stack ? err.stack : err)
    return res.status(500).json({ error: 'Debug failed' })
  }
})

app.get('/api/debug-songs', async (req, res) => {
  try {
    const songs = await prisma.song.findMany({
      take: 200,
      include: { artist: true },
      orderBy: { id: 'asc' }
    })
    const mapped = songs.map(s => ({
      id: s.id,
      title: s.title,
      duration: s.duration,
      genre: s.genre,
      artistId: s.artistId,
      artistName: s.artist?.name || null,
      audioFileName: s.audioFileName || s.filename || s.fileName || null,
      audioPath: s.audioPath || null
    }))
    return res.json(mapped)
  } catch (err) {
    console.error('[/api/debug-songs] error:', err && err.stack ? err.stack : err)
    return res.status(500).json({ error: 'Failed to list songs' })
  }
})

/** Robust schema-agnostic search */
app.get('/api/search', async (req, res) => {
  try {
    const rawQ = String(req.query.q || '').trim()
    if (!rawQ) return res.json({ songs: [], artists: [] })

    const qLower = rawQ.toLowerCase()

    const allSongs = await prisma.song.findMany({
      include: { artist: true },
      take: 2000,
      orderBy: { id: 'asc' }
    })

    const getSongTextFields = (song) =>
      [
        song.title,
        song.name,
        song.songName,
        song.trackName,
        song.genre,
        song.audioFileName,
        song.filename,
        song.fileName
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())

    const matchedSongs = allSongs.filter((song) => {
      const fields = getSongTextFields(song)
      const artistName = song.artist?.name ? String(song.artist.name).toLowerCase() : ''
      return fields.some((f) => f.includes(qLower)) || (artistName && artistName.includes(qLower))
    })

    const mappedSongs = matchedSongs.map((s) => {
      const filename = s.audioFileName || s.filename || s.fileName || s.file || `song_${s.id}.mp3`
      const audioPath = s.audioPath || `/audio/${filename}`
      return { ...s, audioPath }
    })

    const allArtists = await prisma.artist.findMany({ take: 500, orderBy: { id: 'asc' } })
    const matchedArtists = allArtists
      .filter((a) => String(a.name || '').toLowerCase().includes(qLower))
      .slice(0, 50)

    console.log(`[/api/search] query="${rawQ}" songs=${mappedSongs.length} artists=${matchedArtists.length}`)
    return res.json({ songs: mappedSongs, artists: matchedArtists })
  } catch (err) {
    console.error('[/api/search] error:', err && err.stack ? err.stack : err)
    return res.json({ songs: [], artists: [] })
  }
})

/** Recommended endpoint (simple) */
app.get('/api/recommended', async (req, res) => {
  try {
    const rec = await prisma.playlist.findMany({ orderBy: { id: 'desc' }, take: 8 })
    res.json(rec)
  } catch (err) {
    console.error('[/api/recommended] error', err)
    res.status(500).json({ error: 'Failed to load recommended' })
  }
})

/** Start server */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

process.on('SIGINT', async () => {
  try { await prisma.$disconnect() } catch (e) { console.error(e) }
  process.exit(0)
})
process.on('SIGTERM', async () => {
  try { await prisma.$disconnect() } catch (e) { console.error(e) }
  process.exit(0)
})
