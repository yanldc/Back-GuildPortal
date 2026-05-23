import { prisma } from '../../utils/prisma.js'
import { AuctionStatus, ItemGrade } from '@prisma/client'
import { AppError } from '../../utils/errors.js'

export async function listAuctions(filters: { status?: AuctionStatus; grade?: ItemGrade; limit?: number; cursor?: string }) {
  // Auto-finish expired auctions
  await prisma.auction.updateMany({
    where: { status: 'active', endAt: { lte: new Date() } },
    data: { status: 'finished' },
  })

  const where: any = {}
  if (filters.status) where.status = filters.status
  if (filters.grade) where.itemGrade = filters.grade

  const take = filters.limit || 20
  const query: any = { where, include: { bids: true }, orderBy: { createdAt: 'desc' }, take }

  if (filters.cursor) {
    query.cursor = { id: filters.cursor }
    query.skip = 1
  }

  return prisma.auction.findMany(query)
}

export async function getAuctionById(id: string) {
  // Auto-finish if expired
  await prisma.auction.updateMany({
    where: { id, status: 'active', endAt: { lte: new Date() } },
    data: { status: 'finished' },
  })
  return prisma.auction.findUnique({ where: { id }, include: { bids: { orderBy: { amount: 'desc' } } } })
}

export async function createAuction(data: {
  itemName: string; itemGrade: ItemGrade; minBid: number; endAt: string;
  imageUrl: string; description?: string; allowedClasses: string[]
}, createdById: string) {
  return prisma.auction.create({
    data: {
      ...data,
      endAt: new Date(data.endAt),
      currentBid: data.minBid,
      createdById,
    },
  })
}

export async function placeBid(auctionId: string, memberId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    // Lock auction row to prevent race conditions
    const [auction] = await tx.$queryRawUnsafe<any[]>(
      `SELECT * FROM "Auction" WHERE id = $1 FOR UPDATE`, auctionId
    )
    if (!auction || auction.status !== 'active') throw new AppError('Auction not active')
    if (new Date() > new Date(auction.endAt)) throw new AppError('Auction has ended')
    if (amount <= auction.currentBid) throw new AppError('Bid must be higher than current bid')

    // Lock member row to prevent balance race condition
    const [member] = await tx.$queryRawUnsafe<any[]>(
      `SELECT * FROM "Member" WHERE id = $1 FOR UPDATE`, memberId
    )
    if (!member) throw new AppError('Member not found')
    if (member.points < amount) throw new AppError('Insufficient GP balance')

    // Check allowed classes
    if (!auction.allowedClasses.includes('any') && !auction.allowedClasses.includes(member.class)) {
      throw new AppError('Your class is not allowed for this auction')
    }

    // Spam protection: 30s between bids
    const lastBid = await tx.bid.findFirst({
      where: { auctionId, memberId },
      orderBy: { timestamp: 'desc' },
    })
    if (lastBid && Date.now() - lastBid.timestamp.getTime() < 30000) {
      throw new AppError('Wait 30 seconds between bids')
    }

    // Refund previous winner
    if (auction.currentWinnerId) {
      await tx.member.update({
        where: { id: auction.currentWinnerId },
        data: { points: { increment: auction.currentBid } },
      })
      await tx.pointTransaction.create({
        data: {
          memberId: auction.currentWinnerId,
          memberName: auction.currentWinnerName!,
          amount: auction.currentBid,
          reason: `Refund: outbid on ${auction.itemName}`,
          type: 'add',
        },
      })
    }

    // Deduct from new bidder
    await tx.member.update({
      where: { id: memberId },
      data: { points: { decrement: amount } },
    })
    await tx.pointTransaction.create({
      data: {
        memberId,
        memberName: member.name,
        amount,
        reason: `Bid on ${auction.itemName}`,
        type: 'remove',
      },
    })

    // Create bid record
    await tx.bid.create({
      data: { auctionId, memberId, memberName: member.name, amount },
    })

    // Extend auction by 30s if bid is placed in the last 30 seconds
    const timeRemaining = new Date(auction.endAt).getTime() - Date.now()
    const newEndAt = timeRemaining <= 30000
      ? new Date(Date.now() + 30000)
      : undefined

    // Update auction
    return tx.auction.update({
      where: { id: auctionId },
      data: {
        currentBid: amount,
        currentWinnerId: memberId,
        currentWinnerName: member.name,
        ...(newEndAt ? { endAt: newEndAt } : {}),
      },
    })
  })
}
