# Backend (planned)

Nothing runs here yet. The app is frontend-only: all state lives in each visitor's browser
(`localStorage`), so friends on different devices don't see each other's squads, songs, chat or votes.

## What the backend will own

| Concern | Today (frontend) | With the backend |
| --- | --- | --- |
| Persistence | `frontend/src/services/storage.ts` | API calls backed by the [database](../database/README.md) |
| Moderator access | Shared passcode in `VITE_MOD_PASSCODE` (demo gate only) | Real accounts with a moderator role checked on the server |
| Viewer actions | `ViewerAction` in `frontend/src/lib/SiteContext.tsx` | Endpoints any signed-in user may call |
| Moderator actions | Every other `SiteAction` in `frontend/src/lib/siteReducer.ts` | Endpoints restricted to moderators |
| Cross-tab sync | `storage` events (same browser only) | Realtime updates pushed to every connected client |

## Swap point

`frontend/src/services/storage.ts` is the only file that touches storage. Replace its
`load` / `save` / `subscribe` functions with API and realtime calls and the hooks and pages keep working.

Options: a hosted backend such as Supabase (auth, Postgres, row-level security and realtime in one),
or a small Node API in this folder.
