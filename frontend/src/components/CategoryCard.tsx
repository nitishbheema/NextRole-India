import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  emoji: string;
  label: string;
  jobType?: string;
  experienceLevel?: string;
  description: string;
  countLabel?: string;
}

export default function CategoryCard({
  emoji,
  label,
  jobType,
  experienceLevel,
  description,
  countLabel,
}: CategoryCardProps) {
  const params = new URLSearchParams();
  if (jobType) params.set('jobType', jobType);
  if (experienceLevel) params.set('experienceLevel', experienceLevel);

  const to = `/jobs${params.toString() ? `?${params.toString()}` : ''}`;

  return (
    <Link
      to={to}
      className="group flex items-center gap-3.5 bg-white rounded-2xl border border-[#e1ebe6] p-4 sm:p-5 hover:border-[#a0d6b6] hover:shadow-[0_10px_28px_rgba(18,65,48,0.08)] hover:-translate-y-0.5 transition-all duration-200"
      aria-label={`Browse ${label} jobs`}
    >
      <div className="w-11 h-11 rounded-xl bg-[#eaf6ef] text-[#087f5b] flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform" aria-hidden="true">
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <h3 className="font-display font-bold text-[14px] text-[#172b25] group-hover:text-[#087f5b] transition-colors truncate">
            {label}
          </h3>
          {countLabel && (
            <span className="text-[10px] font-semibold text-[#8ca095] shrink-0">
              {countLabel}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#71857b] line-clamp-1 mt-0.5">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#a6b8ae] group-hover:text-[#087f5b] group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}
