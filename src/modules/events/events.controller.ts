import { FastifyRequest, FastifyReply } from 'fastify'
import { createEventSchema, updateEventSchema, eventIdParam, eventQuerySchema } from './events.schema.js'
import * as service from './events.service.js'
import { broadcast } from '../../ws/hub.js'

export async function listEvents(request: FastifyRequest, reply: FastifyReply) {
  const filters = eventQuerySchema.parse(request.query)
  return reply.send(await service.listEvents(filters as any))
}

export async function createEvent(request: FastifyRequest, reply: FastifyReply) {
  const data = createEventSchema.parse(request.body)
  const event = await service.createEvent(data)
  broadcast('events:updated')
  return reply.status(201).send(event)
}

export async function updateEvent(request: FastifyRequest, reply: FastifyReply) {
  const { id } = eventIdParam.parse(request.params)
  const data = updateEventSchema.parse(request.body)
  const event = await service.updateEvent(id, data)
  broadcast('events:updated')
  return reply.send(event)
}

export async function deleteEvent(request: FastifyRequest, reply: FastifyReply) {
  const { id } = eventIdParam.parse(request.params)
  await service.deleteEvent(id)
  broadcast('events:updated')
  return reply.status(204).send()
}

export async function toggleRsvp(request: FastifyRequest, reply: FastifyReply) {
  const { id } = eventIdParam.parse(request.params)
  const result = await service.toggleRsvp(id, request.user.id)
  broadcast('events:updated')
  return reply.send(result)
}
