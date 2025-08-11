export interface Url {
	id: bigint;
	longUrl: string;
	shortCode: string;
	createdAt: Date;
	updatedAt?: Date; // Made optional since it's not always present in the database
}
