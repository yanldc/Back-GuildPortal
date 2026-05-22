import { FastifyInstance } from 'fastify'
import { authGuard } from '../../middlewares/authGuard.js'
import * as controller from './levelup.controller.js'

export async function levelupRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)

  app.get('/levelup/requests', controller.listRequests)
  app.post('/levelup/requests', controller.createRequest)
  app.delete('/levelup/requests/:id', controller.deleteRequest)
  app.post('/levelup/requests/:id/join', controller.joinSlot)
  app.delete('/levelup/requests/:id/leave', controller.leaveSlot)

  app.get('/levelup/helpers', controller.listHelpers)
  app.post('/levelup/helpers', controller.createHelper)
  app.delete('/levelup/helpers/:id', controller.deleteHelper)
}
