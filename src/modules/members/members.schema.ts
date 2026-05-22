import { z } from 'zod'

export const updateProfileSchema = z.object({
  class: z.string().optional(),
  guild: z.string().optional(),
  altNames: z.array(z.string()).optional(),
  rpgProfile: z.any().optional(),
})

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member']).optional(),
  rank: z.enum(['Leader', 'Officer', 'Elite', 'Member', 'Recruit']).optional(),
})

export const memberIdParam = z.object({
  id: z.string().uuid(),
})
