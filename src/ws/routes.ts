import { FastifyInstance } from 'fastify'
import { addClient } from './hub.js'

export async function wsRoutes(app: FastifyInstance) {
  app.get('/ws', { websocket: true }, (socket, _req) => {
    addClient(socket)
    socket.send(JSON.stringify({ event: 'connected' }))
  })
}
