import { FastifyRequest, FastifyReply } from 'fastify'

export async function roleGuard(request: FastifyRequest, reply: FastifyReply) {
  if (request.user.role !== 'admin') {
    reply.status(403).send({ error: true, message: 'Forbidden: admin only', statusCode: 403 })
  }
}
