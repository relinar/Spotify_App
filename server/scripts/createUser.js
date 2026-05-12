// server/scripts/createUser.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(){
  const user = await prisma.user.create({
    data: { email: 'demo@spotify.local', name: 'Demo User' }
  })
  console.log('Created user', user.id)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
