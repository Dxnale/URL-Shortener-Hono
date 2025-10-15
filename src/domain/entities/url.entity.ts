/**
 * Url Entity - Represents a URL in the domain layer
 * Contains business logic and validation rules
 */
export class Url {
	private constructor(
		public readonly id: bigint,
		public readonly longUrl: string,
		public readonly shortCode: string,
		public readonly createdAt: Date,
		public readonly updatedAt?: Date,
	) {}

	/**
	 * Factory method to create a new Url entity
	 * Validates the long URL and generates a short code
	 */
	static create(longUrl: string, shortCode: string): Url {
		if (!Url.isValidUrl(longUrl)) {
			throw new Error("Invalid URL provided");
		}

		if (!shortCode || shortCode.length < 4) {
			throw new Error("Short code must be at least 4 characters long");
		}

		return new Url(
			BigInt(0), // ID will be set by repository
			longUrl,
			shortCode,
			new Date(),
		);
	}

	/**
	 * Reconstitute an existing Url from persistence
	 */
	static fromPersistence(
		id: bigint,
		longUrl: string,
		shortCode: string,
		createdAt: Date,
		updatedAt?: Date,
	): Url {
		return new Url(id, longUrl, shortCode, createdAt, updatedAt);
	}

	/**
	 * Validate if a string is a valid URL
	 */
	private static isValidUrl(url: string): boolean {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Check if the URL is expired (if needed for business rules)
	 */
	isExpired(): boolean {
		// Add expiration logic if needed
		return false;
	}

	/**
	 * Update the URL (if business rules allow)
	 */
	updateLongUrl(newLongUrl: string): Url {
		if (!Url.isValidUrl(newLongUrl)) {
			throw new Error("Invalid URL provided");
		}

		return new Url(
			this.id,
			newLongUrl,
			this.shortCode,
			this.createdAt,
			new Date(),
		);
	}
}
