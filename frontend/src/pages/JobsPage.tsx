import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useJobs } from '../lib/hooks';
import type { JobFilters } from '../lib/types';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { Bookmark, Sparkles } from 'lucide-react';
import { getSavedJobIds } from '../lib/savedJobs';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSavedOnly = searchParams.get('saved') === 'true';

  const filters: JobFilters = useMemo(() => {
    return {
      q: searchParams.get('q') || undefined,
      company: searchParams.get('company') || undefined,
      location: searchParams.get('location') || undefined,
      country: searchParams.get('country') || undefined,
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

  // Filter content if saved view is toggled
  const displayJobs = useMemo(() => {
    if (!data?.content) return [];
    if (!isSavedOnly) return data.content;
    const savedIds = getSavedJobIds();
    return data.content.filter((job) => savedIds.includes(job.id));
  }, [data?.content, isSavedOnly]);

  return (
    <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7f6ef] text-[#087f5b] text-[11px] font-bold tracking-wider uppercase mb-2">
            <Sparkles className="w-3 h-3" />
            Verified Opportunities
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#172b25] tracking-tight">
            Discover Opportunities
          </h1>
          <p className="text-[#64776e] mt-1.5 text-xs sm:text-sm">
            Browse verified IT jobs, graduate programmes, and fresher positions across India with direct official application links.
          </p>
        </div>

        {isSavedOnly && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#e7f6ef] border border-[#bde5cf] text-xs font-bold text-[#087f5b]">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Viewing Saved Positions</span>
            <Link
              to="/jobs"
              className="ml-2 text-[11px] underline hover:text-[#075e45]"
            >
              Show All
            </Link>
          </div>
        )}
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
              className="px-5 py-2.5 bg-[#087f5b] text-white text-xs font-bold rounded-xl hover:bg-[#075e45] transition-all shadow-sm"
            >
              Retry
            </button>
          }
        />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="px-5 py-2.5 bg-[#eaf6ef] text-[#087f5b] text-xs font-bold rounded-xl hover:bg-[#d8f1e2] border border-[#c5e6d4] transition"
              >
                Clear All Filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#edf2ef]">
            <span className="text-xs font-bold text-[#556960]">
              Showing <span className="text-[#087f5b]">{isSavedOnly ? displayJobs.length : data.totalElements}</span> active {data.totalElements === 1 ? 'position' : 'positions'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {!isSavedOnly && (
            <div className="mt-8">
              <Pagination
                currentPage={data.page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                size={data.size}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
