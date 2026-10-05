import type { Stream } from '../lib/types'
import { toEmbedUrl } from '../utils/embed'
import offlinePoster from '../assets/images/RubyRose.jpg'

export function StreamPlayer({ stream }: { stream: Stream }) {
  const embedUrl = stream.isLive ? toEmbedUrl(stream.url) : null

  if (embedUrl) {
    return (
      <div className="player">
        <iframe
          src={embedUrl}
          title={stream.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }

  const message = stream.isLive
    ? 'We are live, but the player link is missing. A moderator needs to add it.'
    : 'The stream is offline. Check the schedule for the next session.'

  return (
    <div className="player is-offline">
      <img src={offlinePoster} alt="" />
      <div className="player-message">
        <p className="player-kicker">{stream.isLive ? 'Live, no player' : 'Off air'}</p>
        <p>{message}</p>
      </div>
    </div>
  )
}
