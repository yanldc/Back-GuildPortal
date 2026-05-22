import { prisma } from '../../utils/prisma.js'
import { TransactionType } from '@prisma/client'

export async function listTransactions(filters: { memberId?: string; type?: TransactionType }) {
  const where: any = {}
  if (filters.memberId) where.memberId = filters.memberId
  if (filters.type) where.type = filters.type
  return prisma.pointTransaction.findMany({ where, orderBy: { timestamp: 'desc' } })
}

export async function adjustPoints(memberId: string, amount: number, reason: string, type: TransactionType) {
  return prisma.$transaction(async (tx) => {
    const member = await tx.member.findUniqueOrThrow({ where: { id: memberId } })
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
      await tx.member.update({ where: { id: memberId }, data: { points: { increment } } })
      await tx.pointTransaction.create({
        data: { memberId, memberName: member.name, amount, reason, type },
      })
    }
  })
}
