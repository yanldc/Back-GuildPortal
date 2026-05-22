import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean
  await prisma.levelUpSlot.deleteMany()
  await prisma.levelUpHelper.deleteMany()
  await prisma.levelUpRequest.deleteMany()
  await prisma.eventRsvp.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.pointTransaction.deleteMany()
  await prisma.auction.deleteMany()
  await prisma.guildEvent.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.member.deleteMany()

  // Members
  const members = await Promise.all([
    prisma.member.create({
      data: { name: 'Kael', email: 'kael@guild.com', avatar: '/avatars/kael.png', class: 'Vanguard', level: 60, rank: 'Leader', role: 'admin', points: 500, altNames: ['KaelAlt'] },
    }),
    prisma.member.create({
      data: { name: 'Lyra', email: 'lyra@guild.com', avatar: '/avatars/lyra.png', class: 'Elementalist', level: 60, rank: 'Officer', role: 'admin', points: 350, altNames: [] },
    }),
    prisma.member.create({
      data: { name: 'Draven', email: 'draven@guild.com', avatar: '/avatars/draven.png', class: 'Assassin', level: 58, rank: 'Elite', role: 'member', points: 200, altNames: ['DravenShadow'] },
    }),
    prisma.member.create({
      data: { name: 'Seraph', email: 'seraph@guild.com', avatar: '/avatars/seraph.png', class: 'Divine Caster', level: 60, rank: 'Member', role: 'member', points: 150, altNames: [] },
    }),
    prisma.member.create({
      data: { name: 'Ragnar', email: 'ragnar@guild.com', avatar: '/avatars/ragnar.png', class: 'Berserker', level: 55, rank: 'Member', role: 'member', points: 100, altNames: ['RagnarII'] },
    }),
    prisma.member.create({
      data: { name: 'Nova', email: 'nova@guild.com', avatar: '/avatars/nova.png', class: 'Gunslinger', level: 52, rank: 'Recruit', role: 'member', points: 150, altNames: [] },
    }),
  ])

  const [kael, lyra, draven, seraph, ragnar, nova] = members

  // Auctions
  const auction1 = await prisma.auction.create({
    data: {
      itemName: 'Blade of the Fallen King', itemGrade: 'legendary', minBid: 50, currentBid: 120,
      currentWinnerId: draven.id, currentWinnerName: 'Draven',
      endAt: new Date(Date.now() + 86400000 * 2), createdById: kael.id, status: 'active',
      imageUrl: '/items/blade.png', description: 'Legendary sword with lifesteal', allowedClasses: ['any'],
    },
  })

  await prisma.auction.create({
    data: {
      itemName: 'Shadow Cloak', itemGrade: 'heroic', minBid: 30, currentBid: 30,
      endAt: new Date(Date.now() + 86400000), createdById: kael.id, status: 'active',
      imageUrl: '/items/cloak.png', allowedClasses: ['Assassin', 'Night Ranger'],
    },
  })

  await prisma.auction.create({
    data: {
      itemName: 'Staff of Eternity', itemGrade: 'legendary', minBid: 80, currentBid: 80,
      endAt: new Date(Date.now() + 86400000 * 3), createdById: lyra.id, status: 'active',
      imageUrl: '/items/staff.png', allowedClasses: ['Elementalist', 'Divine Caster'],
    },
  })

  await prisma.auction.create({
    data: {
      itemName: 'Iron Shield', itemGrade: 'rare', minBid: 20, currentBid: 45,
      currentWinnerId: ragnar.id, currentWinnerName: 'Ragnar',
      endAt: new Date(Date.now() - 86400000), createdById: kael.id, status: 'finished',
      imageUrl: '/items/shield.png', allowedClasses: ['any'],
    },
  })

  // Bids
  await prisma.bid.createMany({
    data: [
      { auctionId: auction1.id, memberId: seraph.id, memberName: 'Seraph', amount: 60 },
      { auctionId: auction1.id, memberId: draven.id, memberName: 'Draven', amount: 120 },
    ],
  })

  // Events
  await prisma.guildEvent.createMany({
    data: [
      { title: 'Daily Rift', type: 'rift', description: 'Daily rift run for materials', date: '2025-01-20', weekday: 'Every day', time: '21:00', rewards: ['Rift Stones', 'EXP'] },
      { title: 'World Boss T3', type: 'world_boss', description: 'Tier 3 world boss spawn', date: '2025-01-22', weekday: 'Wednesday', time: '22:30', rewards: ['Legendary Loot', 'GP +20'] },
      { title: 'GvG Saturday', type: 'clash', description: 'Guild vs Guild clash', date: '2025-01-25', weekday: 'Saturday', time: '20:00', rewards: ['GP +30', 'Honor Points'] },
      { title: 'Raid Sunday', type: 'guild_dungeon', description: 'Weekly guild dungeon clear', date: '2025-01-26', weekday: 'Sunday', time: '19:00', rewards: ['Heroic Gear', 'GP +15'] },
    ],
  })

  // Transactions
  await prisma.pointTransaction.createMany({
    data: [
      { memberId: kael.id, memberName: 'Kael', amount: 30, reason: 'GvG participation', type: 'add' },
      { memberId: draven.id, memberName: 'Draven', amount: 120, reason: 'Bid on Blade of the Fallen King', type: 'remove' },
      { memberId: seraph.id, memberName: 'Seraph', amount: 60, reason: 'Refund: outbid on Blade of the Fallen King', type: 'add' },
      { memberId: ragnar.id, memberName: 'Ragnar', amount: 20, reason: 'Event attendance', type: 'add' },
    ],
  })

  // Level Up Requests
  const req1 = await prisma.levelUpRequest.create({
    data: { title: 'Need help leveling alt', time: '20:00', weekday: 'Monday', createdById: draven.id, createdByName: 'Draven', class: 'Assassin' },
  })
  const req2 = await prisma.levelUpRequest.create({
    data: { title: 'Grinding to 60', time: '21:00', weekday: 'Wednesday', createdById: ragnar.id, createdByName: 'Ragnar', class: 'Berserker' },
  })
  const req3 = await prisma.levelUpRequest.create({
    data: { title: 'Alt Gunslinger leveling', time: '19:30', weekday: 'Friday', createdById: nova.id, createdByName: 'Nova', class: 'Gunslinger' },
  })

  // Slots
  await prisma.levelUpSlot.createMany({
    data: [
      { requestId: req1.id, joinedById: kael.id, joinedByName: 'Kael', characterName: 'KaelAlt', isAlt: true },
      { requestId: req2.id, joinedById: seraph.id, joinedByName: 'Seraph', characterName: 'Seraph', isAlt: false },
    ],
  })

  // Helpers
  await prisma.levelUpHelper.createMany({
    data: [
      { memberId: kael.id, memberOriginalName: 'Kael', characterName: 'KaelAlt', class: 'Vanguard', isAlt: true, availability: '20:00-23:00', weekday: 'Monday' },
      { memberId: lyra.id, memberOriginalName: 'Lyra', characterName: 'Lyra', class: 'Elementalist', isAlt: false, availability: '19:00-22:00', weekday: 'Wednesday' },
      { memberId: seraph.id, memberOriginalName: 'Seraph', characterName: 'Seraph', class: 'Divine Caster', isAlt: false, availability: '18:00-21:00', weekday: 'Friday' },
    ],
  })

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
