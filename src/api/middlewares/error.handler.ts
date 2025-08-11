import type { Context, Next } from 'hono'
import { z } from 'zod'

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next()
  } catch (err) {
    console.error('Error caught in middleware:', err)

    if (err instanceof z.ZodError) {
      return c.json(
        {
          error: 'Validation failed',
          details: z.treeifyError(err),
        },
        400
      )
    }

    // Generic error response
    return c.json(
      {
        error: 'An unexpected error occurred',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      500
    )
  }
}
