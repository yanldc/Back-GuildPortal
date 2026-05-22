import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import * as service from './transactions.service.js'

const querySchema = z.object({
  memberId: z.string().uuid().optional(),
  type: z.enum(['add', 'remove']).optional(),
})

const adjustSchema = z.object({
  memberId: z.string().uuid(),
  amount: z.number().int().positive(),
  reason: z.string().min(1),
  type: z.enum(['add', 'remove']),
})

const bulkSchema = z.object({
  memberIds: z.array(z.string().uuid()).min(1),
  amount: z.number().int().positive(),
  reason: z.string().min(1),
  type: z.enum(['add', 'remove']),
})

export async function listTransactions(request: FastifyRequest, reply: FastifyReply) {
  const filters = querySchema.parse(request.query)
  return reply.send(await service.listTransactions(filters as any))
}

export async function adjustPoints(request: FastifyRequest, reply: FastifyReply) {
  const { memberId, amount, reason, type } = adjustSchema.parse(request.body)
  const tx = await service.adjustPoints(memberId, amount, reason, type)
  return reply.status(201).send(tx)
}

export async function bulkAdjust(request: FastifyRequest, reply: FastifyReply) {
  const { memberIds, amount, reason, type } = bulkSchema.parse(request.body)
  await service.bulkAdjust(memberIds, amount, reason, type)
  return reply.status(201).send({ success: true })
}
