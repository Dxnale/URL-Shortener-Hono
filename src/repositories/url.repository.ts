import type { PrismaClient } from "@prisma/client";

export class UrlRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findByCode(code: string) {
		return this.prisma.url.findUnique({ where: { shortCode: code } });
	}

	async create(longUrl: string, shortCode: string) {
		return this.prisma.url.create({
			data: { shortCode, longUrl },
		});
	}
}
