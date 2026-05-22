import { FastifyRequest, FastifyReply } from 'fastify'
import { createEventSchema, updateEventSchema, eventIdParam, eventQuerySchema } from './events.schema.js'
import * as service from './events.service.js'

export async function listEvents(request: FastifyRequest, reply: FastifyReply) {
  const filters = eventQuerySchema.parse(request.query)
  return reply.send(await service.listEvents(filters as any))
}

export async function createEvent(request: FastifyRequest, reply: FastifyReply) {
  const data = createEventSchema.parse(request.body)
  return reply.status(201).send(await service.createEvent(data))
}

export async function updateEvent(request: FastifyRequest, reply: FastifyReply) {
  const { id } = eventIdParam.parse(request.params)
  const data = updateEventSchema.parse(request.body)
  return reply.send(await service.updateEvent(id, data))
}

export async function deleteEvent(request: FastifyRequest, reply: FastifyReply) {
  const { id } = eventIdParam.parse(request.params)
  await service.deleteEvent(id)
  return reply.status(204).send()
}

export async function toggleRsvp(request: FastifyRequest, reply: FastifyReply) {
  const { id } = eventIdParam.parse(request.params)
  return reply.send(await service.toggleRsvp(id, request.user.id))
}
