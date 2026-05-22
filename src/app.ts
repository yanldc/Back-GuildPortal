import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { env } from './config/env.js'
import { AppError } from './utils/errors.js'
import { ZodError } from 'zod'

import { authRoutes } from './modules/auth/auth.routes.js'
import { membersRoutes } from './modules/members/members.routes.js'
import { auctionsRoutes } from './modules/auctions/auctions.routes.js'
import { eventsRoutes } from './modules/events/events.routes.js'
import { transactionsRoutes } from './modules/transactions/transactions.routes.js'
import { levelupRoutes } from './modules/levelup/levelup.routes.js'
import { invitesRoutes } from './modules/invites/invites.routes.js'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: 'http://localhost:3003' })
  app.register(jwt, { secret: env.JWT_SECRET })

  // Routes
  app.register(authRoutes)
  app.register(membersRoutes)
  app.register(auctionsRoutes)
  app.register(eventsRoutes)
  app.register(transactionsRoutes)
  app.register(levelupRoutes)
  app.register(invitesRoutes)

  // Global error handler
  app.setErrorHandler((error, _, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: true, message: error.message, statusCode: error.statusCode })
    }
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: true, message: error.errors[0].message, statusCode: 400 })
    }
    app.log.error(error)
    return reply.status(500).send({ error: true, message: 'Internal server error', statusCode: 500 })
  })

  return app
}
