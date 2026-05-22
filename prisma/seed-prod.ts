import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL

  if (!adminEmail) {
    console.log('⚠️  ADMIN_EMAIL not set in .env — skipping production seed')
    return
  }

  const existing = await prisma.member.findUnique({ where: { email: adminEmail } })

  if (existing) {
    console.log(`✅ Admin already exists: ${existing.name} (${existing.email})`)
    return
  }

  const admin = await prisma.member.create({
    data: {
      name: adminEmail.split('@')[0],
      email: adminEmail,
      avatar: '',
      class: 'Vanguard',
      rank: 'Leader',
      role: 'admin',
      points: 500,
    },
  })

  console.log(`✅ Admin created: ${admin.name} (${admin.email})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
