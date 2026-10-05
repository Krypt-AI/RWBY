import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSite } from '../hooks/useSite'
import { useMode } from '../hooks/useMode'
import { useViewer } from '../hooks/useViewer'
import { formatTime, initials } from '../utils/format'
import { Icon } from './Icon'
import { EmptyState } from './Panel'

const MAX_LENGTH = 280

export function ChatPanel() {
  const { state, dispatch, moderate } = useSite()
  const { isModerator } = useMode()
  const { name, setName } = useViewer()
  const [draft, setDraft] = useState('')
  const [editingName, setEditingName] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)

  const pinned = state.chat.find(message => message.pinned)

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [state.chat.length])

  const send = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    dispatch({ type: 'chat/send', author: name, text, fromModerator: isModerator })
    setDraft('')
  }

  const saveName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setName(new FormData(event.currentTarget).get('name')?.toString() ?? '')
    setEditingName(false)
  }

  return (
    <section className="panel chat" aria-label="Live chat">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Live chat</p>
          <h2 className="panel-title">The common room</h2>
        </div>
        {isModerator && state.chat.length > 0 && (
          <button type="button" className="btn btn-ghost btn-small" onClick={() => moderate({ type: 'chat/clear' })}>
            Clear chat
          </button>
        )}
      </div>

      {pinned && (
        <p className="chat-pinned">
          <Icon name="pin" size={14} />
          <span>
            <b>{pinned.author}:</b> {pinned.text}
          </span>
        </p>
      )}

      <ol className="chat-list" ref={listRef} aria-live="polite">
        {state.chat.length === 0 && <EmptyState>No messages yet. Say hello to the room.</EmptyState>}
        {state.chat.map(message => (
          <li key={message.id} className={`chat-message ${message.fromModerator ? 'is-mod' : ''}`}>
            <span className="avatar" aria-hidden="true">
              {initials(message.author)}
            </span>
            <div className="chat-body">
              <p className="chat-meta">
                <b>{message.author}</b>
                {message.fromModerator && <span className="chat-badge">Mod</span>}
                <time dateTime={message.at}>{formatTime(message.at)}</time>
              </p>
              <p className="chat-text">{message.text}</p>
            </div>
            {isModerator && (
              <div className="chat-tools">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => moderate({ type: 'chat/togglePin', id: message.id })}
                  aria-label={message.pinned ? 'Unpin message' : 'Pin message'}
                  aria-pressed={message.pinned}
                >
                  <Icon name="pin" size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button is-danger"
                  onClick={() => moderate({ type: 'chat/remove', id: message.id })}
                  aria-label="Delete message"
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>

      {editingName ? (
        <form className="chat-name" onSubmit={saveName}>
          <label className="visually-hidden" htmlFor="chat-name">
            Display name
          </label>
          <input id="chat-name" name="name" defaultValue={name} maxLength={24} autoFocus />
          <button type="submit" className="btn btn-ghost btn-small">
            Save
          </button>
        </form>
      ) : (
        <p className="chat-name">
          Chatting as <b>{name}</b>
          <button type="button" className="link-button" onClick={() => setEditingName(true)}>
            Change
          </button>
        </p>
      )}

      <form className="chat-compose" onSubmit={send}>
        <label className="visually-hidden" htmlFor="chat-input">
          Message
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={event => setDraft(event.target.value)}
          placeholder="Send a message"
          maxLength={MAX_LENGTH}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary btn-icon" aria-label="Send message" disabled={!draft.trim()}>
          <Icon name="send" size={16} />
        </button>
      </form>
    </section>
  )
}
