import { FastifyRequest, FastifyReply } from 'fastify'
import { createRequestSchema, joinSlotSchema, createHelperSchema, idParam, weekdayQuery } from './levelup.schema.js'
import * as service from './levelup.service.js'
import { prisma } from '../../utils/prisma.js'

export async function listRequests(request: FastifyRequest, reply: FastifyReply) {
  const { weekday } = weekdayQuery.parse(request.query)
  return reply.send(await service.listRequests(weekday))
}

export async function createRequest(request: FastifyRequest, reply: FastifyReply) {
  const data = createRequestSchema.parse(request.body)
  const member = await prisma.member.findUniqueOrThrow({ where: { id: request.user.id } })
  return reply.status(201).send(await service.createRequest(data, request.user.id, member.name))
}

export async function deleteRequest(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idParam.parse(request.params)
  await service.deleteRequest(id, request.user.id, request.user.role === 'admin')
  return reply.status(204).send()
}

export async function joinSlot(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idParam.parse(request.params)
  const { characterName, isAlt } = joinSlotSchema.parse(request.body)
  const member = await prisma.member.findUniqueOrThrow({ where: { id: request.user.id } })
  return reply.status(201).send(await service.joinSlot(id, request.user.id, member.name, characterName, isAlt))
}

export async function leaveSlot(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idParam.parse(request.params)
  await service.leaveSlot(id, request.user.id)
  return reply.status(204).send()
}

export async function listHelpers(request: FastifyRequest, reply: FastifyReply) {
  const { weekday } = weekdayQuery.parse(request.query)
  return reply.send(await service.listHelpers(weekday))
}

export async function createHelper(request: FastifyRequest, reply: FastifyReply) {
  const data = createHelperSchema.parse(request.body)
  const member = await prisma.member.findUniqueOrThrow({ where: { id: request.user.id } })
  return reply.status(201).send(await service.createHelper(data, request.user.id, member.name))
}

export async function deleteHelper(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idParam.parse(request.params)
  await service.deleteHelper(id, request.user.id, request.user.role === 'admin')
  return reply.status(204).send()
}
