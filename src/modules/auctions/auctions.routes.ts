import { FastifyInstance } from 'fastify'
import { authGuard } from '../../middlewares/authGuard.js'
import { roleGuard } from '../../middlewares/roleGuard.js'
import * as controller from './auctions.controller.js'

export async function auctionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)

  app.get('/auctions', controller.listAuctions)
  app.get('/auctions/:id', controller.getAuction)
  app.post('/auctions', { preHandler: [roleGuard] }, controller.createAuction)
  app.post('/auctions/:id/bid', controller.placeBid)
}
