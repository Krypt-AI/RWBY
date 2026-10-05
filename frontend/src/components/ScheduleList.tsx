import { useState, type FormEvent } from 'react'
import type { Category } from '../lib/types'
import { CATEGORIES, CATEGORY_META } from '../lib/categories'
import { useSite } from '../hooks/useSite'
import { useMode } from '../hooks/useMode'
import { useViewer } from '../hooks/useViewer'
import { formatSessionDate } from '../utils/format'
import { Icon } from './Icon'
import { EmptyState } from './Panel'

type ScheduleListProps = {
  limit?: number
  /** Only show sessions of these types. */
  categories?: Category[]
}

/** Upcoming sessions. Users can RSVP; moderators can remove entries. */
export function ScheduleList({ limit, categories }: ScheduleListProps) {
  const { state, moderate } = useSite()
  const { isModerator } = useMode()
  const { rsvps, toggleRsvp } = useViewer()
  const matching = categories ? state.schedule.filter(session => categories.includes(session.category)) : state.schedule
  const sessions = limit ? matching.slice(0, limit) : matching

  if (sessions.length === 0) return <EmptyState>Nothing scheduled yet.</EmptyState>

  return (
    <ul className="schedule">
      {sessions.map(session => {
        const meta = CATEGORY_META[session.category]
        const going = rsvps.includes(session.id)
        return (
          <li key={session.id} className={`schedule-item accent-${meta.accent}`}>
            <span className="schedule-tag">{meta.label}</span>
            <div className="schedule-info">
              <b>{session.title}</b>
              <time dateTime={session.startsAt}>{formatSessionDate(session.startsAt)}</time>
            </div>
            <button
              type="button"
              className={`btn btn-small ${going ? 'btn-ghost is-on' : 'btn-outline'}`}
              onClick={() => toggleRsvp(session.id)}
              aria-pressed={going}
            >
              {going ? (
                <>
                  <Icon name="check" size={14} /> Going
                </>
              ) : (
                'RSVP'
              )}
            </button>
            {isModerator && (
              <button
                type="button"
                className="icon-button is-danger"
                onClick={() => moderate({ type: 'schedule/remove', id: session.id })}
                aria-label={`Remove ${session.title}`}
              >
                <Icon name="trash" size={15} />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function ScheduleForm() {
  const { moderate } = useSite()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('game')
  const [startsAt, setStartsAt] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !startsAt) return
    moderate({
      type: 'schedule/add',
      session: { title: title.trim(), category, startsAt: new Date(startsAt).toISOString() },
    })
    setTitle('')
    setStartsAt('')
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="field">
        <span>Session title</span>
        <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Game night" required />
      </label>
      <label className="field">
        <span>Type</span>
        <select value={category} onChange={event => setCategory(event.target.value as Category)}>
          {CATEGORIES.map(value => (
            <option key={value} value={value}>
              {CATEGORY_META[value].label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Starts</span>
        <input type="datetime-local" value={startsAt} onChange={event => setStartsAt(event.target.value)} required />
      </label>
      <button type="submit" className="btn btn-mod">
        <Icon name="plus" size={16} /> Add session
      </button>
    </form>
  )
}
