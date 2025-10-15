/**
 * DTO for creating a short URL
 */
export interface CreateShortUrlDto {
	longUrl: string;
}

/**
 * DTO for the response when creating a short URL
 */
export interface CreateShortUrlResponseDto {
	shortUrl: string;
}

/**
 * DTO for redirecting to a long URL
 */
export interface RedirectUrlDto {
	code: string;
}

/**
 * DTO for the response when redirecting
 */
export interface RedirectUrlResponseDto {
	longUrl: string;
}
