/** Heading (plus optional intro line) at the top of a guide section. */
export function SectionIntro({ id, title, intro }: { id: string; title: string; intro?: string }) {
  return (
    <div className="section-intro">
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {intro && <p className="muted">{intro}</p>}
    </div>
  )
}
