import { FastifyInstance } from 'fastify'
import { googleLogin, refreshToken, getMe } from './auth.controller.js'
import { authGuard } from '../../middlewares/authGuard.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/google', googleLogin)
  app.post('/auth/refresh', { preHandler: [authGuard] }, refreshToken)
  app.get('/auth/me', { preHandler: [authGuard] }, getMe)
}
