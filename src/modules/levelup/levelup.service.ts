import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'

export async function listRequests(weekday?: string) {
  const where: any = {}
  if (weekday) where.weekday = weekday
  return prisma.levelUpRequest.findMany({ where, include: { slots: true }, orderBy: { createdAt: 'desc' } })
}

export async function createRequest(data: { title: string; time: string; weekday: string; class: string }, memberId: string, memberName: string) {
  return prisma.levelUpRequest.create({
    data: { ...data, createdById: memberId, createdByName: memberName },
  })
}

export async function deleteRequest(id: string, memberId: string, isAdmin: boolean) {
  const req = await prisma.levelUpRequest.findUniqueOrThrow({ where: { id } })
  if (req.createdById !== memberId && !isAdmin) throw new AppError('Not allowed', 403)
  await prisma.levelUpSlot.deleteMany({ where: { requestId: id } })
  return prisma.levelUpRequest.delete({ where: { id } })
}

export async function joinSlot(requestId: string, memberId: string, memberName: string, characterName: string, isAlt: boolean) {
  return prisma.levelUpSlot.create({
    data: { requestId, joinedById: memberId, joinedByName: memberName, characterName, isAlt },
  })
}

export async function leaveSlot(requestId: string, memberId: string) {
  const slot = await prisma.levelUpSlot.findFirst({ where: { requestId, joinedById: memberId } })
  if (!slot) throw new AppError('Slot not found')
  return prisma.levelUpSlot.delete({ where: { id: slot.id } })
}

export async function listHelpers(weekday?: string) {
  const where: any = {}
  if (weekday) where.weekday = weekday
  return prisma.levelUpHelper.findMany({ where, orderBy: { createdAt: 'desc' } })
}

export async function createHelper(data: { characterName: string; class: string; isAlt: boolean; availability: string; weekday: string }, memberId: string, memberName: string) {
  return prisma.levelUpHelper.create({
    data: { ...data, memberId, memberOriginalName: memberName },
  })
}

export async function deleteHelper(id: string, memberId: string, isAdmin: boolean) {
  const helper = await prisma.levelUpHelper.findUniqueOrThrow({ where: { id } })
  if (helper.memberId !== memberId && !isAdmin) throw new AppError('Not allowed', 403)
  return prisma.levelUpHelper.delete({ where: { id } })
}
