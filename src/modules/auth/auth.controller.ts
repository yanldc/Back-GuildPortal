import { FastifyRequest, FastifyReply } from 'fastify'
import { OAuth2Client } from 'google-auth-library'
import { googleLoginSchema } from './auth.schema.js'
import { loginWithGoogle, getMemberById } from './auth.service.js'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/errors.js'
import { prisma } from '../../utils/prisma.js'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' as const : 'strict' as const,
  path: '/',
  maxAge: 60 * 60, // 1 hour in seconds
}

export async function googleLogin(request: FastifyRequest, reply: FastifyReply) {
  const { token } = googleLoginSchema.parse(request.body)

  let email: string, name: string, picture: string

  if (env.NODE_ENV === 'development') {
    // Dev mode: token is treated as email, but ONLY if the email exists in DB or matches ADMIN_EMAIL
    email = token
    const existingMember = await prisma.member.findUnique({ where: { email } })
    const existingInvite = await prisma.invite.findUnique({ where: { email } })
    const isAdminEmail = env.ADMIN_EMAIL && email === env.ADMIN_EMAIL

    if (!existingMember && !existingInvite && !isAdminEmail) {
      throw new AppError('Dev bypass restricted: email not found in DB or invites', 403)
    }

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
    { expiresIn: '1h' }
  )

  reply.setCookie('gp_token', jwt, COOKIE_OPTIONS)
  return reply.send({ user: member })
}

export async function refreshToken(request: FastifyRequest, reply: FastifyReply) {
  // Re-read role/rank from DB to ensure fresh claims
  const member = await prisma.member.findUnique({ where: { id: request.user.id } })
  if (!member) throw new AppError('Member not found', 404)

  const jwt = request.server.jwt.sign(
    { id: member.id, email: member.email, role: member.role, rank: member.rank },
    { expiresIn: '1h' }
  )

  reply.setCookie('gp_token', jwt, COOKIE_OPTIONS)
  return reply.send({ user: member })
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  const member = await getMemberById(request.user.id)
  return reply.send(member)
}

export async function logoutHandler(_request: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie('gp_token', { path: '/' })
  return reply.status(204).send()
}
