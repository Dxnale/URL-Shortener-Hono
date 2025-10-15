import { Url } from "../../domain/entities/url.entity";
import type { IUrlRepository } from "../../domain/repositories/url.repository.interface";
import type { UrlDomainService } from "../../domain/services/url.domain.service";
import type {
	CreateShortUrlDto,
	CreateShortUrlResponseDto,
} from "../dtos/url.dto";

/**
 * Use Case: Create a short URL
 */
export class CreateShortUrlUseCase {
	constructor(
		private readonly urlRepository: IUrlRepository,
		private readonly urlDomainService: UrlDomainService,
	) {}

	async execute(dto: CreateShortUrlDto): Promise<CreateShortUrlResponseDto> {
		// Generate a unique short code using domain service
		const shortCode = await this.urlDomainService.generateUniqueShortCode();

		// Create the URL entity
		const url = Url.create(dto.longUrl, shortCode);

		// Save to repository
		const savedUrl = await this.urlRepository.create(url);

		// Return response DTO (this would typically use a mapper)
		return {
			shortUrl: `${process.env.BASE_URL || "http://localhost:3000"}/${savedUrl.shortCode}`,
		};
	}
}
