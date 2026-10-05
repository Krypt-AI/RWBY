import { useEffect, useState, type FormEvent } from 'react'
import { useSite } from '../../hooks/useSite'
import { toPlaylistEmbedUrl } from '../../utils/embed'
import { EmptyState, ModPanel, Panel } from '../Panel'

/** The shared Spotify / YouTube playlist, embedded. */
export function PlaylistPlayer() {
  const { playlistUrl } = useSite().state.music
  const embedUrl = toPlaylistEmbedUrl(playlistUrl)

  return (
    <Panel eyebrow="Shared playlist" title="On repeat">
      {embedUrl ? (
        <iframe
          className="playlist-frame"
          src={embedUrl}
          title="Community playlist"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      ) : (
        <EmptyState>No playlist linked yet. A moderator can add a Spotify or YouTube playlist.</EmptyState>
      )}
    </Panel>
  )
}

export function PlaylistSettings() {
  const { state, moderate } = useSite()
  const { playlistUrl } = state.music
  const [draft, setDraft] = useState(playlistUrl)

  // Pick up changes made in another tab.
  useEffect(() => {
    setDraft(playlistUrl)
  }, [playlistUrl])

  const invalid = draft.trim() !== '' && toPlaylistEmbedUrl(draft) === null

  const save = (event: FormEvent) => {
    event.preventDefault()
    if (!invalid) moderate({ type: 'music/update', patch: { playlistUrl: draft.trim() } })
  }

  return (
    <ModPanel title="Playlist">
      <form className="form-stack" onSubmit={save}>
        <label className="field">
          <span>Spotify or YouTube playlist link</span>
          <input
            type="url"
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="https://open.spotify.com/playlist/…"
            aria-invalid={invalid}
          />
          {invalid && <small className="field-error">Use a Spotify playlist, album or track, or a YouTube playlist.</small>}
        </label>
        <button type="submit" className="btn btn-mod" disabled={invalid}>
          Save playlist
        </button>
      </form>
    </ModPanel>
  )
}
