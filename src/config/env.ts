import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3333),
  GOOGLE_CLIENT_ID: z.string(),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  ADMIN_EMAIL: z.string().email().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3003'),
}).refine(
  (data) => !(data.NODE_ENV === 'production' && data.CORS_ORIGIN === '*'),
  { message: 'CORS_ORIGIN cannot be "*" in production', path: ['CORS_ORIGIN'] }
)

export const env = envSchema.parse(process.env)
