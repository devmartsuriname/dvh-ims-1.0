/**
 * Shared input validators for Edge Functions.
 * Phase 9D — Shared Module Extraction
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str)
}
