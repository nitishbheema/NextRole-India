import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  emoji: string;
  label: string;
  jobType?: string;
  experienceLevel?: string;
  description: string;
}

export default function CategoryCard({
  emoji,
  label,
  jobType,
  experienceLevel,
  description,
}: CategoryCardProps) {
  const params = new URLSearchParams();
  if (jobType) params.set('jobType', jobType);
  if (experienceLevel) params.set('experienceLevel', experienceLevel);

  const to = `/jobs${params.toString() ? `?${params.toString()}` : ''}`;

  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-200 transition-all duration-200"
      aria-label={`Browse ${label} jobs`}
    >
      <div className="text-3xl" aria-hidden="true">
        {emoji}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
          {label}
        </h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
