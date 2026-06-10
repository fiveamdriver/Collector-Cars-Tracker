import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ALL_MODELS, GENERATION_GROUPS, MODEL_LINE } from '../data/taxonomy'
import { fetchAuctionResults } from '../api/client'
import { calcStats, groupByField, groupByMonth } from '../utils/aggregation'
import Breadcrumb from '../components/Breadcrumb'
import Sparkline from '../components/Sparkline'

export default function SubGenerationIndex() {
  const { modelSlug, seg1 } = useParams()
  const model    = ALL_MODELS.find(m => m.slug === modelSlug)
  const modelLine = MODEL_LINE[modelSlug]
  const subGens  = GENERATION_GROUPS[modelSlug]?.[seg1] ?? []

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchAuctionResults({ model_line: modelLine })
      .then(data => setResults(data.filter(r => subGens.includes(r.generation))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [modelLine, seg1])

  const byGen = useMemo(() => groupByField(results, 'generation'), [results])

  if (!model) return <Navigate to="/" replace />

  return (
    <div className="inner">
      <div className="page-header">
        <Breadcrumb crumbs={[
          { label: 'Markets',   to: '/' },
          { label: model.label, to: `/${modelSlug}` },
          { label: seg1 },
        ]} />
        <h1 className="page-title">{model.label} {seg1}</h1>
      </div>

      {loading && <p className="status">Loading…</p>}
      {error   && <p className="status error">Error: {error}</p>}

      {!loading && !error && (
        <div className="card-grid">
          {subGens.map(subGen => {
            const genResults = byGen[subGen] ?? []
            const stats   = calcStats(genResults)
            const monthly = groupByMonth(genResults)
            return (
              <Link key={subGen} to={`/${modelSlug}/${seg1}/${subGen}`} className="index-card">
                <div className="index-card-header">
                  <span className="index-card-name">{subGen}</span>
                  <span className="index-card-count">{stats.count} sold</span>
                </div>
                {stats.count > 0 && (
                  <div className="index-card-avg">${stats.avg.toLocaleString()} avg</div>
                )}
                <Sparkline data={monthly} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
