// server/scripts/populateGenresFromCSV.js
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const META_DIR = path.join(process.cwd(), 'fma', 'fma_metadata')
const CSV = path.join(META_DIR, 'raw_tracks.csv')

async function loadCSV(){
  return new Promise((res, rej)=>{
    const rows=[]
    fs.createReadStream(CSV)
      .pipe(parse({ columns:true, skip_empty_lines:true }))
      .on('data', r=>rows.push(r))
      .on('end', ()=>res(rows))
      .on('error', rej)
  })
}

async function main(){
  const rows = await loadCSV()
  // This assumes import created songs in the same order as rows and named audio files song_0..song_N
  const songs = await prisma.song.findMany({ orderBy: { id: 'asc' } })
  const count = Math.min(rows.length, songs.length)
  for(let i=0;i<count;i++){
    const row = rows[i]
    const song = songs[i]
    const genre = row.genre_top || row.genre || null
    if(genre && (!song.genre || song.genre === '')){
      await prisma.song.update({ where: { id: song.id }, data: { genre } })
    }
    if(i % 500 === 0) console.log('Updated', i)
  }
  console.log('Done populating genres.')
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
