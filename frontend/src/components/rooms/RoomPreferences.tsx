import { useMemo } from 'react'
import type { GameGuide } from '../../data/games/types'
import { characterPool, roleName } from '../../data/games'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import { FAVOURITE_LIMIT } from '../../lib/rooms'
import { formatList } from '../../utils/format'
import { ChipGroup } from '../ChipGroup'
import { HeroSearch } from './HeroSearch'
import { PickSlots } from './PickSlots'

/** Chip value for "no role": the member fills whatever the squad needs. */
const FILL = 'fill'

const FAVOURITE_LABELS = ['Top pick', '2nd pick', '3rd pick']

/** The viewer's own role and favourites, which the room's lineup is built around. Members only. */
export function RoomPreferences({ game, controls }: { game: GameGuide; controls: GameRoomControls }) {
  const { room, viewerId, setPreferences } = controls
  const pool = useMemo(() => characterPool(game), [game])
  const me = room.members.find(member => member.id === viewerId)
  if (!me) return null

  const { role, picks } = me
  const byName = new Map(pool.map(character => [character.name, character]))
  const favourites = picks.map(name => byName.get(name) ?? { name })
  const roleOptions = [
    { value: FILL, label: 'Fill' },
    ...game.roles.map(option => ({ value: option.id, label: option.name })),
  ]
  const sharing = room.members
    .filter(member => member.id !== me.id && role && member.role === role)
    .map(member => member.name)
  const { one, many } = game.characterTerm

  return (
    <section className="panel room-preferences" aria-labelledby="preferences-title">
      <div className="panel-head">
        <h2 className="panel-title" id="preferences-title">
          Your role and picks
        </h2>
      </div>

      <fieldset className="field">
        <legend>Role</legend>
        <ChipGroup
          label="Your role"
          options={roleOptions}
          isSelected={value => value === (role ?? FILL)}
          onSelect={value => setPreferences({ role: value === FILL ? null : value, picks })}
        />
      </fieldset>
      {sharing.length > 0 && role && (
        <p className="muted">
          {formatList(sharing)} also {sharing.length === 1 ? 'plays' : 'play'} {roleName(game, role)}.
        </p>
      )}

      <PickSlots
        label={`Your favourite ${many}`}
        side="ally"
        count={FAVOURITE_LIMIT}
        picks={favourites}
        placeholder={index => FAVOURITE_LABELS[index] ?? `Pick ${index + 1}`}
        onRemove={name => setPreferences({ role, picks: picks.filter(pick => pick !== name) })}
      />
      <HeroSearch
        label={`Add a favourite ${one}`}
        noun={many}
        options={pool}
        browse={role ? pool.filter(character => character.roleIds.includes(role)) : undefined}
        taken={new Set(picks)}
        fullText={picks.length >= FAVOURITE_LIMIT ? `${FAVOURITE_LIMIT} favourites picked` : undefined}
        onPick={name => setPreferences({ role, picks: [...picks, name] })}
      />
    </section>
  )
}
