import type { Url } from "../entities/url.entity";
import type { IUrlRepository } from "../repositories/url.repository.interface";

/**
 * Domain Service for URL operations
 * Contains business logic that doesn't naturally fit in entities
 */
export class UrlDomainService {
	constructor(private readonly urlRepository: IUrlRepository) {}

	/**
	 * Generate a unique short code for a URL
	 */
	async generateUniqueShortCode(): Promise<string> {
		let shortCode: string;
		let existingUrl: Url | null;

		do {
			shortCode = this.generateRandomShortCode();
			existingUrl = await this.urlRepository.findByCode(shortCode);
		} while (existingUrl);

		return shortCode;
	}

	/**
	 * Validate if a short code is available
	 */
	async isShortCodeAvailable(shortCode: string): Promise<boolean> {
		return !(await this.urlRepository.exists(shortCode));
	}

	/**
	 * Generate a random short code (8 characters by default)
	 */
	private generateRandomShortCode(length: number = 8): string {
		const chars =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}
}
