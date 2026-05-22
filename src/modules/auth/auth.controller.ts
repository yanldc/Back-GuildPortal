import { FastifyRequest, FastifyReply } from 'fastify'
import { OAuth2Client } from 'google-auth-library'
import { googleLoginSchema } from './auth.schema.js'
import { loginWithGoogle, getMemberById } from './auth.service.js'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/errors.js'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

export async function googleLogin(request: FastifyRequest, reply: FastifyReply) {
  const { token } = googleLoginSchema.parse(request.body)

  let email: string, name: string, picture: string

  if (env.NODE_ENV === 'development') {
    // Dev mode: token é tratado como email direto
    // Só aceita emails que já existem no banco (impede acesso arbitrário)
    email = token
    name = token.split('@')[0]
    picture = ''
    request.log.warn(`⚠️  Dev bypass login: ${email}`)
  } else {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID,
    }).catch(() => { throw new AppError('Invalid Google token', 401) })

    const payload = ticket.getPayload()
    if (!payload?.email) throw new AppError('Invalid Google token', 401)

    email = payload.email
    name = payload.name ?? ''
    picture = payload.picture ?? ''
  }

  const member = await loginWithGoogle(email, name, picture)

  const jwt = request.server.jwt.sign(
    { id: member.id, email: member.email, role: member.role, rank: member.rank },
    { expiresIn: '7d' }
  )

  return reply.send({ token: jwt, user: member })
}

export async function refreshToken(request: FastifyRequest, reply: FastifyReply) {
  const { id, email, role, rank } = request.user
  const jwt = request.server.jwt.sign({ id, email, role, rank }, { expiresIn: '7d' })
  return reply.send({ token: jwt })
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  const member = await getMemberById(request.user.id)
  return reply.send(member)
}
