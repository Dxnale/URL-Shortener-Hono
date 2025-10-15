import type { PrismaClient } from "@prisma/client";
import { Url } from "../../domain/entities/url.entity";
import type { IUrlRepository } from "../../domain/repositories/url.repository.interface";

/**
 * Prisma implementation of URL Repository
 */
export class PrismaUrlRepository implements IUrlRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findByCode(shortCode: string): Promise<Url | null> {
		const result = await this.prisma.url.findUnique({
			where: { shortCode },
		});

		if (!result) return null;

		return Url.fromPersistence(
			BigInt(result.id),
			result.longUrl,
			result.shortCode,
			result.createdAt,
			result.updatedAt || undefined,
		);
	}

	async findById(id: bigint): Promise<Url | null> {
		const result = await this.prisma.url.findUnique({
			where: { id: Number(id) },
		});

		if (!result) return null;

		return Url.fromPersistence(
			BigInt(result.id),
			result.longUrl,
			result.shortCode,
			result.createdAt,
			result.updatedAt || undefined,
		);
	}

	async findByLongUrl(longUrl: string): Promise<Url | null> {
		const result = await this.prisma.url.findFirst({
			where: { longUrl },
		});

		if (!result) return null;

		return Url.fromPersistence(
			BigInt(result.id),
			result.longUrl,
			result.shortCode,
			result.createdAt,
			result.updatedAt || undefined,
		);
	}

	async create(url: Url): Promise<Url> {
		const result = await this.prisma.url.create({
			data: {
				shortCode: url.shortCode,
				longUrl: url.longUrl,
			},
		});

		return Url.fromPersistence(
			BigInt(result.id),
			result.longUrl,
			result.shortCode,
			result.createdAt,
			result.updatedAt || undefined,
		);
	}

	async update(url: Url): Promise<Url> {
		const result = await this.prisma.url.update({
			where: { id: Number(url.id) },
			data: {
				longUrl: url.longUrl,
				shortCode: url.shortCode,
				updatedAt: url.updatedAt,
			},
		});

		return Url.fromPersistence(
			BigInt(result.id),
			result.longUrl,
			result.shortCode,
			result.createdAt,
			result.updatedAt || undefined,
		);
	}

	async delete(id: bigint): Promise<void> {
		await this.prisma.url.delete({
			where: { id: Number(id) },
		});
	}

	async exists(shortCode: string): Promise<boolean> {
		const result = await this.prisma.url.findUnique({
			where: { shortCode },
		});
		return !!result;
	}
}
