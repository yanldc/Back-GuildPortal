import { z } from 'zod'

export const createAuctionSchema = z.object({
  itemName: z.string().min(1).max(100),
  itemGrade: z.enum(['rare', 'heroic', 'legendary']),
  minBid: z.number().int().positive(),
  endAt: z.string(),
  imageUrl: z.string().min(1).max(5000),
  description: z.string().max(500).optional(),
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
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().uuid().optional(),
})
