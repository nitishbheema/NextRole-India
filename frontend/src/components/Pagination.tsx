import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;   // 0-based from API
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalElements,
  size,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = currentPage * size + 1;
  const end = Math.min((currentPage + 1) * size, totalElements);

  // Build page numbers array (5 pages around current)
  const pages: (number | '...')[] = [];
  const delta = 2;
  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= left && i <= right)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-[#edf3f0]">
      <p className="text-xs text-[#708479]">
        Showing <span className="font-bold text-[#172b25]">{start}</span>–
        <span className="font-bold text-[#172b25]">{end}</span> of{' '}
        <span className="font-bold text-[#172b25]">{totalElements.toLocaleString()}</span> jobs
      </p>

      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#556960] border border-[#dce7e1] hover:bg-[#eaf6ef] hover:text-[#087f5b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Prev
        </button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-[#9bb0a5] text-xs select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
                p === currentPage
                  ? 'bg-[#087f5b] text-white shadow-xs'
                  : 'text-[#44584f] border border-[#dce7e1] hover:bg-[#eaf6ef] hover:text-[#087f5b]'
              }`}
              aria-label={`Page ${(p as number) + 1}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#556960] border border-[#dce7e1] hover:bg-[#eaf6ef] hover:text-[#087f5b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
