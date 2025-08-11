import { nanoid } from "nanoid";
import type { UrlRepository } from "../repositories/url.repository";
import type { Url } from "../types/url.types";

export class UrlService {
	constructor(private readonly urlRepository: UrlRepository) {}

	async createShortUrl(longUrl: string) {
		let shortCode: string;
		let existingUrl: Url | null;

		do {
			shortCode = nanoid(8);
			existingUrl = await this.urlRepository.findByCode(shortCode);
		} while (existingUrl);

		return this.urlRepository.create(longUrl, shortCode);
	}

	async getRedirectUrl(code: string) {
		const url = await this.urlRepository.findByCode(code);
		return url ? url.longUrl : null;
	}
}
