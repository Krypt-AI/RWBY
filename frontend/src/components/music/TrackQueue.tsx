import { useState, type FormEvent } from 'react'
import { useMode } from '../../hooks/useMode'
import { useSite } from '../../hooks/useSite'
import { useTracks } from '../../hooks/useTracks'
import { isWebUrl } from '../../utils/embed'
import { Icon } from '../Icon'
import { EmptyState } from '../Panel'

/** Community song picks, most-liked first. */
export function TrackQueue({ limit }: { limit?: number }) {
  const { tracks, isLiked, toggleLike } = useTracks()
  const { isModerator } = useMode()
  const { moderate } = useSite()
  const shown = limit ? tracks.slice(0, limit) : tracks

  if (shown.length === 0) return <EmptyState>No songs yet. Drop the first one.</EmptyState>

  return (
    <ol className="track-list">
      {shown.map((track, index) => {
        const liked = isLiked(track)
        return (
          <li key={track.id} className="track">
            <span className="track-rank" aria-hidden="true">
              {index + 1}
            </span>
            <span className="track-info">
              <b>
                {isWebUrl(track.url) ? (
                  <a href={track.url} target="_blank" rel="noreferrer">
                    {track.title} <Icon name="external" size={12} />
                  </a>
                ) : (
                  track.title
                )}
              </b>
              <small>
                {track.artist} · added by {track.addedBy}
              </small>
            </span>
            <button
              type="button"
              className={`like-button ${liked ? 'is-on' : ''}`}
              onClick={() => toggleLike(track)}
              aria-pressed={liked}
              aria-label={`${liked ? 'Unlike' : 'Like'} ${track.title}`}
            >
              <Icon name="heart" size={16} />
              <span>{track.likes}</span>
            </button>
            {isModerator && (
              <button
                type="button"
                className="icon-button is-danger"
                onClick={() => moderate({ type: 'track/remove', id: track.id })}
                aria-label={`Remove ${track.title}`}
              >
                <Icon name="trash" size={15} />
              </button>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function TrackForm() {
  const { add } = useTracks()
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [url, setUrl] = useState('')
  const urlInvalid = url.trim() !== '' && !isWebUrl(url)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !artist.trim() || urlInvalid) return
    if (!add({ title: title.trim(), artist: artist.trim(), url: url.trim() })) return
    setTitle('')
    setArtist('')
    setUrl('')
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="field">
        <span>Song</span>
        <input value={title} onChange={event => setTitle(event.target.value)} maxLength={80} required />
      </label>
      <label className="field">
        <span>Artist</span>
        <input value={artist} onChange={event => setArtist(event.target.value)} maxLength={80} required />
      </label>
      <label className="field">
        <span>Link (optional)</span>
        <input
          type="url"
          value={url}
          onChange={event => setUrl(event.target.value)}
          placeholder="Spotify, YouTube…"
          aria-invalid={urlInvalid}
        />
      </label>
      <button type="submit" className="btn btn-primary" disabled={urlInvalid}>
        <Icon name="plus" size={16} /> Add song
      </button>
    </form>
  )
}
