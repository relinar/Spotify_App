# Spotify App 🎵

A full-stack music streaming clone built with Vue 3, Bulma CSS, Express.js, and Prisma ORM.

---

## 🧰 Tech Stack

- **Frontend**: Vue 3, Vite, Bulma CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MySQL 
- **ORM**: Prisma
- **Architecture**: Client / Server

---

## 📁 Project Structure

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
│   │   ├── schema.prisma  # Database schema (models + relations)
│   │   ├── seed.js        # Seed data script
│   │   └── migrations/    # Generated migration SQL
│   ├── .env              # environment variables (not committed)
│   └── package.json       # Backend dependencies & scripts
│
└── README.md              # ← you are here
```

---

## ✅ Features

- 🎤 Browse artists and view their songs
- 🎵 Explore song details and play history
- 📋 Create and manage customizable playlists
- 💾 Data persistence via Prisma + MySQL
- 🎨 Responsive UI styled with Bulma
- ⚡ Rapid development using Vite & hot reload

---

## 🛠️ Setup & Development

1. **Backend dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Environment configuration**

   Copy `.env.example` to `.env` and adjust the connection string:

   ```ini
   DATABASE_URL="mysql://<user>:<password>@localhost:3306/spotify"
   PORT=3000
   NODE_ENV=development
   ```

   - `root:mysql` is the default used in this repo.
   - Make sure the `spotify` database exists (Prisma will create tables).

3. **Generate Prisma client & migrate**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

   - Migrations live under `server/prisma/migrations/*` and can be viewed on GitHub.

4. **Seed the database**

   ```bash
   npm run seed
   ```

5. **Frontend dependencies**

   ```bash
   cd ../client
   npm install
   ```

6. **Start both servers**

   - Terminal 1 (backend):
     ```bash
     cd server
     npm run dev
     ```
   - Terminal 2 (frontend):
     ```bash
     cd client
     npm run dev
     ```

   Frontend: `http://localhost:5173`  →  Backend API: `http://localhost:3000`

---

## 🔗 API Overview

### Artists
- `GET /api/artists` – list all artists with their songs

### Songs
- `GET /api/songs` – list all songs, including artist data

### Playlists
- `GET /api/playlists` – fetch user playlists with tracks
- `POST /api/playlists` – create a new playlist
- `POST /api/playlists/:id/songs` – add a track to a playlist


---

## 🗃 Database Structure

The schema below matches the MySQL database created by Prisma.

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String?
  avatar    String?
  bio       String?
  isPremium Boolean   @default(false)
  playlists Playlist[]
  favorites Song[]    @relation("UserFavorites")
  listeningHistory ListeningHistory[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Artist {
  id        Int     @id @default(autoincrement())
  name      String  @unique
  bio       String?
  image     String?
  songs     Song[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Song {
  id        Int       @id @default(autoincrement())
  title     String
  duration  Int
  genre     String?
  image     String?
  artistId  Int
  artist    Artist    @relation(fields: [artistId], references: [id], onDelete: Cascade)
  playlists Playlist[] @relation("PlaylistSongs")
  favoredBy User[]      @relation("UserFavorites")
  listeningHistory ListeningHistory[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Playlist {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  image       String?
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  songs       Song[]    @relation("PlaylistSongs")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Podcast {
  id        Int       @id @default(autoincrement())
  title     String
  description String?
  duration  Int
  category  String?
  image     String?
  host      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ListeningHistory {
  id      Int     @id @default(autoincrement())
  userId  Int
  songId  Int
  playedAt DateTime @default(now())
  user    User    @relation(fields: [userId], references: [id])
  song    Song    @relation(fields: [songId], references: [id])
}
```

Migrations are stored in `server/prisma/migrations` – see the `20260216145528_init/migration.sql` file for the exact SQL.

---

## 📦 Seeded Data

The database ships with a default account and sample records:

- **User**: `user@spotify.com` (non‑premium)
- **Artists**: Example musicians such as The Weeknd, Billie Eilish, Taylor Swift
- **Songs**: A dozen tracks with durations/genres
- **Playlists**: `Trending Now`, `Chill Vibes`


---

## 🚀 Production Build

### Frontend

```bash
cd client
npm run build
```

### Backend

```bash
cd server
npm start
```

---


## 👩‍💻 Author

Relina Russak
