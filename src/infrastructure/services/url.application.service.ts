import type { IUrlRepository } from "../../domain/repositories/url.repository.interface";
import type { UrlDomainService } from "../../domain/services/url.domain.service";

/**
 * Application Service that orchestrates use cases
 */
export class UrlApplicationService {
	constructor(
		readonly urlRepository: IUrlRepository,
		readonly urlDomainService: UrlDomainService,
	) {}

	// This could be used to combine multiple use cases or add cross-cutting concerns
}
