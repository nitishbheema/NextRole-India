import { useState, useEffect, useCallback } from 'react';
import api from './api';
import type { Job, JobDetail, JobFilters, PagedResponse, Company, AdminStats, JobSource, PublicSourcesResponse } from './types';

// ------------------------------------------------------------------
// useDebounce
// ------------------------------------------------------------------
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ------------------------------------------------------------------
// useJobs
// ------------------------------------------------------------------
export function useJobs(filters: JobFilters) {
  const [data, setData] = useState<PagedResponse<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {};
      if (filters.q) params.q = filters.q;
      if (filters.company) params.company = filters.company;
      if (filters.location) params.location = filters.location;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      if (filters.workMode) params.workMode = filters.workMode;
      if (filters.page !== undefined) params.page = filters.page;
      if (filters.size !== undefined) params.size = filters.size;

      const res = await api.get<PagedResponse<Job>>('/api/jobs', { params });
      setData(res.data);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [
    filters.q,
    filters.company,
    filters.location,
    filters.jobType,
    filters.experienceLevel,
    filters.workMode,
    filters.page,
    filters.size,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { data, loading, error, refetch: fetchJobs };
}

// ------------------------------------------------------------------
// useJob (single job detail)
// ------------------------------------------------------------------
export function useJob(id: number) {
  const [data, setData] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    api
      .get<JobDetail>(`/api/jobs/${id}`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((e: { response?: { status: number }; message?: string }) => {
        if (!cancelled) {
          if (e?.response?.status === 404) {
            setNotFound(true);
          } else {
            setError(e?.message || 'Failed to load job');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error, notFound };
}

// ------------------------------------------------------------------
// useCompanies
// ------------------------------------------------------------------
export function useCompanies() {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Company[]>('/api/companies');
      setData(res.data);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return { data, loading, error, refetch: fetchCompanies };
}

// ------------------------------------------------------------------
// usePublicSources (100-company registry & public sources directory)
// ------------------------------------------------------------------
export function usePublicSources() {
  const [data, setData] = useState<PublicSourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PublicSourcesResponse>('/api/sources/public');
      setData(res.data);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || 'Failed to load company directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicSources();
  }, [fetchPublicSources]);

  return { data, loading, error, refetch: fetchPublicSources };
}

// ------------------------------------------------------------------
// useAdminStats
// ------------------------------------------------------------------
export function useAdminStats() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AdminStats>('/api/admin/stats');
      setData(res.data);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}

// ------------------------------------------------------------------
// useAdminSources
// ------------------------------------------------------------------
export function useAdminSources() {
  const [data, setData] = useState<JobSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<JobSource[]>('/api/admin/sources');
      setData(res.data);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  return { data, loading, error, refetch: fetchSources };
}
