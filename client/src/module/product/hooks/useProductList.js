import { useState, useEffect, useRef, useCallback } from "react";
import { productApi } from "@/api/product.api";
import useCompanyStore from "@/store/company.store";

export const PRODUCT_PAGE_SIZE = 20;

export function useProductList({ enabled = true } = {}) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const sentinelRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const companyId = useCompanyStore((s) => s.activeCompany?._id);

  const fetchPage = useCallback(
    async (pageNum, searchTerm, replace = false) => {
      if (!companyId) return;
      if (replace) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await productApi.getProducts(companyId, {
          page: pageNum,
          limit: PRODUCT_PAGE_SIZE,
          search: searchTerm,
        });
        const data = res.data?.data;
        setItems((prev) => (replace ? data?.items || [] : [...prev, ...(data?.items || [])]));
        setPage(data?.page ?? pageNum);
        setTotalPages(data?.totalPages ?? 1);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        if (replace) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [companyId]
  );

  const refresh = useCallback(() => {
    setItems([]);
    setPage(1);
    fetchPage(1, search, true);
  }, [fetchPage, search]);

  useEffect(() => {
    if (!enabled) return;
    setSearch("");
    setItems([]);
    setPage(1);
    fetchPage(1, "", true);
  }, [enabled, companyId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled) return;
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setItems([]);
      setPage(1);
      fetchPage(1, search, true);
    }, 350);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search, fetchPage, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPage(nextPage, search);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, loading, loadingMore, page, totalPages, search, fetchPage]);

  return {
    companyId,
    search,
    setSearch,
    items,
    setItems,
    loading,
    loadingMore,
    page,
    totalPages,
    sentinelRef,
    hasMore: page < totalPages,
    refresh,
    fetchPage,
  };
}
