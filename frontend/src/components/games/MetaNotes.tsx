import type { GameGuide } from '../../data/games/types'
import { Panel } from '../Panel'

export function MetaNotes({ game }: { game: GameGuide }) {
  return (
    <Panel eyebrow={`Patch ${game.patch}`} title="What matters this patch">
      <ul className="meta-notes">
        {game.metaNotes.map(note => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </Panel>
  )
}
