import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
	points: 10, // 10 peticiones
	duration: 60, // por 60 segundos (1 minuto) por IP
});

export const rateLimiterMiddleware = (): MiddlewareHandler => {
	return async (c, next) => {
		const ip = c.req.header("x-forwarded-for") || c.req.header("host");

		if (!ip) {
			return await next();
		}

		try {
			await rateLimiter.consume(ip);
		} catch (_e) {
			throw new HTTPException(429, { message: "Too Many Requests" });
		}

		await next();
	};
};
