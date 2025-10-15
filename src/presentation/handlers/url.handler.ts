import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";
import { z } from "zod";
import { CreateShortUrlUseCase, GetRedirectUrlUseCase } from "@/application";
import { UrlDomainService } from "@/domain/services/url.domain.service";
import { PrismaUrlRepository } from "@/infrastructure/repositories/prisma-url.repository";
import { urlSchema } from "@/schemas/url.schema";

/**
 * URL Handler - Presentation layer controller
 */
export class UrlHandler {
	private createShortUrlUseCase: CreateShortUrlUseCase;
	private getRedirectUrlUseCase: GetRedirectUrlUseCase;

	constructor() {
		// Dependency injection (in a real app, use a DI container)
		const prisma = new PrismaClient();
		const urlRepository = new PrismaUrlRepository(prisma);
		const urlDomainService = new UrlDomainService(urlRepository);

		this.createShortUrlUseCase = new CreateShortUrlUseCase(
			urlRepository,
			urlDomainService,
		);
		this.getRedirectUrlUseCase = new GetRedirectUrlUseCase(urlRepository);
	}

	async shortenUrl(c: Context) {
		try {
			const body = await c.req.json();
			const { url } = urlSchema.parse(body);

			const result = await this.createShortUrlUseCase.execute({ longUrl: url });
			return c.json({ short: result.shortUrl });
		} catch (error: unknown) {
			if (error instanceof z.ZodError) {
				return c.json(
					{
						error: "Validation error",
						details: error.issues.map((issue: z.ZodIssue) => ({
							field: issue.path.join("."),
							message: issue.message,
						})),
					},
					400,
				);
			}
			console.error("Error in shortenUrl:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}

	async redirectUrl(c: Context) {
		try {
			const code = c.req.param("code");
			const result = await this.getRedirectUrlUseCase.execute({ code });

			if (!result) {
				return c.json({ error: "URL not found" }, 404);
			}

			return c.json({ error: "Internal server error" }, 500);
		} catch (error: unknown) {
			console.error("Error in redirectUrl:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}
}
