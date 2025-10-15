import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import type { RateLimiterAbstract } from "rate-limiter-flexible";
import { RateLimiterMemory } from "rate-limiter-flexible";
import logger from "@/utils/logger";

export interface RateLimitResponse {
	remainingPoints: number;
	msBeforeNext: number;
	consumedPoints?: number;
	isFirstInDuration?: boolean;
}

export interface RateLimiterOptions {
	points?: number;
	duration?: number;
	blockDuration?: number;
	keyPrefix?: string;
}

export interface IRateLimiter {
	consume(key: string): Promise<RateLimitResponse>;
	points: number;
}

// Default rate limiter implementation using rate-limiter-flexible
export class RateLimiter implements IRateLimiter {
	private limiter: RateLimiterAbstract;
	public points: number;

	constructor(
		options: RateLimiterOptions = {},
		createLimiter: new (
			options: RateLimiterOptions,
		) => RateLimiterAbstract = RateLimiterMemory,
	) {
		this.points = options.points ?? 10;
		this.limiter = new createLimiter({
			points: this.points,
			duration: options.duration ?? 60, // per 60 seconds per IP
			blockDuration: options.blockDuration ?? 5 * 60, // Block for 5 minutes if exceeded
			keyPrefix: options.keyPrefix ?? "rate_limiter",
		});
	}

	async consume(key: string): Promise<RateLimitResponse> {
		const result = await this.limiter.consume(key);
		return {
			remainingPoints: result.remainingPoints,
			msBeforeNext: result.msBeforeNext,
			consumedPoints: result.consumedPoints,
			isFirstInDuration: result.isFirstInDuration,
		};
	}
}

// Create a default instance for backward compatibility
const defaultRateLimiter = new RateLimiter();

/**
 * Rate limit middleware factory
 * @param rateLimiter - Optional rate limiter instance (useful for testing)
 */
export function createRateLimitMiddleware(
	rateLimiter: IRateLimiter = defaultRateLimiter,
) {
	return async function rateLimitMiddleware(c: Context, next: Next) {
		// Get IP from Cloudflare or X-Forwarded-For header in production
		// For local development, use a fixed key
		const ip =
			c.req.header("cf-connecting-ip") ||
			c.req.header("x-forwarded-for")?.split(",")[0] ||
			"local";

		try {
			const rateLimit = await rateLimiter.consume(ip);

			// Set rate limit headers
			c.header("X-RateLimit-Limit", rateLimiter.points.toString());
			c.header("X-RateLimit-Remaining", rateLimit.remainingPoints.toString());
			const resetSeconds =
				Math.floor(Date.now() / 1000) +
				Math.ceil((rateLimit.msBeforeNext || 0) / 1000);
			c.header("X-RateLimit-Reset", resetSeconds.toString());

			await next();
		} catch (error) {
			const rateLimiterRes = error as RateLimitResponse;
			logger.warn({ ip }, "Rate limit exceeded");

			// Set retry-after header
			const retryAfter = Math.ceil((rateLimiterRes.msBeforeNext || 0) / 1000);
			c.header("Retry-After", retryAfter.toString());

			throw new HTTPException(429, {
				message: "Too Many Requests",
				res: new Response(
					JSON.stringify({
						error: "Too Many Requests",
						message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
					}),
					{
						status: 429,
						headers: {
							"Content-Type": "application/json",
							"Retry-After": retryAfter.toString(),
						},
					},
				),
			});
		}
	};
}

// Default export for backward compatibility
export const rateLimitMiddleware = createRateLimitMiddleware();
