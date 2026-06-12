import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ALL_MODELS, GENERATION_GROUPS, GENERATIONS, MODEL_LINE } from '../data/taxonomy'
import { fetchAuctionResults } from '../api/client'
import { calcStats, groupByField, groupByMonth } from '../utils/aggregation'
import Breadcrumb from '../components/Breadcrumb'
import Sparkline from '../components/Sparkline'

const GEN_IMAGES = {
  'F-Series': '/images/fseries.jpeg',
  'G-Body': '/images/gbody.jpg',
  '964':      '/images/964.jpeg',
  '993':      '/images/993.jpg',
  '996':      '/images/996.jpeg',
  '997':      '/images/997.jpg',
  '991':      '/images/991.jpeg',
  '992':      '/images/992.jpeg',
}

export default function GenerationIndex() {
  const { modelSlug } = useParams()
  const model      = ALL_MODELS.find(m => m.slug === modelSlug)
  const generations = GENERATIONS[modelSlug] ?? []
  const modelLine  = MODEL_LINE[modelSlug]
  const groups     = GENERATION_GROUPS[modelSlug] ?? {}

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchAuctionResults({ model_line: modelLine, limit: 10000 })
      .then(setResults)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [modelLine])

  const byGen = useMemo(() => groupByField(results, 'generation'), [results])

  if (!model) return <Navigate to="/" replace />

  return (
    <div className="inner">
      <div className="page-header">
        <Breadcrumb crumbs={[
          { label: 'Markets', to: '/' },
          { label: model.label },
        ]} />
        <h1 className="page-title">{model.label}</h1>
      </div>

      {loading && <p className="status">Loading…</p>}
      {error   && <p className="status error">Error: {error}</p>}

      {!loading && !error && (
        <div className="card-grid">
          {generations.map(gen => {
            const subGens    = groups[gen]
            const genResults = subGens
              ? subGens.flatMap(sg => byGen[sg] ?? [])
              : (byGen[gen] ?? [])
            const stats   = calcStats(genResults)
            const monthly = groupByMonth(genResults)
            return (
              <Link key={gen} to={`/${modelSlug}/${gen}`} className="index-card">
                {/* images temporarily hidden — re-enable by uncommenting:
                GEN_IMAGES[gen] && (
                  <img src={GEN_IMAGES[gen]} alt={gen} className="index-card-thumb" />
                ) */}
                <div className="index-card-header">
                  <span className="index-card-name">{gen}</span>
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
