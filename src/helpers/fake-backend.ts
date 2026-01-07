// Legacy fake backend - DEPRECATED
// This file is kept for reference only.
// Authentication is now handled by Supabase Auth.
// See: src/integrations/supabase/client.ts

export default function configureFakeBackend() {
  // No-op - Supabase Auth handles authentication
  console.warn('configureFakeBackend is deprecated. Using Supabase Auth.')
}
