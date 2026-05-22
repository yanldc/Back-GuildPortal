import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string
      email: string
      role: 'admin' | 'member'
      rank: string
    }
    user: {
      id: string
      email: string
      role: 'admin' | 'member'
      rank: string
    }
  }
}
