import { useEffect, useState } from 'react'

export function useMockQuery(query, initialValue = []) {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    query()
      .then((result) => active && setData(result))
      .catch((reason) => active && setError(reason))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [query])

  return { data, loading, error }
}
