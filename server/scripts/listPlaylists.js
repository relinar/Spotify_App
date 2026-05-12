import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(){
  const pls = await prisma.playlist.findMany({
    include: { songs: { take: 5, include: { artist: true } } },
    orderBy: { id: 'asc' }
  })
  for(const p of pls){
    console.log(`Playlist ${p.id} - ${p.name} (${p.songs.length} songs)`)
    for(const s of p.songs){
      console.log(`  • ${s.title} — ${s.artist?.name || 'Unknown'}`)
    }
  }
  if(pls.length === 0) console.log('No playlists found.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
