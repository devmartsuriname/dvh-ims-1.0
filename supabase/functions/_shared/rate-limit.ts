/**
 * Shared rate-limiter factory for Edge Functions.
 * Phase 9D — Shared Module Extraction
 *
 * Each call to createRateLimiter() returns an isolated instance
 * with its own Map, preserving per-function isolation.
 *
 * Usage:
 *   const limiter = createRateLimiter(5, 60 * 60 * 1000)
 *   if (!limiter.check(clientIP)) { return error }
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

export interface RateLimiter {
  check(ip: string): boolean
}

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const map = new Map<string, RateLimitEntry>()

  return {
    check(ip: string): boolean {
      const now = Date.now()
      const entry = map.get(ip)

      if (!entry || now > entry.resetTime) {
        map.set(ip, { count: 1, resetTime: now + windowMs })
        return true
      }

      if (entry.count >= limit) {
        return false
      }

      entry.count++
      return true
    },
  }
}
