import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../utils/prisma.js'

export async function roleGuard(request: FastifyRequest, reply: FastifyReply) {
  // Always check the DB for current role to prevent stale JWT claims
  const member = await prisma.member.findUnique({
    where: { id: request.user.id },
    select: { role: true },
  })

  if (!member || member.role !== 'admin') {
    reply.status(403).send({ error: true, message: 'Forbidden: admin only', statusCode: 403 })
  }
}
