import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UrlService } from './url.service'
import type { UrlRepository } from '../repositories/url.repository'

// Mock nanoid to produce deterministic values in tests
vi.mock('nanoid', () => {
  // default export for tests will be overridden per-test when needed
  let codes = ['ABCDEFGH']
  let i = 0
  return {
    nanoid: () => codes[Math.min(i++, codes.length - 1)],
    // helper to set sequence within tests
    __setCodes: (arr: string[]) => {
      codes = arr
      i = 0
    },
  }
})

// Utility to access mock helper
const nanoidModule = await import('nanoid') as unknown as { nanoid: () => string; __setCodes: (arr: string[]) => void }

describe('UrlService', () => {
  let repo: UrlRepository
  let service: UrlService

  beforeEach(() => {
    // fresh mocks per test
    repo = {
      create: vi.fn(),
      findByCode: vi.fn(),
    } as unknown as UrlRepository
    service = new UrlService(repo)
    // reset nanoid sequence
    nanoidModule.__setCodes(['ABCDEFGH'])
  })

  it('creates a short URL when there is no collision', async () => {
    repo.findByCode = vi.fn().mockResolvedValue(null) as unknown as UrlRepository['findByCode']
    repo.create = vi.fn().mockResolvedValue({ id: 1, longUrl: 'https://example.com', shortCode: 'ABCDEFGH' }) as unknown as UrlRepository['create']

    const result = await service.createShortUrl('https://example.com')

    expect(result).toMatchObject({ shortCode: 'ABCDEFGH', longUrl: 'https://example.com' })
    expect(repo.findByCode).toHaveBeenCalledWith('ABCDEFGH')
    expect(repo.create).toHaveBeenCalledWith('https://example.com', 'ABCDEFGH')
  })

  it('retries when a collision occurs and succeeds with a new code', async () => {
    // make nanoid return two codes: first collides, second unique
    nanoidModule.__setCodes(['DUPLICAT', 'UNIQUE12'])

    repo.findByCode = vi.fn()
      .mockResolvedValueOnce({ id: 99, longUrl: 'https://old.com', shortCode: 'DUPLICAT' }) // collision
      .mockResolvedValueOnce(null) // unique

    repo.create = vi.fn().mockResolvedValue({ id: 2, longUrl: 'https://example.com', shortCode: 'UNIQUE12' }) as unknown as UrlRepository['create']

    const result = await service.createShortUrl('https://example.com')

    expect(result).toMatchObject({ shortCode: 'UNIQUE12' })
    expect(repo.findByCode).toHaveBeenNthCalledWith(1, 'DUPLICAT')
    expect(repo.findByCode).toHaveBeenNthCalledWith(2, 'UNIQUE12')
    expect(repo.create).toHaveBeenCalledWith('https://example.com', 'UNIQUE12')
  })

  it('returns long URL for an existing code', async () => {
    repo.findByCode = vi.fn().mockResolvedValue({ id: 1, longUrl: 'https://site.com', shortCode: 'ABCDEFGH' }) as unknown as UrlRepository['findByCode']

    const long = await service.getRedirectUrl('ABCDEFGH')
    expect(long).toBe('https://site.com')
  })

  it('returns null for a non-existent code', async () => {
    repo.findByCode = vi.fn().mockResolvedValue(null) as unknown as UrlRepository['findByCode']

    const long = await service.getRedirectUrl('NO_CODE')
    expect(long).toBeNull()
  })
})
