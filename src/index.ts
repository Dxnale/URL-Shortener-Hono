import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { UrlRepository } from './repositories/url.repository'
import { UrlService } from './services/url.service'
import { UrlHandler } from './api/url.handler'
import { errorHandler } from './api/middlewares/error.handler'

const app = new Hono()

// Dependency Injection Setup
const prisma = new PrismaClient()
const urlRepository = new UrlRepository(prisma)
const urlService = new UrlService(urlRepository)
const urlHandler = new UrlHandler(urlService)

// Middlewares
app.use('*', errorHandler)

// Routes
app.post('/shorten', (c) => urlHandler.shortenUrl(c))
app.get('/:code', (c) => urlHandler.redirectUrl(c))

export default app

