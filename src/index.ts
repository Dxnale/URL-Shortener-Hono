import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = new Hono()
const prisma = new PrismaClient()

const urlSchema = z.object({
  url: z.url()
})

app.post('/shorten', async (c) => {
  const body = await c.req.json()
  const parsed = urlSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid URL' }, 400)

  const shortCode = Math.random().toString(36).substring(2, 8) // temporal
  const newUrl = await prisma.url.create({
    data: { shortCode, longUrl: parsed.data.url }
  })

  return c.json({ short: `http://localhost:3000/${newUrl.shortCode}` })
})

app.get('/:code', async (c) => {
  const code = c.req.param('code')
  const url = await prisma.url.findUnique({ where: { shortCode: code } })
  if (!url) return c.json({ error: 'Not found' }, 404)
  return c.redirect(url.longUrl, 302)
})

export default app
