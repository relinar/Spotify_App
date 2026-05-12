import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main(){
  const count = await prisma.user.count()
  console.log('Users in DB:', count)
  const users = await prisma.user.findMany({ take: 20, orderBy: { id: 'asc' } })
  users.forEach(u => console.log(`  id=${u.id}  email=${u.email}  name=${u.name}`))
}
main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
