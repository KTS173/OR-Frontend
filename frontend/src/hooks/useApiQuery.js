import { useEffect, useState } from 'react'

export function useApiQuery(query) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    query()
      .then((result) => active && (setData(result), setError(null)))
      .catch((reason) => {
        if (active) {
          setData([])
          setError(reason)
        }
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [query, refreshKey])

  return { data, loading, error, refetch: () => setRefreshKey((value) => value + 1) }
}
