// server/scripts/adminSetup.js
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const META_DIR = path.join(process.cwd(), 'fma', 'fma_metadata')
const TRACKS_CSV = path.join(META_DIR, 'raw_tracks.csv') // adjust if needed

async function ensureDemoUser(){
  const email = 'demo@spotify.local'
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Demo User', isPremium: false }
  })
  return user.id
}

function loadCSVRows(csvPath){
  if(!fs.existsSync(csvPath)) return []
  const raw = fs.readFileSync(csvPath, 'utf8')
  return parse(raw, { columns: true, skip_empty_lines: true })
}

async function populateGenresFromCSVIfEmpty(){
  const countWithGenre = await prisma.song.count({ where: { genre: { not: null } } })
  if(countWithGenre > 0) return { updated: 0, reason: 'genres already present' }

  const rows = loadCSVRows(TRACKS_CSV)
  if(!rows.length) return { updated: 0, reason: 'no CSV found' }

  // map CSV rows by track_id for quick lookup
  const genreMap = new Map()
  for(const r of rows) {
    const id = r.track_id || r.id
    const g = r.genre_top || r.genre || ''
    if(id) genreMap.set(String(id), g)
  }

  const songs = await prisma.song.findMany({ orderBy: { id: 'asc' } })
  let updated = 0
  for(const s of songs){
    const csvGenre = genreMap.get(String(s.id)) || genreMap.get(String(s.audioPath?.match(/song_(\d+)\.mp3/)?.[1]))
    if(csvGenre && (!s.genre || s.genre === '')) {
      await prisma.song.update({ where: { id: s.id }, data: { genre: csvGenre } })
      updated++
    }
  }
  return { updated, reason: 'populated from CSV' }
}

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
    for(const k of keys) if(t.includes(k)) return canon
  }
  return null
}

async function generateGenrePlaylists({ userId, topCount = 8, songsPerPlaylist = 40 } = {}){
  // prefer DB genres
  const raw = await prisma.$queryRaw`SELECT genre, COUNT(*) as cnt FROM Song WHERE genre IS NOT NULL AND genre != '' GROUP BY genre ORDER BY cnt DESC`
  const genres = raw.map(r => ({ genre: r.genre, count: Number(r.cnt) }))
  let chosen = []
  if(genres.length) chosen = genres.slice(0, topCount).map(g => g.genre)
  else {
    // infer
    const batch = await prisma.song.findMany({ take: 5000, include: { artist: true } })
    const counts = {}
    for(const s of batch){
      const g = inferGenreFromText(`${s.title || ''} ${s.artist?.name || ''}`)
      if(g) counts[g] = (counts[g] || 0) + 1
    }
    chosen = Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(x=>x[0]).slice(0, topCount)
    if(!chosen.length) chosen = Object.keys(GENRE_KEYWORDS).slice(0, topCount)
  }

  const results = []
  for(const genre of chosen){
    const name = genre.charAt(0).toUpperCase() + genre.slice(1)
    let playlist = await prisma.playlist.findFirst({ where: { name } })
    if(!playlist){
      playlist = await prisma.playlist.create({ data: { name, description: `Auto ${name}`, userId } })
    }
    // pick songs
    let songs = []
    if(genres.length){
      songs = await prisma.song.findMany({ where: { genre }, take: songsPerPlaylist })
    } else {
      const keys = GENRE_KEYWORDS[genre] || [genre]
      const candidates = await prisma.song.findMany({ take: 5000, include: { artist: true } })
      songs = candidates.filter(s => keys.some(k => `${s.title} ${s.artist?.name}`.toLowerCase().includes(k))).slice(0, songsPerPlaylist)
    }
    // connect avoiding duplicates
    const existing = await prisma.playlist.findUnique({ where: { id: playlist.id }, include: { songs: true } })
    const existingIds = new Set(existing.songs.map(s => s.id))
    const toConnect = songs.filter(s => !existingIds.has(s.id)).map(s => ({ id: s.id }))
    if(toConnect.length) await prisma.playlist.update({ where: { id: playlist.id }, data: { songs: { connect: toConnect } } })
    results.push({ playlist: name, added: toConnect.length })
  }
  return results
}

async function main(){
  console.log('Admin setup started...')
  const userId = await ensureDemoUser()
  console.log('Using user id', userId)

  const popRes = await populateGenresFromCSVIfEmpty()
  console.log('Populate genres:', popRes)

  const genRes = await generateGenrePlaylists({ userId })
  console.log('Playlists created/updated:', genRes)

  const pls = await prisma.playlist.findMany({ include: { songs: { take: 3, include: { artist: true } } } })
  console.log('Playlists summary:')
  pls.forEach(p => console.log(`  ${p.name} (${p.songs.length})`))
  console.log('Admin setup complete.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

// at bottom of server/scripts/adminSetup.js
export async function runAdminSetup() {
  try {
    const userId = await ensureDemoUser()
    const popRes = await populateGenresFromCSVIfEmpty()
    const genRes = await generateGenrePlaylists({ userId })
    const pls = await prisma.playlist.findMany({ include: { songs: { take: 3, include: { artist: true } } } })
    return { userId, populate: popRes, playlists: genRes, summary: pls.map(p => ({ name: p.name, songs: p.songs.length })) }
  } finally {
    // do not disconnect here; caller will handle prisma lifecycle
  }
}
