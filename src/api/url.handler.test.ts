import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Hono } from "hono";

// Create manual mock for config module since Bun test doesn't have vi.mock for ES modules
const configModule = {
	default: {
		BASE_URL: "http://localhost:3000",
		DATABASE_URL: "postgres://user:pass@localhost:5432/db",
	},
};

// Override the module import
Object.defineProperty(require.cache || {}, require.resolve("../config"), {
	value: { exports: configModule },
	writable: true,
});

import type { UrlService } from "../services/url.service";
import { UrlHandler } from "./url.handler";

function makeApp(handler: UrlHandler) {
	const app = new Hono();
	app.get("/shorten", (c) => handler.shortenUrl(c));
	app.get("/:code", (c) => handler.redirectUrl(c));
	return app;
}

describe("UrlHandler (HTTP)", () => {
	let service: UrlService;
	let handler: UrlHandler;

	beforeEach(() => {
		service = {
			createShortUrl: mock(),
			getRedirectUrl: mock(),
		} as unknown as UrlService;
		handler = new UrlHandler(service);
	});

	it("GET /shorten validates query param and returns short url", async () => {
		service.createShortUrl = mock().mockResolvedValue({
			id: 1,
			longUrl: "https://example.com",
			shortCode: "ABCDEFGH",
		});

		const app = makeApp(handler);
		const res = await app.request("/shorten?url=https://example.com");

		expect(res.status).toBe(200);
		const data = await res.text();
		expect(data).toBe("http://localhost:3000/ABCDEFGH");
	});

	it("GET /shorten returns 400 on invalid query param", async () => {
		const app = makeApp(handler);

		const res = await app.request("/shorten?url=not-a-url");

		expect(res.status).toBe(400);
		const errorText = await res.text();
		expect(errorText).toContain("Invalid URL format");
	});

	it("GET /:code redirects when found", async () => {
		service.getRedirectUrl = mock().mockResolvedValue(
			"https://destination.com",
		);

		const app = makeApp(handler);
		const res = await app.request("/ABCDEFGH");

		expect(res.status).toBe(302);
		expect(res.headers.get("location")).toBe("https://destination.com");
	});

	it("GET /:code returns 404 when not found", async () => {
		service.getRedirectUrl = mock().mockResolvedValue(null);

		const app = makeApp(handler);
		const res = await app.request("/NOPE");

		expect(res.status).toBe(404);
	});
});
