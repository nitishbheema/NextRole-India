import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicSources } from '../lib/hooks';
import type { RegistryCompany, IntegrationStatus } from '../lib/types';
import {
  Search,
  ExternalLink,
  Briefcase,
  CheckCircle,
  Clock,
  Link2,
  Building2,
  Filter,
  X,
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function CompaniesPage() {
  const { data, loading, error, refetch } = usePublicSources();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const allCompanies: RegistryCompany[] = useMemo(() => {
    return data?.companies ?? [];
  }, [data]);

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    allCompanies.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [allCompanies]);

  // Filtered companies based on search, category, and status
  const filteredCompanies = useMemo(() => {
    return allCompanies.filter((company) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        company.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        (company.category && company.category.toLowerCase().includes(searchQuery.trim().toLowerCase()));

      const matchesCategory =
        selectedCategory === 'ALL' || company.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'ALL' || company.integrationStatus === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allCompanies, searchQuery, selectedCategory, selectedStatus]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case 'ACTIVE_IMPORT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3 w-3 text-emerald-600" />
            Automated Feed
          </span>
        );
      case 'NEEDS_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 text-amber-600" />
            Under Review
          </span>
        );
      case 'LINK_ONLY':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Link2 className="h-3 w-3 text-slate-500" />
            Link Only
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
              <Compass className="h-4 w-4" />
              Benchmark Employers Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              100 Target Companies & ATS Registry
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base max-w-3xl leading-relaxed">
              Explore the complete 100-company registry across IT Services, Cloud, Startups, and Tech Engineering.
              We query official ATS endpoints where machine-readable feeds exist, and provide verified official career portal links for link-only portals.
            </p>
          </div>

          {/* Registry Stats Pills */}
          {data && (
            <div className="flex flex-wrap gap-2 shrink-0 text-xs font-medium">
              <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                Total: <strong className="text-gray-900 font-bold">{data.totalRegisteredCompanies}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active Feeds: <strong className="font-bold">{data.statusBreakdown?.ACTIVE_IMPORT ?? 0}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                Link-Only: <strong className="font-bold">{data.statusBreakdown?.LINK_ONLY ?? 0}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name or domain…"
              className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              aria-label="Search companies"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear company search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              aria-label="Filter by category"
            >
              <option value="ALL">All Categories ({allCompanies.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              aria-label="Filter by integration status"
            >
              <option value="ALL">All Statuses ({allCompanies.length})</option>
              <option value="ACTIVE_IMPORT">Active Import (Automated Feed)</option>
              <option value="NEEDS_VERIFICATION">Under Review (Needs Verification)</option>
              <option value="LINK_ONLY">Link Only (Direct Careers Portal)</option>
            </select>
          </div>
        </div>

        {/* Filter Feedback and Clear Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-gray-500 border-t border-gray-100">
          <span>
            Showing <strong className="text-gray-900">{filteredCompanies.length}</strong> of{' '}
            <strong className="text-gray-900">{allCompanies.length}</strong> companies in registry
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-medium"
            >
              <X className="h-3 w-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Grid */}
      {error ? (
        <EmptyState
          variant="api-error"
          title="Failed to load company registry"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="mb-16">
          <EmptyState
            variant="no-results"
            title="No companies match your filters"
            description="Try loosening your search terms, changing the category, or switching the integration status filter."
            action={
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Clear Filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {filteredCompanies.map((company) => {
            const hasActiveJobs =
              company.activeJobCount != null && company.activeJobCount > 0;
            const initials = company.name
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() ?? '')
              .join('');

            return (
              <div
                key={company.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-brand-300 hover:shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar, Name & Category */}
                  <div className="flex items-start gap-3.5 mb-3">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        className="w-12 h-12 rounded-lg object-contain border border-gray-100 bg-white p-1 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-sm shrink-0 border border-brand-100">
                        {initials || company.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-base truncate" title={company.name}>
                          {company.name}
                        </h3>
                      </div>
                      <span className="inline-block text-xs text-gray-500 truncate max-w-full mt-0.5" title={company.category}>
                        {company.category}
                      </span>
                    </div>
                  </div>

                  {/* Status & Job Count Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 my-2 border-y border-gray-100 text-xs">
                    <div>{getStatusBadge(company.integrationStatus)}</div>

                    {hasActiveJobs ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                        <Briefcase className="h-3 w-3 text-brand-600" />
                        {company.activeJobCount} active {company.activeJobCount === 1 ? 'job' : 'jobs'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400">
                        {company.integrationStatus === 'ACTIVE_IMPORT'
                          ? '0 active syncs'
                          : 'Official careers link'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-2 text-xs flex items-center justify-between gap-2 mt-auto">
                  {hasActiveJobs && company.dbCompanyId ? (
                    <>
                      <Link
                        to={`/jobs?company=${company.dbCompanyId}`}
                        className="font-semibold text-brand-600 hover:text-brand-800 transition inline-flex items-center gap-1"
                      >
                        View {company.activeJobCount} openings
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                      <a
                        href={company.careersUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 inline-flex items-center gap-1"
                        title="Open official corporate careers page"
                      >
                        Careers Portal
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  ) : (
                    <a
                      href={company.careersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-gray-50 hover:bg-brand-50 hover:text-brand-700 text-gray-700 font-medium rounded-lg text-center transition inline-flex items-center justify-center gap-1.5 border border-gray-200 hover:border-brand-200"
                    >
                      Official Careers Portal
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-brand-500" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Separate Section: Explore More Job Sources (Naukri & Unstop) ── */}
      <section className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
          <div>
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider block">
              External Job-Discovery Portals
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">
              Explore More Job Sources
            </h2>
          </div>
          <span className="text-xs text-gray-500 max-w-sm text-left sm:text-right">
            Out-of-registry external discovery portals. Preserved as official link-only sources without private scraping.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Naukri */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-brand-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-100">
                    N
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Naukri.com</h3>
                    <span className="text-[11px] text-gray-500">Lateral Tech & Enterprise Ingestion</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  LINK_ONLY
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                India's largest job portal for IT, software engineering, and corporate roles. We provide direct outbound search links to search official listings safely on Naukri.
              </p>
            </div>

            <a
              href="https://www.naukri.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg transition border border-brand-200"
            >
              Explore on Naukri.com
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Unstop */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-teal-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-100">
                    U
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Unstop</h3>
                    <span className="text-[11px] text-gray-500">Fresher Drives, Hackathons & Internships</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  LINK_ONLY
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Early-career opportunities, student hackathons, campus hiring challenges, and graduate programmes. Explore directly on Unstop's official platform.
              </p>
            </div>

            <a
              href="https://unstop.com/jobs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg transition border border-teal-200"
            >
              Explore on Unstop
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0" />
          <span>
            Aggregator portals are separate from our verified company ATS crawler. NextRole India respects provider terms and never bypasses anti-bot defenses.
          </span>
        </div>
      </section>
    </div>
  );
}
