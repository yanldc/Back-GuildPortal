import { FastifyRequest, FastifyReply } from 'fastify'
import { createAuctionSchema, placeBidSchema, auctionIdParam, auctionQuerySchema } from './auctions.schema.js'
import * as service from './auctions.service.js'

export async function listAuctions(request: FastifyRequest, reply: FastifyReply) {
  const filters = auctionQuerySchema.parse(request.query)
  const auctions = await service.listAuctions(filters as any)
  return reply.send(auctions)
}

export async function getAuction(request: FastifyRequest, reply: FastifyReply) {
  const { id } = auctionIdParam.parse(request.params)
  const auction = await service.getAuctionById(id)
  return reply.send(auction)
}

export async function createAuction(request: FastifyRequest, reply: FastifyReply) {
  const data = createAuctionSchema.parse(request.body)
  const auction = await service.createAuction(data, request.user.id)
  return reply.status(201).send(auction)
}

export async function placeBid(request: FastifyRequest, reply: FastifyReply) {
  const { id } = auctionIdParam.parse(request.params)
  const { amount } = placeBidSchema.parse(request.body)
  const auction = await service.placeBid(id, request.user.id, amount)
  return reply.send(auction)
}
