type ChipOption = { value: string; label: string }

type ChipGroupProps = {
  /** Accessible name for the group. */
  label: string
  options: ChipOption[]
  isSelected: (value: string) => boolean
  onSelect: (value: string) => void
}

/** A row of toggle chips. Works for single-choice filters and multi-select fields. */
export function ChipGroup({ label, options, isSelected, onSelect }: ChipGroupProps) {
  return (
    <div className="chip-group" role="group" aria-label={label}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          className="chip"
          aria-pressed={isSelected(option.value)}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
