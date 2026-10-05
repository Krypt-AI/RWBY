import { useEffect, useState, type FormEvent } from 'react'
import { useSite } from '../hooks/useSite'
import { toEmbedUrl } from '../utils/embed'
import { Icon } from './Icon'
import { ModPanel } from './Panel'

export function StreamSettings() {
  const { state, moderate } = useSite()
  const { stream } = state
  const { title, host, url } = stream
  const [draft, setDraft] = useState({ title, host, url })

  // Pick up changes made elsewhere (another tab or the control room).
  useEffect(() => {
    setDraft({ title, host, url })
  }, [title, host, url])

  const urlInvalid = draft.url.trim() !== '' && toEmbedUrl(draft.url) === null

  const save = (event: FormEvent) => {
    event.preventDefault()
    if (urlInvalid) return
    moderate({
      type: 'stream/update',
      patch: { title: draft.title.trim(), host: draft.host.trim(), url: draft.url.trim() },
    })
  }

  return (
    <ModPanel title="Stream controls">
      <div className="mod-row">
        <button
          type="button"
          className={`btn ${stream.isLive ? 'btn-ghost' : 'btn-primary'}`}
          onClick={() => moderate({ type: 'stream/update', patch: { isLive: !stream.isLive } })}
        >
          <Icon name="live" size={16} />
          {stream.isLive ? 'End stream' : 'Go live'}
        </button>
      </div>

      <form className="form-stack" onSubmit={save}>
        <label className="field">
          <span>Stream title</span>
          <input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} required />
        </label>
        <label className="field">
          <span>Host</span>
          <input value={draft.host} onChange={event => setDraft({ ...draft, host: event.target.value })} />
        </label>
        <label className="field">
          <span>YouTube or Twitch link</span>
          <input
            type="url"
            value={draft.url}
            onChange={event => setDraft({ ...draft, url: event.target.value })}
            placeholder="https://www.twitch.tv/yourchannel"
            aria-invalid={urlInvalid}
          />
          {urlInvalid && <small className="field-error">Use a YouTube video or Twitch channel link.</small>}
        </label>
        <button type="submit" className="btn btn-mod" disabled={urlInvalid}>
          Save stream details
        </button>
      </form>
    </ModPanel>
  )
}
