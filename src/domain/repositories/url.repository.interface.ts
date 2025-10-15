import type { Url } from "../entities/url.entity";

/**
 * Interface for URL Repository
 * Defines the contract for data access operations
 */
export interface IUrlRepository {
	findByCode(shortCode: string): Promise<Url | null>;
	findById(id: bigint): Promise<Url | null>;
	findByLongUrl(longUrl: string): Promise<Url | null>;
	create(url: Url): Promise<Url>;
	update(url: Url): Promise<Url>;
	delete(id: bigint): Promise<void>;
	exists(shortCode: string): Promise<boolean>;
}
