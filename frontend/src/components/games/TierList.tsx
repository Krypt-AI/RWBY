import { useState } from 'react'
import type { GameGuide, LiveRates, Tier, TierEntry } from '../../data/games/types'
import { roleName } from '../../data/games'
import { ChipGroup } from '../ChipGroup'
import { Icon } from '../Icon'
import { EmptyState } from '../Panel'

type MetricKey = 'winRate' | 'pickRate' | 'banRate' | 'proRate'

const METRICS: { key: MetricKey; label: string; title: string }[] = [
  { key: 'winRate', label: 'Win', title: 'Win rate' },
  { key: 'pickRate', label: 'Pick', title: 'Pick rate' },
  { key: 'banRate', label: 'Ban', title: 'Ban rate' },
  { key: 'proRate', label: 'Pro', title: 'Pro pick rate' },
]

const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D', 'F']

const ALL_ROLES = 'all'

type TierListProps = {
  game: GameGuide
  /** Live rates by name. They replace the snapshot rates; tier placements stay curated. */
  rates?: Map<string, LiveRates>
}

/** Tier list grouped by tier and filterable by role. Shows only the metrics this game publishes. */
export function TierList({ game, rates }: TierListProps) {
  const [roleId, setRoleId] = useState(ALL_ROLES)
  const tiers = rates ? game.tiers.map(entry => ({ ...entry, ...rates.get(entry.name) })) : game.tiers
  const metrics = METRICS.filter(metric => tiers.some(entry => entry[metric.key] !== undefined))
  const entries = roleId === ALL_ROLES ? tiers : tiers.filter(entry => entry.roleId === roleId)
  const roleOptions = [
    { value: ALL_ROLES, label: 'All' },
    ...game.roles.map(role => ({ value: role.id, label: role.name })),
  ]

  return (
    <section className="panel" aria-labelledby="tier-list-title">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{game.tierSource}</p>
          <h2 className="panel-title" id="tier-list-title">
            Tier list
          </h2>
        </div>
        {rates && <span className="live-chip">Live rates</span>}
      </div>

      <ChipGroup
        label="Filter by role"
        options={roleOptions}
        isSelected={value => value === roleId}
        onSelect={setRoleId}
      />

      {entries.length === 0 ? (
        <EmptyState>No ranked picks for this role yet.</EmptyState>
      ) : (
        <div className="table-scroll">
          <table className="tier-table">
            <thead>
              <tr>
                <th scope="col">Pick</th>
                {metrics.map(metric => (
                  <th key={metric.key} scope="col" className="num">
                    <abbr title={metric.title}>{metric.label}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            {TIERS.map(tier => {
              const rows = entries.filter(entry => entry.tier === tier)
              if (rows.length === 0) return null
              return (
                <tbody key={tier} className={`tier-group tier-${tier.toLowerCase()}`}>
                  <tr className="tier-heading">
                    <th scope="rowgroup" colSpan={metrics.length + 1}>
                      <span className="tier-badge">{tier}</span> {tier} tier
                    </th>
                  </tr>
                  {rows.map(entry => (
                    <tr key={entry.name}>
                      <th scope="row">
                        <TierName game={game} entry={entry} />
                      </th>
                      {metrics.map(metric => (
                        <RateCell key={metric.key} value={entry[metric.key]} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              )
            })}
          </table>
        </div>
      )}
    </section>
  )
}

/** A percentage, or a dim dash when the sources don't publish that rate. */
function RateCell({ value }: { value: number | undefined }) {
  if (value === undefined) {
    return (
      <td className="num is-missing">
        <span aria-hidden="true">—</span>
        <span className="visually-hidden">no data</span>
      </td>
    )
  }
  return <td className="num">{value.toFixed(1)}%</td>
}

function TierName({ game, entry }: { game: GameGuide; entry: TierEntry }) {
  const role = roleName(game, entry.roleId)
  return (
    <span className="tier-name">
      <b>
        {entry.name}
        {entry.trend && (
          <span className={`trend is-${entry.trend}`}>
            <Icon name={entry.trend === 'up' ? 'trendUp' : 'trendDown'} size={14} />
            <span className="visually-hidden">{entry.trend === 'up' ? 'rising' : 'falling'} this patch</span>
          </span>
        )}
      </b>
      <small>{entry.archetype ? `${role} · ${entry.archetype}` : role}</small>
    </span>
  )
}
