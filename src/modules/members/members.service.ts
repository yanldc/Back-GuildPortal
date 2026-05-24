import { prisma } from '../../utils/prisma.js'
import { Rank, Role } from '@prisma/client'

export async function getAllMembers(isAdmin: boolean) {
  const members = await prisma.member.findMany({ orderBy: { name: 'asc' } })
  if (!isAdmin) {
    return members.map(({ email, ...rest }) => rest)
  }
  return members
}

export async function getMemberById(id: string) {
  return prisma.member.findUnique({ where: { id } })
}

export async function updateProfile(id: string, data: { name?: string; avatar?: string; class?: string; guild?: string; level?: number; altNames?: string[]; rpgProfile?: any }) {
  return prisma.member.update({ where: { id }, data })
}

export async function updateRole(id: string, data: { role?: Role; rank?: Rank }) {
  return prisma.member.update({ where: { id }, data })
}

export async function deleteMember(id: string) {
  return prisma.$transaction(async (tx) => {
    // Delete slots in requests created by this member
    const memberRequests = await tx.levelUpRequest.findMany({ where: { createdById: id }, select: { id: true } })
    const requestIds = memberRequests.map(r => r.id)
    if (requestIds.length > 0) {
      await tx.levelUpSlot.deleteMany({ where: { requestId: { in: requestIds } } })
    }

    // Delete slots this member joined in other requests
    await tx.levelUpSlot.deleteMany({ where: { joinedById: id } })
    await tx.levelUpHelper.deleteMany({ where: { memberId: id } })
    await tx.levelUpRequest.deleteMany({ where: { createdById: id } })
    await tx.eventRsvp.deleteMany({ where: { memberId: id } })
    await tx.pointTransaction.deleteMany({ where: { memberId: id } })

    // Delete bids in auctions created by this member (from other members)
    const memberAuctions = await tx.auction.findMany({ where: { createdById: id }, select: { id: true } })
    const auctionIds = memberAuctions.map(a => a.id)
    if (auctionIds.length > 0) {
      await tx.bid.deleteMany({ where: { auctionId: { in: auctionIds } } })
    }

    // Delete this member's own bids on other auctions
    await tx.bid.deleteMany({ where: { memberId: id } })
    await tx.auction.deleteMany({ where: { createdById: id } })
    await tx.member.delete({ where: { id } })
  })
}
