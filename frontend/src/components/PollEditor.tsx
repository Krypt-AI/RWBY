import { useState, type FormEvent } from 'react'
import type { Category } from '../lib/types'
import { useSite } from '../hooks/useSite'
import { createId } from '../utils/id'
import { Icon } from './Icon'
import { ModPanel } from './Panel'

export function PollEditor({ category }: { category: Category }) {
  const { state, moderate } = useSite()
  const poll = state.polls[category]
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')

  const addOption = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    moderate({ type: 'poll/addOption', category, id: createId(), title: title.trim(), note: note.trim() })
    setTitle('')
    setNote('')
  }

  const resetVotes = () => {
    if (window.confirm('Reset every vote in this poll? Viewers will be able to vote again.')) {
      moderate({ type: 'poll/resetVotes', category })
    }
  }

  return (
    <ModPanel title="Poll controls">
      <div className="mod-row">
        <button
          type="button"
          className="btn btn-mod"
          onClick={() => moderate({ type: 'poll/update', category, patch: { isOpen: !poll.isOpen } })}
        >
          <Icon name={poll.isOpen ? 'lock' : 'unlock'} size={16} />
          {poll.isOpen ? 'Close voting' : 'Reopen voting'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={resetVotes}>
          <Icon name="refresh" size={16} /> Reset votes
        </button>
      </div>

      <label className="field">
        <span>Poll title</span>
        <input
          key={`${category}:${poll.title}`}
          defaultValue={poll.title}
          onBlur={event => {
            const value = event.target.value.trim()
            if (value && value !== poll.title) moderate({ type: 'poll/update', category, patch: { title: value } })
          }}
        />
      </label>

      <ul className="mod-list">
        {poll.options.map(option => (
          <li key={option.id}>
            <span>
              <b>{option.title}</b>
              <small>{option.votes} votes</small>
            </span>
            <button
              type="button"
              className="icon-button is-danger"
              onClick={() => moderate({ type: 'poll/removeOption', category, optionId: option.id })}
              aria-label={`Remove ${option.title}`}
            >
              <Icon name="trash" size={15} />
            </button>
          </li>
        ))}
      </ul>

      <form className="form-grid" onSubmit={addOption}>
        <label className="field">
          <span>New option</span>
          <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Title" required />
        </label>
        <label className="field">
          <span>Detail (optional)</span>
          <input value={note} onChange={event => setNote(event.target.value)} placeholder="Studio · year" />
        </label>
        <button type="submit" className="btn btn-mod">
          <Icon name="plus" size={16} /> Add option
        </button>
      </form>
    </ModPanel>
  )
}
