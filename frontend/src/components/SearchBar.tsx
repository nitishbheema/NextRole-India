import React, { useRef, useEffect } from 'react';
import { Search, X, MapPin, Globe, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '../lib/hooks';
import type { JobFilters } from '../lib/types';

interface SearchBarProps {
  filters: JobFilters;
  onChange: (filters: Partial<JobFilters>) => void;
  onClear: () => void;
}

const JOB_TYPES = [
  { value: '', label: 'All Job Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'GRADUATE_PROGRAMME', label: 'Graduate Programme' },
  { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
];

const EXP_LEVELS = [
  { value: '', label: 'All Experience' },
  { value: 'FRESHER', label: 'Fresher (0-1 yrs)' },
  { value: 'JUNIOR', label: 'Junior (1-3 yrs)' },
  { value: 'MID', label: 'Mid-Level (3-5 yrs)' },
  { value: 'SENIOR', label: 'Senior (5+ yrs)' },
  { value: 'LEAD', label: 'Lead / Staff' },
  { value: 'EXECUTIVE', label: 'Executive' },
];

const WORK_MODES = [
  { value: '', label: 'All Work Modes' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

const COUNTRY_OPTIONS = [
  { value: '', label: '🇮🇳 India (Default)' },
  { value: 'ALL', label: '🌐 All Countries' },
];

export default function SearchBar({ filters, onChange, onClear }: SearchBarProps) {
  const [localQ, setLocalQ] = React.useState(filters.q ?? '');
  const debouncedQ = useDebounce(localQ, 400);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    onChange({ q: debouncedQ || undefined, page: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  // Sync if parent resets
  useEffect(() => {
    setLocalQ(filters.q ?? '');
  }, [filters.q]);

  const hasActiveFilters =
    filters.q ||
    filters.location ||
    filters.country ||
    filters.jobType ||
    filters.experienceLevel ||
    filters.workMode;

  const handleClear = () => {
    setLocalQ('');
    onClear();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#dce7e1] p-4 sm:p-5 shadow-[0_4px_20px_rgba(18,65,48,0.04)] space-y-3.5">
      {/* Search Input Row */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#087f5b]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by role title, tech stack (e.g. Java, React), or company…"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
            aria-label="Search jobs"
          />
        </div>

        {/* Location input */}
        <div className="relative sm:w-64">
          <MapPin
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#087f5b]"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="City (Bengaluru, Remote…)"
            value={filters.location ?? ''}
            onChange={(e) => onChange({ location: e.target.value || undefined, page: 0 })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
            aria-label="Filter by location"
          />
        </div>
      </div>

      {/* Select Filters Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#edf3f0]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#62756d] mr-1 hidden sm:flex">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#087f5b]" />
          <span>Filters:</span>
        </div>

        {/* Job Type */}
        <select
          value={filters.jobType ?? ''}
          onChange={(e) => onChange({ jobType: e.target.value || undefined, page: 0 })}
          className="px-3 py-1.5 rounded-xl border border-[#dce7e1] text-xs font-medium text-[#2d4037] focus:outline-none focus:border-[#087f5b] bg-[#fafcfb] cursor-pointer"
          aria-label="Filter by job type"
        >
          {JOB_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Experience */}
        <select
          value={filters.experienceLevel ?? ''}
          onChange={(e) => onChange({ experienceLevel: e.target.value || undefined, page: 0 })}
          className="px-3 py-1.5 rounded-xl border border-[#dce7e1] text-xs font-medium text-[#2d4037] focus:outline-none focus:border-[#087f5b] bg-[#fafcfb] cursor-pointer"
          aria-label="Filter by experience level"
        >
          {EXP_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        {/* Work Mode */}
        <select
          value={filters.workMode ?? ''}
          onChange={(e) => onChange({ workMode: e.target.value || undefined, page: 0 })}
          className="px-3 py-1.5 rounded-xl border border-[#dce7e1] text-xs font-medium text-[#2d4037] focus:outline-none focus:border-[#087f5b] bg-[#fafcfb] cursor-pointer"
          aria-label="Filter by work mode"
        >
          {WORK_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Country Filter */}
        <select
          value={filters.country ?? ''}
          onChange={(e) => onChange({ country: e.target.value || undefined, page: 0 })}
          className="px-3 py-1.5 rounded-xl border border-[#cbe4d4] text-xs font-bold text-[#087f5b] bg-[#eef8f2] focus:outline-none focus:border-[#087f5b] cursor-pointer"
          aria-label="Filter by country"
        >
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors ml-auto"
            aria-label="Clear all filters"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
