import { localSiteStore, localViewerStore } from './local'
import { createSupabaseClient } from './shared/client'
import { createAccountService } from './shared/accountService'
import { createSharedSiteStore } from './shared/siteStore'
import { createSharedViewerStore } from './shared/viewerStore'
import type { Backend } from './types'

/**
 * The shared Supabase backend when VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set,
 * otherwise the local demo mode, where everything stays in this browser.
 */
function createBackend(): Backend {
  const client = createSupabaseClient()
  if (!client) return { kind: 'local', site: localSiteStore, viewer: localViewerStore, account: null }

  const account = createAccountService(client)
  return {
    kind: 'shared',
    site: createSharedSiteStore(client),
    viewer: createSharedViewerStore(client, account),
    account,
  }
}

export const backend = createBackend()

export type { SiteStatus } from './types'
