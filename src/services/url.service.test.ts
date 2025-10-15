import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { UrlRepository } from "../repositories/url.repository";
import { UrlService } from "./url.service";

// Mock nanoid using Bun's module mocking
mock.module("nanoid", () => {
	return {
		nanoid: () => "ABCDEFGH",
	};
});

// Helper to set nanoid behavior in tests
const setNanoidCodes = (codes: string[]) => {
	mock.module("nanoid", () => {
		let index = 0;
		return {
			nanoid: () => {
				const code = codes[Math.min(index++, codes.length - 1)];
				return code || "DEFAULT";
			},
		};
	});
};

describe("UrlService", () => {
	let repo: UrlRepository;
	let service: UrlService;

	beforeEach(() => {
		// fresh mocks per test
		repo = {
			create: mock(),
			findByCode: mock(),
		} as unknown as UrlRepository;
		service = new UrlService(repo);
		// reset nanoid sequence - set default behavior
		mock.module("nanoid", () => {
			return {
				nanoid: () => "ABCDEFGH",
			};
		});
	});

	it("creates a short URL when there is no collision", async () => {
		repo.findByCode = mock().mockResolvedValue(
			null,
		) as unknown as UrlRepository["findByCode"];
		repo.create = mock().mockResolvedValue({
			id: 1,
			longUrl: "https://example.com",
			shortCode: "ABCDEFGH",
		}) as unknown as UrlRepository["create"];

		const result = await service.createShortUrl("https://example.com");

		expect(result).toMatchObject({
			shortCode: "ABCDEFGH",
			longUrl: "https://example.com",
		});
		expect(repo.findByCode).toHaveBeenCalledWith("ABCDEFGH");
		expect(repo.create).toHaveBeenCalledWith("https://example.com", "ABCDEFGH");
	});

	it("retries when a collision occurs and succeeds with a new code", async () => {
		// make nanoid return two codes: first collides, second unique
		setNanoidCodes(["DUPLICAT", "UNIQUE12"]);

		repo.findByCode = mock()
			.mockResolvedValueOnce({
				id: 99,
				longUrl: "https://old.com",
				shortCode: "DUPLICAT",
			}) // collision
			.mockResolvedValueOnce(null); // unique

		repo.create = mock().mockResolvedValue({
			id: 2,
			longUrl: "https://example.com",
			shortCode: "UNIQUE12",
		}) as unknown as UrlRepository["create"];

		const result = await service.createShortUrl("https://example.com");

		expect(result).toMatchObject({ shortCode: "UNIQUE12" });
		expect(repo.findByCode).toHaveBeenNthCalledWith(1, "DUPLICAT");
		expect(repo.findByCode).toHaveBeenNthCalledWith(2, "UNIQUE12");
		expect(repo.create).toHaveBeenCalledWith("https://example.com", "UNIQUE12");
	});

	it("returns long URL for an existing code", async () => {
		repo.findByCode = mock().mockResolvedValue({
			id: 1,
			longUrl: "https://site.com",
			shortCode: "ABCDEFGH",
		}) as unknown as UrlRepository["findByCode"];

		const long = await service.getRedirectUrl("ABCDEFGH");
		expect(long).toBe("https://site.com");
	});

	it("returns null for a non-existent code", async () => {
		repo.findByCode = mock().mockResolvedValue(
			null,
		) as unknown as UrlRepository["findByCode"];

		const long = await service.getRedirectUrl("NO_CODE");
		expect(long).toBeNull();
	});
});
