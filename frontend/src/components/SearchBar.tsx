import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../lib/hooks';
import type { JobFilters } from '../lib/types';

interface SearchBarProps {
  filters: JobFilters;
  onChange: (filters: Partial<JobFilters>) => void;
  onClear: () => void;
}

const JOB_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'GRADUATE_PROGRAMME', label: 'Graduate Programme' },
  { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
];

const EXP_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'FRESHER', label: 'Fresher' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID', label: 'Mid-Level' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'EXECUTIVE', label: 'Executive' },
];

const WORK_MODES = [
  { value: '', label: 'All Modes' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
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
    filters.jobType ||
    filters.experienceLevel ||
    filters.workMode;

  const handleClear = () => {
    setLocalQ('');
    onClear();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search jobs, companies, keywords…"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
          aria-label="Search jobs"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        {/* Location */}
        <input
          type="text"
          placeholder="Location (e.g. Bengaluru)"
          value={filters.location ?? ''}
          onChange={(e) => onChange({ location: e.target.value || undefined, page: 0 })}
          className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
          aria-label="Filter by location"
        />

        {/* Job Type */}
        <select
          value={filters.jobType ?? ''}
          onChange={(e) => onChange({ jobType: e.target.value || undefined, page: 0 })}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
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
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
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
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          aria-label="Filter by work mode"
        >
          {WORK_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Clear all filters"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
