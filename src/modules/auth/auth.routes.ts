import { FastifyInstance } from 'fastify'
import { googleLogin, refreshToken, getMe, logoutHandler } from './auth.controller.js'
import { authGuard } from '../../middlewares/authGuard.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/google', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  }, googleLogin)
  app.post('/auth/refresh', { preHandler: [authGuard] }, refreshToken)
  app.get('/auth/me', { preHandler: [authGuard] }, getMe)
  app.post('/auth/logout', logoutHandler)
}
