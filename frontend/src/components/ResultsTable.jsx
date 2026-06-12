import { useState } from 'react'

function fmtPrice(n) {
  return n != null ? `$${n.toLocaleString()}` : '—'
}
function fmtMileage(n) {
  return n != null ? n.toLocaleString() : '—'
}
function fmtDate(s) {
  if (!s) return '—'
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function truncate(s, n) {
  return s && s.length > n ? s.slice(0, n) + '…' : (s ?? '—')
}
function stripYear(s, stripMileage) {
  if (!s) return s
  let out = s.replace(/\b(?:19|20)\d{2}\b\s*/, '').trim()
  if (stripMileage)
    out = out.replace(/(?:No Reserve:\s+)?[\d,k]+-(?:Mile|Kilometer)\s*/i, '').trim()
  return out
}
function stripColor(s, color) {
  if (!s || !color) return s
  return s.replace(new RegExp('^' + color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'i'), '').trim()
}

export default function ResultsTable({ results }) {
  const [lightbox, setLightbox] = useState(null)

  const sorted = [...results].sort(
    (a, b) => new Date(b.sold_date) - new Date(a.sold_date)
  )

  return (
    <>
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Year</th>
            <th>Listing</th>
            <th>Photo</th>
            <th>Color</th>
            <th>Mileage</th>
            <th>Sold Price</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.id} className={i % 2 === 1 ? 'row-alt' : ''}>
              <td>{fmtDate(r.sold_date)}</td>
              <td>{r.year}</td>
              <td className="td-listing">{truncate(stripColor(stripYear(r.lot_title, r.mileage != null), r.exterior_color), 40)}</td>
              <td className="td-photo">
                {r.thumbnail_url
                  ? <img src={r.thumbnail_url} alt="" className="result-thumb result-thumb--clickable" onClick={() => setLightbox(r.thumbnail_url)} />
                  : '—'}
              </td>
              <td className="td-color">{r.exterior_color ?? '—'}</td>
              <td>{fmtMileage(r.mileage)}</td>
              <td className="price-cell">{fmtPrice(r.sold_price)}</td>
              <td className="source-cell">
                {r.auction_url
                  ? <a href={r.auction_url} target="_blank" rel="noopener noreferrer" className="source-link">{r.auction_source}</a>
                  : r.auction_source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {lightbox && (
      <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
        <img src={lightbox} alt="" className="lightbox-img" />
      </div>
    )}
    </>
  )
}
