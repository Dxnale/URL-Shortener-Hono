import env from '../config'
import type { Context } from 'hono'
import { urlSchema } from '../schemas/url.schema'
import { UrlService } from '../services/url.service'

export class UrlHandler {
  constructor(private readonly urlService: UrlService) {}

  async shortenUrl(c: Context) {
    const body = await c.req.json()
    const { url } = urlSchema.parse(body)
    const newUrl = await this.urlService.createShortUrl(url)
    const shortUrl = `${env.BASE_URL}/${newUrl.shortCode}`

    return c.json({ short: shortUrl })
  }

  async redirectUrl(c: Context) {
    const code = c.req.param('code')
    const longUrl = await this.urlService.getRedirectUrl(code)

    if (!longUrl) return c.json({ error: 'Not found' }, 404)

    return c.redirect(longUrl, 302)
  }
}
