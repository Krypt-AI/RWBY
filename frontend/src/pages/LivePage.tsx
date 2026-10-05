import { useSite } from '../hooks/useSite'
import { PageHeader } from '../components/PageHeader'
import { ModPanel, Panel } from '../components/Panel'
import { StatusPill } from '../components/StatusPill'
import { StreamPlayer } from '../components/StreamPlayer'
import { ChatPanel } from '../components/ChatPanel'
import { ScheduleForm, ScheduleList } from '../components/ScheduleList'
import { StreamSettings } from '../components/StreamSettings'

export function LivePage() {
  const { stream } = useSite().state

  return (
    <div className="page">
      <PageHeader
        eyebrow="Live stream"
        title={stream.title}
        lead={`Hosted by ${stream.host}`}
        actions={<StatusPill tone={stream.isLive ? 'live' : 'offline'} />}
      />

      <div className="live-layout">
        <div className="live-main">
          <StreamPlayer stream={stream} />
          <StreamSettings />
          <Panel eyebrow="Schedule" title="Upcoming sessions">
            <ScheduleList />
          </Panel>
          <ModPanel title="Add a session">
            <ScheduleForm />
          </ModPanel>
        </div>
        <ChatPanel />
      </div>
    </div>
  )
}
