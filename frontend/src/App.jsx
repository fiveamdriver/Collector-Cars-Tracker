import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE = 'http://localhost:8000/api/v1'

const COLUMNS = [
  { key: 'sold_date',      label: 'Date' },
  { key: 'year',           label: 'Year' },
  { key: 'make',           label: 'Make' },
  { key: 'model_line',     label: 'Model' },
  { key: 'generation',     label: 'Gen' },
  { key: 'variant',        label: 'Variant' },
  { key: 'transmission',   label: 'Trans' },
  { key: 'mileage',        label: 'Mileage' },
  { key: 'color',          label: 'Color' },
  { key: 'sold_price',     label: 'Sold Price' },
  { key: 'auction_source', label: 'Source' },
]

function formatPrice(n) {
  return n != null ? `$${n.toLocaleString()}` : '—'
}

function formatMileage(n) {
  return n != null ? n.toLocaleString() : '—'
}

export default function App() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    axios.get(`${API_BASE}/auction-results`)
      .then(res => setResults(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>pcarmarket</h1>
        <p>Collector Car Auction Results</p>
      </header>

      <main className="app-main">
        {loading && <p className="status">Loading…</p>}
        {error   && <p className="status error">Error: {error}</p>}

        {!loading && !error && (
          <>
            <p className="result-count">{results.length} results</p>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {COLUMNS.map(col => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id}>
                      <td>{r.sold_date}</td>
                      <td>{r.year}</td>
                      <td>{r.make}</td>
                      <td>{r.model_line}</td>
                      <td>{r.generation}</td>
                      <td>{r.variant}</td>
                      <td>{r.transmission}</td>
                      <td>{formatMileage(r.mileage)}</td>
                      <td>{r.color ?? '—'}</td>
                      <td>{formatPrice(r.sold_price)}</td>
                      <td>{r.auction_source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
