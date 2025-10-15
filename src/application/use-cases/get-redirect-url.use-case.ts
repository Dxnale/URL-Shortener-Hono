import type { IUrlRepository } from "../../domain/repositories/url.repository.interface";
import type { RedirectUrlDto, RedirectUrlResponseDto } from "../dtos/url.dto";

/**
 * Use Case: Get redirect URL for a short code
 */
export class GetRedirectUrlUseCase {
	constructor(private readonly urlRepository: IUrlRepository) {}

	async execute(dto: RedirectUrlDto): Promise<RedirectUrlResponseDto | null> {
		const url = await this.urlRepository.findByCode(dto.code);

		if (!url) {
			return null;
		}

		return {
			longUrl: url.longUrl,
		};
	}
}
