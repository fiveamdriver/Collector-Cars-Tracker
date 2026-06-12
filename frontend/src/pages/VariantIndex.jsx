import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ALL_MODELS, GENERATION_GROUPS, MODEL_LINE, VARIANTS } from '../data/taxonomy'
import { fetchAuctionResults } from '../api/client'
import { calcStats, groupByField, groupByMonth } from '../utils/aggregation'
import { toSlug } from '../utils/slugs'
import Breadcrumb from '../components/Breadcrumb'
import Sparkline from '../components/Sparkline'

export default function VariantIndex() {
  const { modelSlug, seg1, seg2 } = useParams()
  const model     = ALL_MODELS.find(m => m.slug === modelSlug)
  const modelLine = MODEL_LINE[modelSlug]
  const groups    = GENERATION_GROUPS[modelSlug] ?? {}

  // seg1 is a group key (997) → seg2 is the actual generation (997.1)
  // seg1 is a flat gen (964)  → seg1 itself is the generation
  const isGrouped  = seg1 in groups
  const groupSlug  = isGrouped ? seg1 : null
  const generation = isGrouped ? seg2 : seg1

  const variants = VARIANTS[modelSlug]?.[generation] ?? []

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchAuctionResults({ model_line: modelLine, generation, limit: 10000 })
      .then(setResults)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [modelLine, generation])

  const byVariant = useMemo(() => groupByField(results, 'variant'), [results])

  const sortedVariants = useMemo(() => (
    [...variants].sort((a, b) => {
      const aAvg = calcStats(byVariant[a] ?? []).avg
      const bAvg = calcStats(byVariant[b] ?? []).avg
      return bAvg - aAvg
    })
  ), [variants, byVariant])

  if (!model) return <Navigate to="/" replace />

  const crumbs = [
    { label: 'Markets',   to: '/' },
    { label: model.label, to: `/${modelSlug}` },
  ]
  if (groupSlug) crumbs.push({ label: groupSlug, to: `/${modelSlug}/${groupSlug}` })
  crumbs.push({ label: generation })

  const variantBase = groupSlug
    ? `/${modelSlug}/${groupSlug}/${generation}`
    : `/${modelSlug}/${generation}`

  return (
    <div className="inner">
      <div className="page-header">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="page-title">{model.label} {generation}</h1>
      </div>

      {loading && <p className="status">Loading…</p>}
      {error   && <p className="status error">Error: {error}</p>}

      {!loading && !error && (
        <div className="card-grid">
          {sortedVariants.map(variant => {
            const varResults = byVariant[variant] ?? []
            const stats   = calcStats(varResults)
            const monthly = groupByMonth(varResults)
            return (
              <Link
                key={variant}
                to={`${variantBase}/${toSlug(variant)}`}
                className="index-card"
              >
                <div className="index-card-header">
                  <span className="index-card-name">{variant}</span>
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
