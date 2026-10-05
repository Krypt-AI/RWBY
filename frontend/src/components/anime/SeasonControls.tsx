import { useSeasonalPoll } from '../../hooks/useSeasonalPoll'
import { seasonLabel } from '../../lib/animeSeasons'
import { Icon } from '../Icon'
import { ModPanel } from '../Panel'

/** Moderator tools for moving the seasonal poll to the season that's airing. */
export function SeasonControls() {
  const { current, isCurrent, source, lineupStatus, startSeason } = useSeasonalPoll()
  const label = seasonLabel(current)

  const loadLineup = () => {
    if (isCurrent && !window.confirm(`Reload the ${label} lineup? Every vote in the poll is reset.`)) return
    void startSeason()
  }

  return (
    <ModPanel title="Season lineup">
      <p className="muted">
        {isCurrent
          ? `The poll runs on the ${label} lineup.`
          : `${label} has started. Load its lineup to open a fresh poll.`}
      </p>
      <div className="mod-row">
        <button type="button" className="btn btn-mod" onClick={loadLineup} disabled={lineupStatus === 'loading'}>
          <Icon name="refresh" size={16} /> {isCurrent ? 'Reload' : 'Load'} {label} lineup
        </button>
      </div>
      {lineupStatus === 'empty' && (
        <p className="field-error" role="alert">
          No {label} lineup has been curated yet. Add the shows by hand below.
        </p>
      )}
      {lineupStatus === 'error' && (
        <p className="field-error" role="alert">
          The lineup didn’t load. Try again in a moment.
        </p>
      )}
      {source.id !== 'myanimelist' && (
        <div className="mod-row">
          <button type="button" className="btn btn-outline btn-small" disabled>
            Connect MyAnimeList
          </button>
          <p className="muted">Coming later: MyAnimeList will fill the lineup every season.</p>
        </div>
      )}
    </ModPanel>
  )
}
