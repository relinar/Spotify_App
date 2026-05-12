// server/scripts/listGenres.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(){
  const total = await prisma.song.count()
  const withGenre = await prisma.song.count({ where: { genre: { not: null } } })
  const nonEmpty = await prisma.$queryRaw`SELECT COUNT(*) AS cnt FROM Song WHERE genre IS NOT NULL AND genre != ''`
  const distinct = await prisma.$queryRaw`SELECT genre FROM Song WHERE genre IS NOT NULL AND genre != '' GROUP BY genre LIMIT 50`

  console.log('Total songs:', total)
  console.log('Songs with genre not null:', withGenre)
  console.log('Songs with non-empty genre (SQL):', nonEmpty[0]?.cnt ?? nonEmpty)
  console.log('Sample distinct genres (up to 50):')
  distinct.forEach((r,i)=> console.log(i+1, r.genre))
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
