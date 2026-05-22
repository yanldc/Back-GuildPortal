import { z } from 'zod'

export const createRequestSchema = z.object({
  title: z.string().min(1),
  time: z.string(),
  weekday: z.string(),
  class: z.string(),
})

export const joinSlotSchema = z.object({
  characterName: z.string().min(1),
  isAlt: z.boolean().default(false),
})

export const createHelperSchema = z.object({
  characterName: z.string().min(1),
  class: z.string(),
  isAlt: z.boolean().default(false),
  availability: z.string(),
  weekday: z.string(),
})

export const idParam = z.object({ id: z.string().uuid() })
export const weekdayQuery = z.object({ weekday: z.string().optional() })
