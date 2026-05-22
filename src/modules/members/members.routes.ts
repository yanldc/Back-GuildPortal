import { FastifyInstance } from 'fastify'
import { authGuard } from '../../middlewares/authGuard.js'
import { roleGuard } from '../../middlewares/roleGuard.js'
import * as controller from './members.controller.js'

export async function membersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)

  app.get('/members', controller.listMembers)
  app.get('/members/:id', controller.getMember)
  app.put('/members/:id/profile', controller.updateProfile)
  app.put('/members/:id/role', { preHandler: [roleGuard] }, controller.updateRole)
}
