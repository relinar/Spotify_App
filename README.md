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
│   ├── .env               # Environment variables (not committed)
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

### 1. Backend dependencies

```bash
cd server
npm install
```

### 2. Environment configuration

Create `.env`:

```ini
DATABASE_URL="mysql://<user>:<password>@localhost:3306/spotify"
PORT=3000
NODE_ENV=development
```

---

### 3. Generate Prisma client & migrate

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

### 4. Seed the database

```bash
npm run seed
```

---

### 5. Frontend dependencies

```bash
cd ../client
npm install
```

---

### 6. Start both servers

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

Frontend → http://localhost:5173  
Backend API → http://localhost:3000  

---

## 🔗 API Overview

### Artists
- `GET /api/artists`

### Songs
- `GET /api/songs`

### Playlists
- `GET /api/playlists`
- `POST /api/playlists`
- `POST /api/playlists/:id/songs`

---

## 🗃 Database Structure

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

---

## 📦 Seeded Data

- Default user
- Sample artists
- Sample songs
- Sample playlists

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