import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (reverse-dependency order)
  await prisma.listeningHistory.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.song.deleteMany();
  await prisma.podcast.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.user.deleteMany();

  // Create default user
  const user = await prisma.user.create({
    data: {
      email: 'user@spotify.com',
      name: 'My Profile',
      avatar: null,
      bio: null,
      isPremium: false
    }
  });

  console.log('✅ Database initialized with default user!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
