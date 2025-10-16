import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import env from "../config";

const region = env.AWS_REGION;
const tableName = env.AWS_DYNAMODB_TABLE_NAME;
const endpoint = env.AWS_DYNAMODB_ENDPOINT;
const client = env.DEBUG
	? new DynamoDBClient({ region: region, endpoint: endpoint })
	: new DynamoDBClient({ region: region });

const marshallOptions = {
	convertEmptyValues: false,
	removeUndefinedValues: true,
	convertClassInstanceToMap: false,
};

const unmarshallOptions = {
	wrapNumbers: false,
};

const db = DynamoDBDocumentClient.from(client, {
	marshallOptions,
	unmarshallOptions,
});

export { db, tableName };
