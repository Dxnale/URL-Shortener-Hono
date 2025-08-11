import type { Context } from "hono";
import { z } from "zod";
import env from "../config";
import { urlSchema } from "../schemas/url.schema";
import type { UrlService } from "../services/url.service";

export class UrlHandler {
	constructor(private readonly urlService: UrlService) {}

	async shortenUrl(c: Context) {
		try {
			const body = await c.req.json();
			const { url } = urlSchema.parse(body);
			const newUrl = await this.urlService.createShortUrl(url);
			const shortUrl = `${env.BASE_URL}/${newUrl.shortCode}`;

			return c.json({ short: shortUrl });
		} catch (error) {
			if (error instanceof z.ZodError) {
				return c.json(
					{
						error: "Validation error",
						details: error.issues.map((issue) => ({
							field: issue.path.join("."),
							message: issue.message,
						})),
					},
					400,
				);
			}
			// Log the error for debugging
			console.error("Error in shortenUrl:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}

	async redirectUrl(c: Context) {
		try {
			const code = c.req.param("code");
			const longUrl = await this.urlService.getRedirectUrl(code);

			if (!longUrl) {
				return c.json({ error: "URL not found" }, 404);
			}

			return c.redirect(longUrl, 302);
		} catch (error) {
			console.error("Error in redirectUrl:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}
}
