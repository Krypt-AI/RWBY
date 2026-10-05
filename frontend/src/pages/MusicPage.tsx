import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { ScheduleList } from '../components/ScheduleList'
import { VoteSummaryCard } from '../components/VoteSummaryCard'
import { PlaylistPlayer, PlaylistSettings } from '../components/music/PlaylistPlayer'
import { TrackForm, TrackQueue } from '../components/music/TrackQueue'
import weissArt from '../assets/images/Weiss.jpg'

export function MusicPage() {
  return (
    <div className="page accent-nora">
      <PageHeader
        eyebrow="Music"
        title="Turn it up"
        lead="The squad playlist, everyone’s current favourites and the song of the week."
        art={{ src: weissArt, position: 'center top' }}
      />

      <div className="split-layout is-wide-main">
        <div className="side-stack">
          <PlaylistPlayer />
          <Panel eyebrow="Community picks" title="Song queue">
            <TrackQueue />
            <TrackForm />
          </Panel>
        </div>

        <aside className="side-stack">
          <VoteSummaryCard category="music" />
          <Panel eyebrow="Schedule" title="Listening parties">
            <ScheduleList categories={['music']} />
          </Panel>
          <PlaylistSettings />
        </aside>
      </div>
    </div>
  )
}
