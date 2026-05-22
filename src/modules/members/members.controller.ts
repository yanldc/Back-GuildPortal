import { FastifyRequest, FastifyReply } from 'fastify'
import { memberIdParam, updateProfileSchema, updateRoleSchema } from './members.schema.js'
import * as service from './members.service.js'
import { ForbiddenError } from '../../utils/errors.js'

export async function listMembers(request: FastifyRequest, reply: FastifyReply) {
  const members = await service.getAllMembers(request.user.role === 'admin')
  return reply.send(members)
}

export async function getMember(request: FastifyRequest, reply: FastifyReply) {
  const { id } = memberIdParam.parse(request.params)
  const member = await service.getMemberById(id)
  return reply.send(member)
}

export async function updateProfile(request: FastifyRequest, reply: FastifyReply) {
  const { id } = memberIdParam.parse(request.params)
  if (request.user.id !== id && request.user.role !== 'admin') throw new ForbiddenError()
  const data = updateProfileSchema.parse(request.body)
  const member = await service.updateProfile(id, data)
  return reply.send(member)
}

export async function updateRole(request: FastifyRequest, reply: FastifyReply) {
  const { id } = memberIdParam.parse(request.params)
  const data = updateRoleSchema.parse(request.body)
  const member = await service.updateRole(id, data as any)
  return reply.send(member)
}
