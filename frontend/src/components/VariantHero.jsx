function fmt(n) {
  return n ? `$${n.toLocaleString()}` : '—'
}

export default function VariantHero({ eyebrow, title, stats, heroImage }) {
  const { avg, high, low, count } = stats

  return (
    <div className="variant-hero">
      <div className="variant-hero-left">
        <div className="variant-hero-text">
          {eyebrow && <div className="variant-hero-eyebrow">{eyebrow}</div>}
          <h1 className="variant-hero-title">{title}</h1>
        </div>
        <div className="variant-hero-stats">
          <div className="vh-stat vh-stat--primary">
            <span className="vh-stat-label">Avg Sale</span>
            <span className="vh-stat-value">{fmt(avg)}</span>
          </div>
          <div className="vh-stat">
            <span className="vh-stat-label">High</span>
            <span className="vh-stat-value vh-stat-value--dim">{fmt(high)}</span>
          </div>
          <div className="vh-stat">
            <span className="vh-stat-label">Low</span>
            <span className="vh-stat-value vh-stat-value--dim">{fmt(low)}</span>
          </div>
          <div className="vh-stat">
            <span className="vh-stat-label">Sales</span>
            <span className="vh-stat-value vh-stat-value--dim">{count || '—'}</span>
          </div>
        </div>
      </div>

      <div className="variant-hero-right">
        {heroImage
          ? <img src={`/images/variants/${heroImage}`} alt={title} className="variant-hero-img" />
          : <div className="variant-hero-placeholder" />}
      </div>
    </div>
  )
}
