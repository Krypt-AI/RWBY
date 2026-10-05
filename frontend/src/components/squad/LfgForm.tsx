import { useState, type FormEvent } from 'react'
import type { LfgPost } from '../../lib/types'
import { GAMES, GAME_BY_ID } from '../../data/games'
import { useLfg } from '../../hooks/useLfg'
import { ActingAs } from '../ActingAs'
import { ChipGroup } from '../ChipGroup'
import { Icon } from '../Icon'

type GameChoice = LfgPost['game']

const OTHER_MODES = ['Casual', 'Competitive', 'Co-op']
const SLOT_CHOICES = [1, 2, 3, 4]
const NOTE_LIMIT = 140

function modesFor(game: GameChoice): string[] {
  return game === 'other' ? OTHER_MODES : GAME_BY_ID[game].modes
}

/** Post a "looking for group" ad. Author is the viewer's chat name. */
export function LfgForm() {
  const { publish } = useLfg()
  const [game, setGame] = useState<GameChoice>(GAMES[0]?.id ?? 'other')
  const [mode, setMode] = useState(() => modesFor(game)[0] ?? '')
  const [rank, setRank] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [slots, setSlots] = useState(1)
  const [note, setNote] = useState('')

  const roleNames = game === 'other' ? [] : GAME_BY_ID[game].roles.map(role => role.name)

  const changeGame = (next: GameChoice) => {
    setGame(next)
    setMode(modesFor(next)[0] ?? '')
    setRoles([])
  }

  const toggleRole = (role: string) =>
    setRoles(current => (current.includes(role) ? current.filter(item => item !== role) : [...current, role]))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!publish({ game, mode, rank: rank.trim(), roles, slots, note: note.trim() })) return
    setRank('')
    setRoles([])
    setNote('')
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="form-grid">
        <label className="field">
          <span>Game</span>
          <select value={game} onChange={event => changeGame(event.target.value as GameChoice)}>
            {GAMES.map(option => (
              <option key={option.id} value={option.id}>
                {option.shortName}
              </option>
            ))}
            <option value="other">Other game</option>
          </select>
        </label>
        <label className="field">
          <span>Mode</span>
          <select value={mode} onChange={event => setMode(event.target.value)}>
            {modesFor(game).map(option => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Rank (optional)</span>
          <input
            value={rank}
            onChange={event => setRank(event.target.value)}
            placeholder={game === 'other' ? 'Any' : GAME_BY_ID[game].rankExample}
            maxLength={24}
          />
        </label>
        <label className="field">
          <span>Spots open</span>
          <select value={slots} onChange={event => setSlots(Number(event.target.value))}>
            {SLOT_CHOICES.map(count => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>
      </div>

      {roleNames.length > 0 && (
        <fieldset className="field">
          <legend>Roles needed (optional)</legend>
          <ChipGroup
            label="Roles needed"
            options={roleNames.map(role => ({ value: role, label: role }))}
            isSelected={role => roles.includes(role)}
            onSelect={toggleRole}
          />
        </fieldset>
      )}

      <label className="field">
        <span>Note</span>
        <textarea
          value={note}
          onChange={event => setNote(event.target.value)}
          rows={2}
          maxLength={NOTE_LIMIT}
          placeholder="Voice on? Chill or tryhard? When are you starting?"
        />
      </label>

      <div className="mod-row">
        <button type="submit" className="btn btn-primary">
          <Icon name="plus" size={16} /> Post squad
        </button>
        <p className="muted">
          <ActingAs verb="Posting" />
        </p>
      </div>
    </form>
  )
}
