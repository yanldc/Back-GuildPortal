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

export async function updateProfile(id: string, data: { class?: string; guild?: string; altNames?: string[]; rpgProfile?: any }) {
  return prisma.member.update({ where: { id }, data })
}

export async function updateRole(id: string, data: { role?: Role; rank?: Rank }) {
  return prisma.member.update({ where: { id }, data })
}
