import { z } from 'zod'

const gearItemSchema = z.object({
  preset: z.string().max(100).default(''),
  refinement: z.string().max(50).default(''),
}).strict()

const rpgProfileSchema = z.object({
  atk: z.number().int().min(0).max(999999).optional(),
  def: z.number().int().min(0).max(999999).optional(),
  acc: z.number().int().min(0).max(999999).optional(),
  itemsCollection: z.string().max(50).optional(),
  garmentCollection: z.string().max(50).optional(),
  familiarCollection: z.string().max(50).optional(),
  riftFloor: z.string().max(20).optional(),
  towerFloor: z.string().max(20).optional(),
  mainQuest: z.string().max(100).optional(),
  mainWeapon: gearItemSchema.optional(),
  gloves: gearItemSchema.optional(),
  cape: gearItemSchema.optional(),
  helmet: gearItemSchema.optional(),
  chest: gearItemSchema.optional(),
  pants: gearItemSchema.optional(),
  boots: gearItemSchema.optional(),
  lEarrings: gearItemSchema.optional(),
  rEarrings: gearItemSchema.optional(),
  necklace: gearItemSchema.optional(),
  belt: gearItemSchema.optional(),
  lBracelet: gearItemSchema.optional(),
  rBracelet: gearItemSchema.optional(),
  lRing: gearItemSchema.optional(),
  rRing: gearItemSchema.optional(),
  toten: gearItemSchema.optional(),
  seal: gearItemSchema.optional(),
  riftHunterSymbol: gearItemSchema.optional(),
  honorableSymbol: gearItemSchema.optional(),
  dimensionalWanderersSymbol: gearItemSchema.optional(),
}).strict().optional()

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().max(500).optional(),
  class: z.string().max(50).optional(),
  guild: z.string().max(50).optional(),
  level: z.number().int().min(1).max(200).optional(),
  altNames: z.array(z.string().max(30)).max(10).optional(),
  rpgProfile: rpgProfileSchema,
})

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member']).optional(),
  rank: z.enum(['Leader', 'Officer', 'Elite', 'Member', 'Recruit']).optional(),
})

export const memberIdParam = z.object({
  id: z.string().uuid(),
})
