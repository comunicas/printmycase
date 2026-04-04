import { useState, useMemo, useEffect } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to first page when items change significantly
  useEffect(() => {
    setPage((prev) => (prev >= totalPages ? Math.max(0, totalPages - 1) : prev));
  }, [totalPages]);

  const paginated = useMemo(
    () => items.slice(page * pageSize, (page + 1) * pageSize),
    [items, page, pageSize]
  );

  return { paginated, page, setPage, totalPages, totalItems: items.length };
}
