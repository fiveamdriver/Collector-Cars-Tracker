function fmtPrice(n) {
  return n != null ? `$${n.toLocaleString()}` : 'POA'
}
function fmtMileage(n) {
  return n != null ? n.toLocaleString() : '—'
}

export default function ActiveListingsPanel({ listings, loading, error }) {
  if (loading) return <p className="status">Loading…</p>
  if (error)   return <p className="status error">Error: {error}</p>
  if (!listings.length) return (
    <p className="status">No active listings found for this market.</p>
  )

  const prices  = listings.map(l => l.asking_price).filter(p => p != null)
  const hasPrice = prices.length > 0
  const avgAsk  = hasPrice ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null
  const lowAsk  = hasPrice ? Math.min(...prices) : null
  const highAsk = hasPrice ? Math.max(...prices) : null

  return (
    <>
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">Listed</span>
          <span className="stat-value">{listings.length}</span>
        </div>
        <div className="stat stat--primary">
          <span className="stat-label">Avg Ask</span>
          <span className="stat-value stat-value--accent">
            {avgAsk != null ? `$${avgAsk.toLocaleString()}` : '—'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Lowest Ask</span>
          <span className="stat-value">{lowAsk != null ? `$${lowAsk.toLocaleString()}` : '—'}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Highest Ask</span>
          <span className="stat-value">{highAsk != null ? `$${highAsk.toLocaleString()}` : '—'}</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Variant</th>
              <th>Trans</th>
              <th>Mileage</th>
              <th>Color</th>
              <th>Asking Price</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l, i) => (
              <tr key={l.id} className={i % 2 === 1 ? 'row-alt' : ''}>
                <td>{l.year}</td>
                <td className="td-variant">{l.variant}</td>
                <td className="td-trans">{l.transmission}</td>
                <td>{fmtMileage(l.mileage)}</td>
                <td>{l.color ?? '—'}</td>
                <td className="price-cell">{fmtPrice(l.asking_price)}</td>
                <td className="source-cell">{l.listing_source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
