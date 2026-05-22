import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['world_boss', 'rift', 'guild_dungeon', 'ancient_fortress', 'clash', 'abyss_boss']),
  description: z.string(),
  date: z.string(),
  minLevel: z.number().int().default(60),
  rewards: z.array(z.string()).default([]),
  weekday: z.string().optional(),
  time: z.string().optional(),
})

export const updateEventSchema = createEventSchema.partial()

export const eventIdParam = z.object({ id: z.string().uuid() })

export const eventQuerySchema = z.object({
  weekday: z.string().optional(),
  type: z.enum(['world_boss', 'rift', 'guild_dungeon', 'ancient_fortress', 'clash', 'abyss_boss']).optional(),
})
