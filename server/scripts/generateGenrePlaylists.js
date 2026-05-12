import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/**
 * Generates playlists for the top genres in the DB.
 * - topCount: how many genre playlists to create (e.g., 8)
 * - songsPerPlaylist: how many songs to attach to each playlist
 */
async function main() {
  const topCount = 8
  const songsPerPlaylist = 40
  console.log('Scanning genres...')

  // Aggregate genre counts (ignore null/empty)
  const raw = await prisma.$queryRaw`
    SELECT genre, COUNT(*) as cnt
    FROM Song
    WHERE genre IS NOT NULL AND genre != ''
    GROUP BY genre
    ORDER BY cnt DESC
  `

  const genres = raw.map(r => ({ genre: r.genre, count: Number(r.cnt) }))
  if (!genres.length) {
    console.log('No genres found in songs. Aborting.')
    return
  }

  const topGenres = genres.slice(0, topCount).map(g => g.genre)
  console.log('Top genres:', topGenres)

  // Create or update playlists for each genre
  for (const genre of topGenres) {
    const playlistName = genre.charAt(0).toUpperCase() + genre.slice(1)
    // create playlist (if exists, skip creation)
    let playlist = await prisma.playlist.findFirst({ where: { name: playlistName } })
    if (!playlist) {
      playlist = await prisma.playlist.create({
        data: {
          name: playlistName,
          description: `A ${playlistName} playlist generated from FMA genres`,
          userId: 1
        }
      })
      console.log('Created playlist:', playlistName)
    } else {
      console.log('Playlist already exists:', playlistName)
    }

    // find songs for this genre (randomize order)
    const songs = await prisma.song.findMany({
      where: { genre },
      take: songsPerPlaylist,
      orderBy: { id: 'asc' } // deterministic; change to random if desired
    })

    // connect songs to playlist (avoid duplicates)
    const connectOps = songs.map(s => ({ id: s.id }))
    if (connectOps.length) {
      await prisma.playlist.update({
        where: { id: playlist.id },
        data: {
          songs: {
            connect: connectOps
          }
        }
      })
      console.log(`Added ${connectOps.length} songs to ${playlistName}`)
    } else {
      console.log(`No songs found for genre ${genre}`)
    }
  }

  console.log('✅ Genre playlists generation complete.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
