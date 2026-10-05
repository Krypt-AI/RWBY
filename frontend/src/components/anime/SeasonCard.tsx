import { useSeasonalPoll } from '../../hooks/useSeasonalPoll'
import { seasonLabel, seasonWeek, WEEKS_PER_SEASON } from '../../lib/animeSeasons'
import { Panel } from '../Panel'

/** Which season the poll covers, how far into it we are and where the lineup comes from. */
export function SeasonCard() {
  const { poll, current, isCurrent, source } = useSeasonalPoll()
  const season = poll.season ?? current

  return (
    <Panel title={seasonLabel(season)}>
      {isCurrent ? (
        <p className="season-progress">
          <b>
            Week {seasonWeek(season, new Date())} of {WEEKS_PER_SEASON}
          </b>{' '}
          · {poll.options.length} shows in the running
        </p>
      ) : (
        <p className="season-progress">{seasonLabel(current)} has started. Its lineup is on the way.</p>
      )}
      <dl className="season-facts">
        <div>
          <dt>Lineup</dt>
          <dd>{source.name}</dd>
        </div>
        <div>
          <dt>MyAnimeList</dt>
          <dd>{source.id === 'myanimelist' ? 'Connected' : 'Not connected yet. Once it is, each lineup fills itself.'}</dd>
        </div>
      </dl>
    </Panel>
  )
}
