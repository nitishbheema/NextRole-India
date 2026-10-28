import React from 'react';
import { Link } from 'react-router-dom';
import { useCompanies } from '../lib/hooks';
import { Building2, ExternalLink, Briefcase } from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

export default function CompaniesPage() {
  const { data: companies, loading, error } = useCompanies();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Partner Companies & Sources</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Explore organizations whose official career pages are actively tracked and aggregated.
        </p>
      </div>

      {error ? (
        <EmptyState variant="api-error" title="Failed to load companies" description={error} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          variant="no-jobs"
          title="No companies configured yet"
          description="Companies and ATS integrations will appear here once configured."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      className="w-12 h-12 rounded-lg object-contain border border-gray-100 p-1"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-lg">
                      {company.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{company.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <Briefcase className="h-3.5 w-3.5 text-brand-500" />
                      <span>{company.activeJobCount} active {company.activeJobCount === 1 ? 'opening' : 'openings'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2 text-xs">
                <Link
                  to={`/jobs?company=${company.id}`}
                  className="font-medium text-brand-600 hover:text-brand-800 transition"
                >
                  View openings →
                </Link>
                <a
                  href={company.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  Careers Page
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
