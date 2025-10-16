import type { Context } from "hono";
import { ZodError } from "zod";
import env from "../config";
import { urlSchema } from "../schemas/url.schema";
import type { UrlService } from "../services/url.service";

export class UrlHandler {
	constructor(private readonly urlService: UrlService) {}

	async shortenUrl(c: Context) {
		const urlParam = c.req.query("url");
		if (!urlParam) {
			return c.text(
				"Error: Please provide a 'url' parameter in the query string, e.g., /shorten?url=https://example.com",
				400,
			);
		}
		try {
			const { url } = urlSchema.parse({ url: urlParam });
			const newUrl = await this.urlService.createShortUrl(url);
			const shortUrl = `${env.BASE_URL}/${newUrl.shortCode}`;

			return c.text(shortUrl);
		} catch (err) {
			if (err instanceof ZodError) {
				return c.text("Error: Invalid URL format", 400);
			}
			throw err;
		}
	}

	async redirectUrl(c: Context) {
		const code = c.req.param("code");
		const longUrl = await this.urlService.getRedirectUrl(code);

		if (!longUrl) return c.json({ error: "Not found" }, 404);

		return c.redirect(longUrl, 302);
	}
}
