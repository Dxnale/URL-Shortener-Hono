import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { UrlRepository } from "../repositories/url.repository";
import { UrlService } from "./url.service";

// Mock nanoid
const mockNanoid = mock(() => "ABCDEFGH");

// Mock the nanoid module
mock.module("nanoid", () => ({
	nanoid: mockNanoid,
	__esModule: true,
	default: mockNanoid,
}));

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
		// reset mocks
		mockNanoid.mockClear();
	});

	it("creates a short URL when there is no collision", async () => {
		// Setup mock responses
		const mockUrl = {
			id: 1,
			longUrl: "https://example.com",
			shortCode: "ABCDEFGH",
		};
		repo.findByCode = mock().mockResolvedValueOnce(
			null,
		) as unknown as UrlRepository["findByCode"];
		repo.create = mock().mockResolvedValueOnce(
			mockUrl,
		) as unknown as UrlRepository["create"];

		const result = await service.createShortUrl("https://example.com");

		expect(result).toMatchObject({
			shortCode: "ABCDEFGH",
			longUrl: "https://example.com",
		});
		expect(repo.findByCode).toHaveBeenCalledWith("ABCDEFGH");
		expect(repo.create).toHaveBeenCalledWith("https://example.com", "ABCDEFGH");
	});

	it("retries when a collision occurs and succeeds with a new code", async () => {
		// Setup mock responses
		const existingUrl = {
			id: 1,
			longUrl: "https://other.com",
			shortCode: "ABCDEFGH",
		};
		const newUrl = {
			id: 2,
			longUrl: "https://example.com",
			shortCode: "NEWCODE12",
		};

		// First call finds existing URL, second finds null (no collision)
		repo.findByCode = mock()
			.mockResolvedValueOnce(existingUrl) // collision
			.mockResolvedValueOnce(null); // no collision

		repo.create = mock().mockResolvedValueOnce(
			newUrl,
		) as unknown as UrlRepository["create"];

		// Make nanoid return two different codes
		mockNanoid.mockImplementationOnce(() => "ABCDEFGH");
		mockNanoid.mockImplementationOnce(() => "NEWCODE12");

		const result = await service.createShortUrl("https://example.com");

		// should have tried to find both codes
		expect(repo.findByCode).toHaveBeenCalledWith("ABCDEFGH");
		expect(repo.findByCode).toHaveBeenCalledWith("NEWCODE12");
		// should have created with the second code
		expect(repo.create).toHaveBeenCalledWith(
			"https://example.com",
			"NEWCODE12",
		);
		expect(result).toMatchObject({
			shortCode: "NEWCODE12",
			longUrl: "https://example.com",
		});
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
		repo.findByCode = mock().mockResolvedValueOnce(
			null,
		) as unknown as UrlRepository["findByCode"];

		const long = await service.getRedirectUrl("NO_CODE");
		expect(long).toBeNull();
	});
});
