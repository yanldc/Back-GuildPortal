import { z } from 'zod'

export const googleLoginSchema = z.object({
  token: z.string().min(1),
  inviteCode: z.string().optional(),
})
