import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
	BASE_URL: z.url(),
	DATABASE_URL: z.string(),
	AWS_REGION: z.string(),
	AWS_ACCESS_KEY_ID: z.string(),
	AWS_SECRET_ACCESS_KEY: z.string(),
	AWS_DYNAMODB_TABLE_NAME: z.string(),
	AWS_DYNAMODB_ENDPOINT: z.string().optional(),
	DEBUG: z
		.enum(["true", "false"])
		.transform((v) => v === "true")
		.optional(),
});

const env = envSchema.parse(process.env);

export default env;
