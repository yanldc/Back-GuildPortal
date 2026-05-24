import { prisma } from '../../utils/prisma.js'
import { ForbiddenError } from '../../utils/errors.js'
import { env } from '../../config/env.js'

export async function loginWithGoogle(email: string, name: string, avatar: string, inviteCode?: string) {
  let member = await prisma.member.findUnique({ where: { email } })

  if (!member) {
    // Auto-create admin if ADMIN_EMAIL matches
    if (env.ADMIN_EMAIL && email === env.ADMIN_EMAIL) {
      member = await prisma.member.create({
        data: {
          name: name || email.split('@')[0],
          email,
          avatar: avatar || '',
          class: 'Vanguard',
          rank: 'Leader',
          role: 'admin',
          points: 0,
        },
      })
      return member
    }

    // Try to find invite by code first, then by email
    let invite = null
    if (inviteCode) {
      invite = await prisma.invite.findUnique({ where: { code: inviteCode } })
    }
    if (!invite) {
      invite = await prisma.invite.findUnique({ where: { email } })
    }

    if (!invite) throw new ForbiddenError('Access restricted: no invite found for this email or code')

    member = await prisma.member.create({
      data: {
        name: invite.name,
        email,
        avatar: `/avatars/${invite.class.toLowerCase().replace(/\s+/g, '-')}.png`,
        class: invite.class,
        rank: invite.rank,
        role: 'member',
      },
    })

    await prisma.invite.delete({ where: { id: invite.id } })
  }

  return member
}

export async function getMemberById(id: string) {
  return prisma.member.findUnique({ where: { id } })
}
