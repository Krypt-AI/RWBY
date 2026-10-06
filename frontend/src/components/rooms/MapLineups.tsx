import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { GameGuide } from '../../data/games/types'
import { lineupGroup, roleName } from '../../data/games'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import { bestFit, seatComp, type CompFit, type CompSeat } from '../../lib/lineupPlanner'
import { ChipGroup } from '../ChipGroup'
import { Icon } from '../Icon'
import { HeroPortrait } from '../games/HeroPortrait'

/**
 * The guide's meta comps by map, with the squad seated by favourite first, then by role. The chosen
 * comp is shared, so everyone in the room sees the same comp and the same seats.
 */
export function MapLineups({ game, controls }: { game: GameGuide; controls: GameRoomControls }) {
  const { room, canEdit, setLineup } = controls
  const fits = useMemo(() => game.lineups.map(lineup => seatComp(lineup, room.members)), [game.lineups, room.members])
  const fit = fits.find(item => item.lineup.id === room.lineup) ?? fits[0]
  if (!fit) return null

  const { lineup, seats } = fit
  const group = lineupGroup(lineup)
  const groups = [...new Set(fits.map(item => lineupGroup(item.lineup)))]
  const inGroup = fits.filter(item => lineupGroup(item.lineup) === group)
  const best = bestFit(inGroup)
  /** A map's comps are listed most played first, so picking a map starts there. */
  const selectGroup = (name: string) => {
    const first = fits.find(item => lineupGroup(item.lineup) === name)
    if (first) setLineup(first.lineup.id)
  }

  return (
    <section className="panel map-lineups" aria-labelledby="map-lineups-title">
      <div className="panel-head">
        <h2 className="panel-title" id="map-lineups-title">
          Lineups by map
        </h2>
      </div>
      <p className="card-note">
        Pick the map you landed on, then one of the comps pros played there. Everyone in the room sees the same comp,
        and your squad takes its slots by favourite {game.characterTerm.one} first, then by role.
      </p>
      <ChipGroup
        label="Map"
        options={groups.map(name => ({ value: name, label: name }))}
        isSelected={value => value === group}
        onSelect={selectGroup}
        disabled={!canEdit}
      />
      {inGroup.length > 1 && (
        <ChipGroup
          label={`Comps for ${group}`}
          options={inGroup.map(item => ({ value: item.lineup.id, label: item.lineup.name }))}
          isSelected={value => value === lineup.id}
          onSelect={setLineup}
          disabled={!canEdit}
        />
      )}
      {!canEdit ? (
        <p className="room-note">Join the room to choose the map and comp.</p>
      ) : (
        best &&
        best !== fit && (
          <p className="muted">
            Best fit for your squad here:{' '}
            <button type="button" className="link-button" onClick={() => setLineup(best.lineup.id)}>
              {best.lineup.name}
            </button>
          </p>
        )
      )}

      <div className="comp-head">
        <div>
          <p className="eyebrow">{lineup.map ? `${lineup.map} · ${lineup.context}` : lineup.context}</p>
          <h3 className="panel-title">{lineup.name}</h3>
        </div>
        {best === fit && <span className="tag">Best fit for your squad</span>}
        <span className="record">{lineup.record}</span>
      </div>
      <ol className="lane-plan">
        {seats.map(seat => (
          <CompRow key={seat.slot.name} game={game} seat={seat} />
        ))}
      </ol>
      <p className="card-note">{lineup.plan}</p>
      {lineup.example && <p className="fine-print">{lineup.example}</p>}

      {room.members.length > 0 && <p className="fine-print">{fitSummary(fit)}</p>}
      <div className="map-lineups-links">
        <Link to={`/games/${game.id}/lineups`} className="link-arrow">
          All lineups <Icon name="arrow" size={14} />
        </Link>
        <Link to={`/games/${game.id}/builds`} className="link-arrow">
          {game.loadoutsTitle} <Icon name="arrow" size={14} />
        </Link>
      </div>
    </section>
  )
}

function CompRow({ game, seat }: { game: GameGuide; seat: CompSeat }) {
  const { slot, member, match } = seat
  const role = roleName(game, slot.roleId)

  return (
    <li className="lane-row">
      <p className="lane-seat">
        <span className="slot-role">{role}</span>
        <span className={`lane-player ${member ? '' : 'is-open'}`}>
          {member ? member.name : 'Open'}
          {match === 'filling' && <small> · filling</small>}
        </span>
      </p>
      <HeroPortrait name={slot.name} />
      <div className="lane-body">
        <b className="lane-hero">{slot.name}</b>
        {member && (match === 'favourite' || match === 'role') && (
          <ul className="pick-reasons">
            <li className="is-good">
              <Icon name="check" size={13} />
              {match === 'favourite' ? `${member.name}’s favourite` : `${member.name} plays ${role}`}
            </li>
          </ul>
        )}
      </div>
    </li>
  )
}

/** "Your squad: 2 on a favourite, 1 on their role, 1 filling. 1 slot is open." */
function fitSummary({ seats, favourites, onRole }: CompFit): string {
  const filling = seats.filter(seat => seat.match === 'filling').length
  const parts = [
    favourites > 0 && `${favourites} on a favourite`,
    onRole > 0 && `${onRole} on their role`,
    filling > 0 && `${filling} filling`,
  ].filter((part): part is string => Boolean(part))
  const open = seats.length - seats.filter(seat => seat.member).length
  const openNote = open > 0 ? ` ${open} ${open === 1 ? 'slot is' : 'slots are'} open.` : ''
  return `Your squad: ${parts.join(', ')}.${openNote}`
}
