import { FastifyInstance } from 'fastify'
import { authGuard } from '../../middlewares/authGuard.js'
import { roleGuard } from '../../middlewares/roleGuard.js'
import { z } from 'zod'
import { prisma } from '../../utils/prisma.js'
import { randomBytes } from 'crypto'

const createInviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  class: z.string(),
  rank: z.enum(['Leader', 'Officer', 'Elite', 'Member', 'Recruit']).default('Recruit'),
})

export async function invitesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)
  app.addHook('preHandler', roleGuard)

  app.get('/invites', async (_, reply) => {
    return reply.send(await prisma.invite.findMany({ orderBy: { createdAt: 'desc' } }))
  })

  app.post('/invites', async (request, reply) => {
    const data = createInviteSchema.parse(request.body)
    const code = randomBytes(8).toString('hex')
    const invite = await prisma.invite.create({ data: { ...data, code } })
    return reply.status(201).send(invite)
  })

  app.delete('/invites/:code', async (request, reply) => {
    const { code } = z.object({ code: z.string() }).parse(request.params)
    await prisma.invite.delete({ where: { code } })
    return reply.status(204).send()
  })
}
