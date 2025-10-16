import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { db, tableName } from "../lib/dynamoDB-client";

export class UrlRepository {
	private readonly tableName = tableName;
	async findByCode(code: string) {
		const params = {
			TableName: this.tableName,
			Key: {
				shortCode: code,
			},
		};
		const result = await db.send(new GetCommand(params));

		if (!result.Item) return null;
		return result.Item as Record<string, string>;
	}

	async create(longUrl: string, shortCode: string) {
		const params = {
			TableName: this.tableName,
			Item: {
				shortCode: shortCode,
				longUrl: longUrl,
				createdAt: new Date().toISOString(),
			},
		};
		const res = await db.send(new PutCommand(params));
		if (res.$metadata.httpStatusCode === 200) {
			return params.Item as Record<string, string>;
		}
		throw new Error("Failed to create URL");
	}
}
