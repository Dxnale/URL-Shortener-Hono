import { Hono } from "hono";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import {
	createRateLimitMiddleware,
	type IRateLimiter,
	RateLimiter,
	type RateLimitResponse,
} from "../rate-limit.middleware";

// Extend the IRateLimiter interface to include mock functions for testing
type MockRateLimiter = IRateLimiter & {
	consume: MockInstance<(key: string) => Promise<RateLimitResponse>>;
};

describe("Rate Limit Middleware", () => {
	let app: Hono;
	let mockRateLimiter: MockRateLimiter;
	let rateLimitMiddleware: ReturnType<typeof createRateLimitMiddleware>;

	// Mock Date.now() for consistent testing
	const now = Date.now();
	const realDateNow = Date.now.bind(global.Date);

	beforeEach(() => {
		// Mock Date.now()
		global.Date.now = vi.fn(() => now);

		// Create a new Hono instance for each test
		app = new Hono();

		// Create a mock rate limiter with proper typing
		mockRateLimiter = {
			points: 10,
			consume: vi.fn() as MockInstance<
				(key: string) => Promise<RateLimitResponse>
			>,
		} as MockRateLimiter;

		// Create the middleware with our mock rate limiter
		rateLimitMiddleware = createRateLimitMiddleware(mockRateLimiter);
	});

	afterEach(() => {
		// Restore Date.now()
		global.Date.now = realDateNow;
		vi.clearAllMocks();
	});

	it("should allow requests under the rate limit", async () => {
		// Mock a successful rate limit check
		mockRateLimiter.consume.mockResolvedValueOnce({
			remainingPoints: 9,
			msBeforeNext: 1000,
		});

		app.use("*", rateLimitMiddleware);
		app.get("/", (c) => c.text("OK"));

		const res = await app.request("http://localhost/");

		expect(res.status).toBe(200);
		expect(res.headers.get("X-RateLimit-Limit")).toBe("10");
		expect(res.headers.get("X-RateLimit-Remaining")).toBe("9");
		expect(res.headers.get("X-RateLimit-Reset")).toBe(
			Math.floor(now / 1000 + 1).toString(),
		);
	});

	it("should reject requests over the rate limit", async () => {
		// Mock a rate limit exceeded error
		mockRateLimiter.consume.mockRejectedValueOnce({
			remainingPoints: 0,
			msBeforeNext: 5000,
		});

		app.use("*", rateLimitMiddleware);
		app.get("/", (c) => c.text("OK"));

		const res = await app.request("http://localhost/");
		const body = await res.json();

		expect(res.status).toBe(429);
		expect(res.headers.get("Retry-After")).toBe("5");
		expect(body).toMatchObject({
			error: "Too Many Requests",
			message: "Rate limit exceeded. Try again in 5 seconds.",
		});
	});

	it("should use X-Forwarded-For header when available", async () => {
		const testIp = "192.168.1.1";

		// Mock a successful rate limit check
		mockRateLimiter.consume.mockResolvedValueOnce({
			remainingPoints: 9,
			msBeforeNext: 1000,
		});

		app.use("*", rateLimitMiddleware);
		app.get("/", (c) => c.text("OK"));

		await app.request("http://localhost/", {
			headers: { "x-forwarded-for": testIp },
		});

		// The mock is called with the IP from x-forwarded-for
		expect(mockRateLimiter.consume).toHaveBeenCalledWith(testIp);
	});

	it("should use cf-connecting-ip header when available", async () => {
		const testIp = "192.168.1.2";

		// Mock a successful rate limit check
		mockRateLimiter.consume.mockResolvedValueOnce({
			remainingPoints: 9,
			msBeforeNext: 1000,
		});

		app.use("*", rateLimitMiddleware);
		app.get("/", (c) => c.text("OK"));

		await app.request("http://localhost/", {
			headers: { "cf-connecting-ip": testIp },
		});

		// The mock is called with the IP from cf-connecting-ip
		expect(mockRateLimiter.consume).toHaveBeenCalledWith(testIp);
	});

	it('should use "local" as the key when no IP headers are present', async () => {
		// Mock a successful rate limit check
		mockRateLimiter.consume.mockResolvedValueOnce({
			remainingPoints: 9,
			msBeforeNext: 1000,
		});

		app.use("*", rateLimitMiddleware);
		app.get("/", (c) => c.text("OK"));

		await app.request("http://localhost/");

		// The mock is called with 'local' as the key
		expect(mockRateLimiter.consume).toHaveBeenCalledWith("local");
	});
});

describe("RateLimiter Class", () => {
	it("should create a rate limiter with default options", () => {
		const rateLimiter = new RateLimiter();
		expect(rateLimiter.points).toBe(10);
	});

	it("should create a rate limiter with custom options", () => {
		const options = {
			points: 100,
			duration: 300,
			blockDuration: 600,
			keyPrefix: "test_",
		};

		const rateLimiter = new RateLimiter(options);
		expect(rateLimiter.points).toBe(options.points);
	});
});
