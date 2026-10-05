import type { SupabaseClient } from '@supabase/supabase-js'
import type { SiteStore, SiteSync } from '../types'
import { failure } from './client'
import { toCommand } from './commands'
import { createEmptyState, loadSite, loadSlice, SLICES, TABLE_SLICES, type Slice } from './siteQueries'

/** Batches bursts of changes (e.g. a reset touching every table) into one reload per slice. */
const SETTLE_MS = 150
/** How often to retry while the first load fails. */
const RETRY_MS = 5_000

/**
 * The site on Supabase. Actions are applied optimistically by the caller and sent as one API
 * call each; the changed slices then reload from the database, which also undoes a rejected
 * change. Realtime marks slices changed by other people, and returning to the tab reloads all.
 */
export function createSharedSiteStore(client: SupabaseClient): SiteStore {
  let sync: SiteSync | null = null
  const stale = new Set<Slice>()
  /** API calls still in flight. Reloads wait for them, so a reload can't undo a change that's still on its way. */
  let writing = 0
  let timer: number | undefined
  /** The newest reload per slice, so a slow older response can't overwrite a newer one. */
  const latest = new Map<Slice, number>()

  const reload = (slice: Slice) => {
    const request = (latest.get(slice) ?? 0) + 1
    latest.set(slice, request)
    loadSlice(client, slice).then(
      update => {
        if (latest.get(slice) === request) sync?.update(update)
      },
      () => {
        /* Kept as is; the next change or tab focus reloads it. */
      },
    )
  }

  const flush = () => {
    timer = undefined
    if (writing > 0 || !sync) return
    stale.forEach(reload)
    stale.clear()
  }

  const markStale = (slices: Slice[]) => {
    slices.forEach(slice => stale.add(slice))
    window.clearTimeout(timer)
    timer = window.setTimeout(flush, SETTLE_MS)
  }

  return {
    initialState: createEmptyState,

    connect(next) {
      sync = next
      let active = true
      let retry: number | undefined

      const loadAll = () => {
        loadSite(client).then(
          update => {
            if (!active) return
            next.update(update)
            next.setStatus('ready')
          },
          () => {
            if (!active) return
            next.setStatus('unreachable')
            retry = window.setTimeout(loadAll, RETRY_MS)
          },
        )
      }
      loadAll()

      const channel = client.channel('site')
      for (const [table, slice] of Object.entries(TABLE_SLICES)) {
        channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => markStale([slice]))
      }
      let subscribedBefore = false
      channel.subscribe(status => {
        if (status !== 'SUBSCRIBED') return
        // After a dropped connection, catch up on anything missed while offline.
        if (subscribedBefore) markStale(SLICES)
        subscribedBefore = true
      })

      const onVisible = () => {
        if (document.visibilityState === 'visible') markStale(SLICES)
      }
      document.addEventListener('visibilitychange', onVisible)

      return () => {
        active = false
        sync = null
        window.clearTimeout(retry)
        window.clearTimeout(timer)
        document.removeEventListener('visibilitychange', onVisible)
        void client.removeChannel(channel)
      }
    },

    async send(action) {
      const call = toCommand(action)
      if (!call) return
      writing++
      const { error } = await client.rpc(call.fn, call.args).then(
        response => response,
        () => ({ error: { message: 'Could not reach the server. Check your connection and try again.' } }),
      )
      writing--
      // Reload what the change touched: confirms it, or undoes the optimistic copy if it was refused.
      markStale(call.slices)
      if (error) throw failure(error)
    },
  }
}
