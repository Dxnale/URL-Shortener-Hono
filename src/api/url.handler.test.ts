import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Hono } from "hono";
import type { UrlService } from "../services/url.service";
import { UrlHandler } from "./url.handler";

// Mock config
const mockConfig = {
	BASE_URL: "http://localhost:3000",
	DATABASE_URL: "postgres://user:pass@localhost:5432/db",
};

// Mock the config module
mock.module("../config", () => ({
	default: mockConfig,
}));

function makeApp(handler: UrlHandler) {
	const app = new Hono();
	app.post("/shorten", (c) => handler.shortenUrl(c));
	app.get("/:code", (c) => handler.redirectUrl(c)); // Fixed method name to match UrlHandler
	return app;
}

describe("UrlHandler", () => {
	let handler: UrlHandler;
	let service: UrlService;
	let app: ReturnType<typeof makeApp>;

	beforeEach(() => {
		service = {
			createShortUrl: mock(async (longUrl: string) => ({
				id: 1,
				shortCode: "abc123",
				longUrl,
				createdAt: new Date(),
				clicks: 0,
			})),
			getRedirectUrl: mock(async (code: string) => {
				if (code === "valid") return "https://example.com";
				return null;
			}),
		} as unknown as UrlService;

		handler = new UrlHandler(service);
		app = makeApp(handler);
	});

	it("POST /shorten should create a short URL", async () => {
		const longUrl = "https://example.com";
		const response = await app.request("/shorten", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url: longUrl }),
		});

		expect(response.status).toBe(200);
		const data = (await response.json()) as { short: string };
		expect(data).toHaveProperty("short");
		expect(service.createShortUrl).toHaveBeenCalled();

		// Verify the short URL is in the expected format
		expect(data.short).toMatch(/^http:\/\/localhost:3000\/[a-zA-Z0-9_-]+$/);
	});

	it("POST /shorten should return 400 for invalid URL", async () => {
		const response = await app.request("/shorten", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url: "not-a-url" }),
		});

		expect(response.status).toBe(400);
		const data = (await response.json()) as { error: string };
		expect(data).toHaveProperty("error");
		expect(service.createShortUrl).not.toHaveBeenCalled();
	});

	it("GET /:code should redirect to the original URL", async () => {
		const response = await app.request("/valid");
		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe("https://example.com");
		expect(service.getRedirectUrl).toHaveBeenCalledWith("valid");
	});

	it("GET /:code should return 404 for unknown code", async () => {
		const response = await app.request("/invalid");
		expect(response.status).toBe(404);
		const data = (await response.json()) as { error: string };
		expect(data).toHaveProperty("error");
		expect(service.getRedirectUrl).toHaveBeenCalledWith("invalid");
	});
});
