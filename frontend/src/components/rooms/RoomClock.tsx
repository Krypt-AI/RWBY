import { useId, useState, type FormEvent } from 'react'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import { useNow } from '../../hooks/useNow'
import { roomPhase } from '../../lib/rooms'
import { toLocalInputValue } from '../../utils/format'
import { clockCopy } from './clockCopy'

/** Quick picks, in minutes from now. */
const PRESETS = [15, 30, 60]

const presetLabel = (minutes: number) => (minutes < 60 ? `+${minutes} min` : `+${minutes / 60} hr`)

/** Rounded up to the next 5 minutes, so quick picks land on times people say out loud. */
function minutesFromNow(minutes: number): Date {
  const date = new Date(Date.now() + minutes * 60_000)
  date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5, 0, 0)
  return date
}

/** Countdown to the squad's start time. Room members (and moderators) can set or clear it. */
export function RoomClock({ controls }: { controls: GameRoomControls }) {
  const now = useNow()
  const { room, canEdit, setStart } = controls
  const phase = roomPhase(room.startsAt, now)
  const copy = clockCopy(phase, room.startsAt, now)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const errorId = useId()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const date = new Date(draft)
    if (!draft || Number.isNaN(date.getTime())) {
      setError('Pick a date and a time.')
    } else if (date.getTime() <= Date.now()) {
      setError('That time has passed. Pick one in the future.')
    } else {
      setStart(date.toISOString())
      setDraft('')
      setError('')
    }
  }

  return (
    <div className={`room-clock is-${phase}`}>
      <div className="clock-face">
        <span className="clock-label">{copy.label}</span>
        <span className="clock-value" role={copy.ticking ? 'timer' : undefined}>
          {copy.value}
        </span>
        <span className="clock-note">{copy.note}</span>
      </div>

      {canEdit ? (
        <div className="clock-controls">
          <div className="chip-group" role="group" aria-label="Start in">
            {PRESETS.map(minutes => (
              <button
                key={minutes}
                type="button"
                className="chip"
                onClick={() => setStart(minutesFromNow(minutes).toISOString())}
              >
                {presetLabel(minutes)}
              </button>
            ))}
          </div>
          <form className="clock-form" onSubmit={submit} noValidate>
            <label className="field">
              <span>Or pick a time</span>
              <input
                type="datetime-local"
                value={draft}
                min={toLocalInputValue(new Date(now))}
                onChange={event => setDraft(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
              />
            </label>
            <button type="submit" className="btn btn-outline btn-small">
              Set time
            </button>
          </form>
          {error && (
            <p id={errorId} className="field-error" role="alert">
              {error}
            </p>
          )}
          {room.startsAt && (
            <button type="button" className="link-button clock-clear" onClick={() => setStart(null)}>
              Clear start time
            </button>
          )}
        </div>
      ) : (
        <p className="room-note">Join the room to set the start time.</p>
      )}
    </div>
  )
}
