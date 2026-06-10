import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { ALL_MODELS, GENERATION_GROUPS, MODEL_LINE, VARIANTS } from '../data/taxonomy'
import { fetchAuctionResults } from '../api/client'
import { calcStats, groupByMonth } from '../utils/aggregation'
import { fromSlug } from '../utils/slugs'
import Breadcrumb from '../components/Breadcrumb'
import StatsBar from '../components/StatsBar'
import PriceHistoryChart from '../components/PriceHistoryChart'
import ResultsTable from '../components/ResultsTable'

export default function MarketDetail() {
  const { modelSlug, seg1, seg2, seg3 } = useParams()
  const model     = ALL_MODELS.find(m => m.slug === modelSlug)
  const modelLine = MODEL_LINE[modelSlug]
  const groups    = GENERATION_GROUPS[modelSlug] ?? {}

  // Derive generation, variant slug, and group from URL shape
  let groupSlug, generation, variantSlug
  if (!seg1) {
    // standalone: /:modelSlug
    groupSlug = null; generation = null; variantSlug = null
  } else if (seg3) {
    // grouped 4-segment: /:model/:group/:subgen/:variant
    groupSlug = seg1; generation = seg2; variantSlug = seg3
  } else {
    // flat 3-segment: /:model/:gen/:variant
    groupSlug = null; generation = seg1; variantSlug = seg2
  }

  const candidates = VARIANTS[modelSlug]?.[generation] ?? []
  const variant    = variantSlug ? fromSlug(variantSlug, candidates) : null

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = { model_line: modelLine }
    if (generation) params.generation = generation
    if (variant)    params.variant    = variant
    fetchAuctionResults(params)
      .then(setResults)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [modelLine, generation, variant])

  const stats       = useMemo(() => calcStats(results),    [results])
  const monthlyData = useMemo(() => groupByMonth(results), [results])

  if (!model) return <Navigate to="/" replace />

  const crumbs = [{ label: 'Markets', to: '/' }]
  if (model.type === 'series') {
    crumbs.push({ label: model.label, to: `/${modelSlug}` })
    if (groupSlug)  crumbs.push({ label: groupSlug,  to: `/${modelSlug}/${groupSlug}` })
    if (generation) crumbs.push({ label: generation, to: groupSlug
      ? `/${modelSlug}/${groupSlug}/${generation}`
      : `/${modelSlug}/${generation}` })
    if (variant)    crumbs.push({ label: variant })
  } else {
    crumbs.push({ label: model.label })
  }

  const title = [model.label, generation, variant].filter(Boolean).join(' ')

  return (
    <div className="inner">
      <div className="page-header">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="page-title">{title}</h1>
      </div>

      {loading && <p className="status">Loading…</p>}
      {error   && <p className="status error">Error: {error}</p>}

      {!loading && !error && (
        <>
          <StatsBar {...stats} />
          {monthlyData.length >= 2 && (
            <PriceHistoryChart monthlyData={monthlyData} />
          )}
          <ResultsTable results={results} />
        </>
      )}
    </div>
  )
}
