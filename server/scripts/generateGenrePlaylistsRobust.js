// server/scripts/generateGenrePlaylistsRobust.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const GENRE_KEYWORDS = {
  "hip hop": ["hip hop","hip-hop","rap","trap"],
  "rock": ["rock","punk","metal","grunge"],
  "electronic": ["electronic","edm","house","techno","dubstep","electronica"],
  "pop": ["pop","k-pop","synthpop"],
  "jazz": ["jazz","swing","bebop","fusion"],
  "classical": ["classical","baroque","symphony","orchestra"],
  "folk": ["folk","acoustic","indie folk"],
  "experimental": ["experimental","ambient","noise","avant-garde"]
}

function inferGenreFromText(text){
  if(!text) return null
  const t = text.toLowerCase()
  for(const [canon, keys] of Object.entries(GENRE_KEYWORDS)){
    for(const k of keys){
      if(t.includes(k)) return canon
    }
  }
  return null
}

async function ensureUser(){
  // Try to find an existing user
  let user = await prisma.user.findFirst()
  if(user) return user.id
  // Create a default demo user
  user = await prisma.user.create({
    data: {
      email: 'demo@spotify.local',
      name: 'Demo User',
      isPremium: false
    }
  })
  console.log('Created default user id', user.id)
  return user.id
}

async function main(){
  const topCount = 8
  const songsPerPlaylist = 40

  // Ensure we have a user to attach playlists to
  const userId = await ensureUser()

  // 1) Try to get distinct genres from DB
  const raw = await prisma.$queryRaw`
    SELECT genre, COUNT(*) as cnt
    FROM Song
    WHERE genre IS NOT NULL AND genre != ''
    GROUP BY genre
    ORDER BY cnt DESC
  `
  const genres = raw.map(r => ({ genre: r.genre, count: Number(r.cnt) }))

  let chosenGenres = []
  if(genres.length){
    chosenGenres = genres.slice(0, topCount).map(g => g.genre)
    console.log('Using DB genres:', chosenGenres)
  } else {
    console.log('No DB genres found — inferring from titles and artists...')
    const batchSize = 2000
    let offset = 0
    const inferredCounts = {}
    while(true){
      const batch = await prisma.song.findMany({ skip: offset, take: batchSize, include: { artist: true } })
      if(!batch.length) break
      for(const s of batch){
        const text = `${s.title || ''} ${s.artist?.name || ''}`
        const g = inferGenreFromText(text)
        if(g) inferredCounts[g] = (inferredCounts[g] || 0) + 1
      }
      offset += batchSize
    }
    const inferred = Object.entries(inferredCounts).sort((a,b)=>b[1]-a[1]).map(x=>x[0])
    chosenGenres = inferred.slice(0, topCount)
    if(!chosenGenres.length){
      chosenGenres = Object.keys(GENRE_KEYWORDS).slice(0, topCount)
      console.log('Falling back to canonical list:', chosenGenres)
    } else {
      console.log('Inferred genres:', chosenGenres)
    }
  }

  // 2) Create playlists and attach songs
  for(const genre of chosenGenres){
    const playlistName = genre.charAt(0).toUpperCase() + genre.slice(1)
    let playlist = await prisma.playlist.findFirst({ where: { name: playlistName } })
    if(!playlist){
      playlist = await prisma.playlist.create({
        data: {
          name: playlistName,
          description: `Auto-generated ${playlistName} playlist`,
          userId
        }
      })
      console.log('Created playlist:', playlistName)
    } else {
      console.log('Playlist exists:', playlistName)
    }

    // Choose songs
    let songs = []
    if(genres.length){
      songs = await prisma.song.findMany({
        where: { genre },
        take: songsPerPlaylist,
        orderBy: { id: 'asc' }
      })
    } else {
      const keys = GENRE_KEYWORDS[genre] || [genre]
      const candidates = await prisma.song.findMany({ take: 5000, include: { artist: true } })
      songs = candidates.filter(s => {
        const text = `${s.title || ''} ${s.artist?.name || ''}`.toLowerCase()
        return keys.some(k => text.includes(k))
      }).slice(0, songsPerPlaylist)
    }

    if(songs.length){
      // Avoid connecting duplicates by checking existing song ids
      const existing = await prisma.playlist.findUnique({
        where: { id: playlist.id },
        include: { songs: true }
      })
      const existingIds = new Set(existing.songs.map(s => s.id))
      const toConnect = songs.filter(s => !existingIds.has(s.id)).map(s => ({ id: s.id }))
      if(toConnect.length){
        await prisma.playlist.update({
          where: { id: playlist.id },
          data: { songs: { connect: toConnect } }
        })
        console.log(`Added ${toConnect.length} songs to ${playlistName}`)
      } else {
        console.log(`No new songs to add to ${playlistName}`)
      }
    } else {
      console.log(`No songs found for ${playlistName}`)
    }
  }

  console.log('✅ Genre playlist generation complete.')
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
