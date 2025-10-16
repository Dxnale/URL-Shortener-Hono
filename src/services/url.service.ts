import { nanoid } from "nanoid";
import type { UrlRepository } from "../repositories/url.repository";

export class UrlService {
	constructor(private readonly urlRepository: UrlRepository) {}

	async createShortUrl(longUrl: string) {
		let shortCode: string;
		let shortCodeExists: boolean;

		do {
			shortCode = nanoid(8);
			shortCodeExists =
				(await this.urlRepository.findByCode(shortCode)) !== null;
		} while (shortCodeExists);

		return this.urlRepository.create(longUrl, shortCode);
	}

	async getRedirectUrl(code: string) {
		const url = await this.urlRepository.findByCode(code);
		return url ? url.longUrl : null;
	}
}
