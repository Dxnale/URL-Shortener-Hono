import type { Context, Next } from "hono";
import logger from "../../utils/logger";

export async function loggerMiddleware(c: Context, next: Next) {
	const start = Date.now();
	const { method, url } = c.req;

	try {
		await next();
		const ms = Date.now() - start;
		logger.info(
			{
				method,
				url,
				status: c.res.status,
				responseTime: `${ms}ms`,
			},
			"Request completed",
		);
	} catch (err) {
		const ms = Date.now() - start;
		logger.error(
			{
				method,
				url,
				error: err instanceof Error ? err.message : "Unknown error",
				stack:
					process.env.NODE_ENV === "development" && err instanceof Error
						? err.stack
						: undefined,
				responseTime: `${ms}ms`,
			},
			"Request failed",
		);
		throw err;
	}
}
