import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import websocket from '@fastify/websocket'
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
import { wsRoutes } from './ws/routes.js'

export function buildApp() {
  const app = Fastify({ logger: true })

  // Security: block wildcard CORS in production
  const corsOrigin = env.CORS_ORIGIN
  if (env.NODE_ENV === 'production' && corsOrigin === '*') {
    throw new Error('FATAL: CORS_ORIGIN cannot be "*" in production')
  }

  app.register(cors, { origin: corsOrigin, credentials: true })
  app.register(cookie)
  app.register(websocket)
  app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: 'gp_token', signed: false },
  })
  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => {
      // Rate limit by user ID if authenticated, otherwise by IP
      return (request.user as any)?.id || request.ip
    },
  })

  // Health check (public)
  app.get('/health', async (_, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Routes
  app.register(authRoutes)
  app.register(membersRoutes)
  app.register(auctionsRoutes)
  app.register(eventsRoutes)
  app.register(transactionsRoutes)
  app.register(levelupRoutes)
  app.register(invitesRoutes)
  app.register(wsRoutes)

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
