import { FastifyInstance } from 'fastify'
import { authGuard } from '../../middlewares/authGuard.js'
import { roleGuard } from '../../middlewares/roleGuard.js'
import * as controller from './events.controller.js'

export async function eventsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)

  app.get('/events', controller.listEvents)
  app.post('/events', { preHandler: [roleGuard] }, controller.createEvent)
  app.put('/events/:id', { preHandler: [roleGuard] }, controller.updateEvent)
  app.delete('/events/:id', { preHandler: [roleGuard] }, controller.deleteEvent)
  app.post('/events/:id/rsvp', controller.toggleRsvp)
}
