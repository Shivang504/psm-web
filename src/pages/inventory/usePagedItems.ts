import { useMemo, useState } from 'react'

export function usePagedItems<T>(
  items: T[],
  search: string,
  match: (item: T, query: string) => boolean,
) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const queryKey = `${search}:${limit}`
  const [pageQuery, setPageQuery] = useState(queryKey)
  if (pageQuery !== queryKey) {
    setPageQuery(queryKey)
    setPage(1)
  }
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items
    return items.filter((item) => match(item, query))
  }, [items, match, search])

  const total = filtered.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)
  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages)

  return {
    pageItems: filtered.slice((safePage - 1) * limit, safePage * limit),
    total,
    page: safePage,
    limit,
    totalPages,
    setPage,
    setLimit,
  }
}
