import { useState, useCallback } from 'react';

/**
 * Custom hook for managing pagination state.
 * Works with the server's pagination envelope: { page, limit, total, pages }
 */
const usePagination = (initialLimit = 10) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const updatePagination = useCallback((paginationData) => {
    if (paginationData) {
      setPage(paginationData.page);
      setTotal(paginationData.total);
      setTotalPages(paginationData.pages);
    }
  }, []);

  const goToPage = useCallback((newPage) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    updatePagination,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
  };
};

export default usePagination;
