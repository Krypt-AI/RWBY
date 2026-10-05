import { useEffect, useState, type FormEvent } from 'react'
import { useSite } from '../hooks/useSite'
import { Icon } from './Icon'

/** Site-wide notice set by moderators, shown above every page. */
export function AnnouncementBanner() {
  const { announcement } = useSite().state
  if (!announcement.visible || !announcement.text.trim()) return null
  return (
    <div className="announcement" role="status">
      <Icon name="megaphone" size={16} />
      <p>{announcement.text}</p>
    </div>
  )
}

export function AnnouncementEditor() {
  const { state, moderate } = useSite()
  const { announcement } = state
  const [text, setText] = useState(announcement.text)

  useEffect(() => {
    setText(announcement.text)
  }, [announcement.text])

  const save = (event: FormEvent) => {
    event.preventDefault()
    moderate({ type: 'announcement/update', patch: { text: text.trim() } })
  }

  return (
    <form className="form-stack" onSubmit={save}>
      <label className="field">
        <span>Announcement text</span>
        <textarea value={text} onChange={event => setText(event.target.value)} rows={3} maxLength={200} />
      </label>
      <div className="mod-row">
        <button type="submit" className="btn btn-mod">
          Save announcement
        </button>
        <label className="toggle">
          <input
            type="checkbox"
            checked={announcement.visible}
            onChange={event => moderate({ type: 'announcement/update', patch: { visible: event.target.checked } })}
          />
          <span>Show banner</span>
        </label>
      </div>
    </form>
  )
}
