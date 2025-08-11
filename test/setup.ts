import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.BASE_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

// Mock pino logger to avoid console output during tests
// Note: must match the import specifier in the SUT exactly: "../../utils/logger"
vi.mock('../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock rate-limiter-flexible
vi.mock('rate-limiter-flexible', () => ({
  RateLimiterMemory: vi.fn().mockImplementation(() => ({
    consume: vi.fn().mockResolvedValue({
      remainingPoints: 9,
      msBeforeNext: 1000,
    }),
    points: 10,
    duration: 60,
    blockDuration: 300,
  })),
}));
