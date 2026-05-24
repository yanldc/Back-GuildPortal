import { FastifyInstance } from 'fastify'
import { authGuard } from '../../middlewares/authGuard.js'
import { roleGuard } from '../../middlewares/roleGuard.js'
import { z } from 'zod'
import { prisma } from '../../utils/prisma.js'
import { randomBytes } from 'crypto'
import { AppError } from '../../utils/errors.js'

const createInviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(50),
  class: z.string().max(50),
  rank: z.enum(['Leader', 'Officer', 'Elite', 'Member', 'Recruit']).default('Recruit'),
})

export async function invitesRoutes(app: FastifyInstance) {
  // Public: verify invite code (no auth required)
  app.get('/invites/verify/:code', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const { code } = z.object({ code: z.string().min(1) }).parse(request.params)
    const invite = await prisma.invite.findUnique({ where: { code } })
    if (!invite) throw new AppError('Invalid invite code', 404)
    return reply.send({ name: invite.name, class: invite.class, rank: invite.rank, code: invite.code })
  })

  // Protected routes (scoped)
  app.register(async (protectedApp) => {
    protectedApp.addHook('preHandler', authGuard)
    protectedApp.addHook('preHandler', roleGuard)

    protectedApp.get('/invites', async (_, reply) => {
      return reply.send(await prisma.invite.findMany({ orderBy: { createdAt: 'desc' } }))
    })

    protectedApp.post('/invites', async (request, reply) => {
      const data = createInviteSchema.parse(request.body)
      const code = randomBytes(16).toString('hex')
      const invite = await prisma.invite.create({ data: { ...data, code } })
      return reply.status(201).send(invite)
    })

    protectedApp.delete('/invites/:code', async (request, reply) => {
      const { code } = z.object({ code: z.string() }).parse(request.params)
      await prisma.invite.delete({ where: { code } })
      return reply.status(204).send()
    })
  })
}
