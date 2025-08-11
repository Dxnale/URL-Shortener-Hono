import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  BASE_URL: z.url(),
  DATABASE_URL: z.string(),
})

const env = envSchema.parse(process.env)

export default env
