import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// User routes
app.get('/api/user', async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      include: { playlists: true }
    });
    res.json(user || { id: 1, email: 'demo@spotify.com', name: 'Demo User' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Artists routes
app.get('/api/artists', async (req, res) => {
  try {
    const artists = await prisma.artist.findMany({
      include: { songs: true }
    });
    res.json(artists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Songs routes
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await prisma.song.findMany({
      include: { artist: true, playlist: true }
    });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/songs/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const songs = await prisma.song.findMany({
      where: { genre },
      include: { artist: true }
    });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Podcasts routes
app.get('/api/podcasts', async (req, res) => {
  try {
    const podcasts = await prisma.podcast.findMany();
    res.json(podcasts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/podcasts/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const podcasts = await prisma.podcast.findMany({
      where: { category }
    });
    res.json(podcasts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Playlists routes
app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: { songs: true, user: true }
    });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:userId/playlists', async (req, res) => {
  try {
    const { userId } = req.params;
    const playlists = await prisma.playlist.findMany({
      where: { userId: parseInt(userId) },
      include: { songs: true }
    });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/playlists', async (req, res) => {
  try {
    const { name, description, userId } = req.body;
    const playlist = await prisma.playlist.create({
      data: { name, description, userId: userId || 1 }
    });
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/playlists/:id/songs', async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    
    const updatedPlaylist = await prisma.playlist.update({
      where: { id: parseInt(id) },
      data: {
        songs: {
          connect: { id: parseInt(songId) }
        }
      },
      include: { songs: true }
    });
    
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.playlist.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Spotify App Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
