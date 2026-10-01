import { useEffect, useState } from 'react'

export function useApiQuery(query, { refreshInterval = 0, refreshOnFocus = true } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    let inFlight = false

    const load = async (showLoading = false) => {
      if (inFlight) return
      inFlight = true
      if (showLoading) setLoading(true)
      try {
        const result = await query()
        if (active) {
          setData(result)
          setError(null)
        }
      } catch (reason) {
        if (active) setError(reason)
      } finally {
        inFlight = false
        if (active && showLoading) setLoading(false)
      }
    }

    load(true)
    const intervalId = refreshInterval > 0
      ? window.setInterval(() => {
          if (document.visibilityState === 'visible') load()
        }, refreshInterval)
      : null
    const refreshVisiblePage = () => {
      if (document.visibilityState === 'visible') load()
    }
    const refreshAfterRisUpdate = (event) => {
      if (!event.key || event.key === 'or-smart-ris-operation-updated') load()
    }
    if (refreshOnFocus) {
      window.addEventListener('focus', refreshVisiblePage)
      document.addEventListener('visibilitychange', refreshVisiblePage)
    }
    window.addEventListener('operations-updated', refreshVisiblePage)
    window.addEventListener('storage', refreshAfterRisUpdate)
    window.addEventListener('or-smart-ris-operation-updated', refreshAfterRisUpdate)

    return () => {
      active = false
      if (intervalId) window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshVisiblePage)
      document.removeEventListener('visibilitychange', refreshVisiblePage)
      window.removeEventListener('operations-updated', refreshVisiblePage)
      window.removeEventListener('storage', refreshAfterRisUpdate)
      window.removeEventListener('or-smart-ris-operation-updated', refreshAfterRisUpdate)
    }
  }, [query, refreshInterval, refreshKey, refreshOnFocus])

  return { data, loading, error, refetch: () => setRefreshKey((value) => value + 1) }
}
