import { prisma } from '../../utils/prisma.js'
import { TransactionType } from '@prisma/client'
import { AppError } from '../../utils/errors.js'

export async function listTransactions(filters: { memberId?: string; type?: TransactionType; limit?: number; cursor?: string }) {
  const where: any = {}
  if (filters.memberId) where.memberId = filters.memberId
  if (filters.type) where.type = filters.type

  const take = filters.limit || 50
  const query: any = { where, orderBy: { timestamp: 'desc' }, take }

  if (filters.cursor) {
    query.cursor = { id: filters.cursor }
    query.skip = 1 // skip the cursor itself
  }

  return prisma.pointTransaction.findMany(query)
}

export async function adjustPoints(memberId: string, amount: number, reason: string, type: TransactionType) {
  return prisma.$transaction(async (tx) => {
    const member = await tx.member.findUniqueOrThrow({ where: { id: memberId } })

    if (type === 'remove' && member.points < amount) {
      throw new AppError(`Insufficient GP: member has ${member.points} but tried to remove ${amount}`)
    }

    const increment = type === 'add' ? amount : -amount
    await tx.member.update({ where: { id: memberId }, data: { points: { increment } } })
    return tx.pointTransaction.create({
      data: { memberId, memberName: member.name, amount, reason, type },
    })
  })
}

export async function bulkAdjust(memberIds: string[], amount: number, reason: string, type: TransactionType) {
  return prisma.$transaction(async (tx) => {
    const increment = type === 'add' ? amount : -amount
    for (const memberId of memberIds) {
      const member = await tx.member.findUniqueOrThrow({ where: { id: memberId } })

      if (type === 'remove' && member.points < amount) {
        throw new AppError(`Insufficient GP for ${member.name}: has ${member.points}, tried to remove ${amount}`)
      }

      await tx.member.update({ where: { id: memberId }, data: { points: { increment } } })
      await tx.pointTransaction.create({
        data: { memberId, memberName: member.name, amount, reason, type },
      })
    }
  })
}
