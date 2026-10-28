import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobs } from '../lib/hooks';
import type { JobFilters } from '../lib/types';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: JobFilters = useMemo(() => {
    return {
      q: searchParams.get('q') || undefined,
      company: searchParams.get('company') || undefined,
      location: searchParams.get('location') || undefined,
      jobType: searchParams.get('jobType') || undefined,
      experienceLevel: searchParams.get('experienceLevel') || undefined,
      workMode: searchParams.get('workMode') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 0,
      size: 20,
    };
  }, [searchParams]);

  const { data, loading, error, refetch } = useJobs(filters);

  const handleFilterChange = (newFilters: Partial<JobFilters>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        updated.set(key, String(val));
      } else {
        updated.delete(key);
      }
    });
    // Reset page to 0 if changing non-page filters
    if (newFilters.page === undefined) {
      updated.set('page', '0');
    }
    setSearchParams(updated);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('page', String(newPage));
    setSearchParams(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Discover Opportunities</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Browse verified IT jobs, graduate programmes, and fresher positions across India.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="mb-8">
        <SearchBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      {/* Content Section */}
      {error ? (
        <EmptyState
          variant="api-error"
          title="Could not load jobs"
          description={error}
          action={
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
            >
              Retry
            </button>
          }
        />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          variant={filters.q || filters.location || filters.jobType || filters.experienceLevel ? 'no-results' : 'no-jobs'}
          action={
            (filters.q || filters.location || filters.jobType || filters.experienceLevel) ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Clear Filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Showing {data.totalElements} active {data.totalElements === 1 ? 'position' : 'positions'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.content.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            size={data.size}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
