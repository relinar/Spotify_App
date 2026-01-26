# Spotify App 🎵

A full-stack music streaming application built with Vue.js, Bulma CSS, Express.js, and Prisma ORM.

## Tech Stack

- **Frontend**: Vue 3, Vite, Bulma CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: SQLite with Prisma ORM
- **Architecture**: Client-Server

## Project Structure

```
spotify-app/
├── client/                 # Vue.js frontend
│   ├── src/
│   │   ├── App.vue        # Main app component
│   │   └── main.js        # Vue app entry point
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
│
├── server/                # Express backend
│   ├── src/
│   │   └── server.js      # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Seed data script
│   ├── .env.example       # Environment variables template
│   └── package.json       # Backend dependencies
│
└── README.md
```

## Features

- 🎤 Browse and view artists
- 🎵 Explore songs with details
- 📋 Create and manage playlists
- 💾 Persistent data with Prisma ORM
- 🎨 Beautiful UI with Bulma CSS
- ⚡ Fast development with Vite



### Installation

#### 1. Install Backend Dependencies

```bash
cd server
npm install
```

#### 2. Setup Database

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

#### 3. Install Frontend Dependencies

```bash
cd client
npm install
```

### Running the Application

#### Terminal 1 - Start Backend Server

```bash
cd server
npm run dev
```

The server will run on `http://localhost:3000`

#### Terminal 2 - Start Frontend Dev Server

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Artists

- `GET /api/artists` - Get all artists with their songs

### Songs

- `GET /api/songs` - Get all songs with artist details

### Playlists

- `GET /api/playlists` - Get all playlists with songs
- `POST /api/playlists` - Create a new playlist
- `POST /api/playlists/:id/songs` - Add song to playlist

## Database Schema

### Artist

```prisma
- id: Int (Primary Key)
- name: String (Unique)
- bio: String?
- image: String?
- songs: Song[]
```

### Song

```prisma
- id: Int (Primary Key)
- title: String
- duration: Int (seconds)
- genre: String?
- image: String?
- artistId: Int (Foreign Key)
- artist: Artist
- playlistId: Int? (Foreign Key)
```

### Playlist

```prisma
- id: Int (Primary Key)
- name: String
- description: String?
- image: String?
- songs: Song[]
```

## Seeded Data

The app comes with pre-populated data:

**Artists:**
- The Weeknd
- Billie Eilish
- Taylor Swift

**Songs:** 12 songs across different genres

**Playlists:**
- Trending Now
- Chill Vibes

## Building for Production

### Frontend

```bash
cd client
npm run build
```

### Server

```bash
cd server
npm start
```

## Author

Relina Russak