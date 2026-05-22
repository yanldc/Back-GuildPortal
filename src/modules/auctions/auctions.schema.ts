import { z } from 'zod'

export const createAuctionSchema = z.object({
  itemName: z.string().min(1).max(100),
  itemGrade: z.enum(['rare', 'heroic', 'legendary']),
  minBid: z.number().int().positive(),
  endAt: z.string().datetime(),
  imageUrl: z.string().url(),
  description: z.string().optional(),
  allowedClasses: z.array(z.string()).default(['any']),
})

export const placeBidSchema = z.object({
  amount: z.number().int().positive(),
})

export const auctionIdParam = z.object({
  id: z.string().uuid(),
})

export const auctionQuerySchema = z.object({
  status: z.enum(['active', 'finished']).optional(),
  grade: z.enum(['rare', 'heroic', 'legendary']).optional(),
})
