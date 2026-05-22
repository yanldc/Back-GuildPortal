import { FastifyInstance } from 'fastify'
import { authGuard } from '../../middlewares/authGuard.js'
import { roleGuard } from '../../middlewares/roleGuard.js'
import * as controller from './transactions.controller.js'

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)

  app.get('/transactions', controller.listTransactions)
  app.post('/transactions/adjust', { preHandler: [roleGuard] }, controller.adjustPoints)
  app.post('/transactions/bulk', { preHandler: [roleGuard] }, controller.bulkAdjust)
}
