import { FastifyRequest, FastifyReply } from 'fastify'

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Try cookie first, then fallback to Authorization header for API clients
    const tokenFromCookie = request.cookies?.gp_token
    const authHeader = request.headers.authorization

    if (tokenFromCookie) {
      request.user = request.server.jwt.verify(tokenFromCookie)
    } else if (authHeader?.startsWith('Bearer ')) {
      request.user = request.server.jwt.verify(authHeader.slice(7))
    } else {
      throw new Error('No token')
    }
  } catch {
    reply.status(401).send({ error: true, message: 'Unauthorized', statusCode: 401 })
  }
}
