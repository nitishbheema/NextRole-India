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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#e5f5ec] text-[#087f5b] border border-[#c2e7d1]">
            <CheckCircle className="h-3 w-3 text-[#087f5b]" />
            Automated Feed
          </span>
        );
      case 'NEEDS_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#fef7eb] text-[#b36b00] border border-[#fae2be]">
            <Clock className="h-3 w-3 text-[#b36b00]" />
            Under Review
          </span>
        );
      case 'LINK_ONLY':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#f4f7f5] text-[#556960] border border-[#e1ebe6]">
            <Link2 className="h-3 w-3 text-[#798e83]" />
            Link Only
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e1ebe6]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7f6ef] text-[#087f5b] text-[11px] font-bold tracking-wider uppercase mb-2">
              <Compass className="h-3.5 w-3.5" />
              Benchmark Employers Directory
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#172b25] tracking-tight">
              100 Target Companies & ATS Registry
            </h1>
            <p className="text-[#64776e] mt-2 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Explore the complete 100-company registry across IT Services, Cloud, Startups, and Tech Engineering.
              We query official ATS endpoints where machine-readable feeds exist, and provide verified official career portal links for link-only portals.
            </p>
          </div>

          {/* Registry Stats Pills */}
          {data && (
            <div className="flex flex-wrap gap-2 shrink-0 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-white text-[#52645c] border border-[#dce7e1] shadow-xs">
                Total: <strong className="text-[#172b25] font-bold">{data.totalRegisteredCompanies}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#eaf6ef] text-[#087f5b] border border-[#bce4ce]">
                Active Feeds: <strong className="font-bold">{data.statusBreakdown?.ACTIVE_IMPORT ?? 0}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white text-[#52645c] border border-[#dce7e1]">
                Link-Only: <strong className="font-bold">{data.statusBreakdown?.LINK_ONLY ?? 0}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#dce7e1] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(18,65,48,0.04)] mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#087f5b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name or domain…"
              className="w-full pl-10 pr-9 py-2.5 border border-[#dce7e1] rounded-xl text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
              aria-label="Search companies"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ea197] hover:text-[#172b25]"
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
              className="w-full px-3 py-2.5 border border-[#dce7e1] rounded-xl text-xs font-medium text-[#2d4037] bg-[#fafcfb] focus:outline-none focus:border-[#087f5b] cursor-pointer"
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
              className="w-full px-3 py-2.5 border border-[#dce7e1] rounded-xl text-xs font-medium text-[#2d4037] bg-[#fafcfb] focus:outline-none focus:border-[#087f5b] cursor-pointer"
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
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#62756d] border-t border-[#edf3f0]">
          <span>
            Showing <strong className="text-[#172b25]">{filteredCompanies.length}</strong> of{' '}
            <strong className="text-[#172b25]">{allCompanies.length}</strong> companies in registry
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[#087f5b] hover:text-[#075e45] font-bold"
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
              className="px-5 py-2.5 bg-[#087f5b] text-white text-xs font-bold rounded-xl hover:bg-[#075e45] transition shadow-xs"
            >
              Retry
            </button>
          }
        />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-44 bg-white border border-[#e1ebe6] rounded-2xl animate-pulse"></div>
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
                className="px-4 py-2 bg-[#eaf6ef] text-[#087f5b] text-xs font-bold rounded-xl hover:bg-[#d8f1e2] border border-[#c5e6d4] transition"
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
                className="bg-white border border-[#e1ebe6] rounded-2xl p-5 shadow-[0_2px_12px_rgba(18,65,48,0.03)] hover:border-[#a0d6b6] hover:shadow-[0_8px_24px_rgba(18,65,48,0.07)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar, Name & Category */}
                  <div className="flex items-start gap-3.5 mb-3">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        className="w-12 h-12 rounded-xl object-contain border border-[#e4ede7] bg-white p-1 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#eaf6ef] text-[#087f5b] font-display font-extrabold flex items-center justify-center text-sm shrink-0 border border-[#cbe4d4]">
                        {initials || company.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display font-bold text-[#172b25] text-[15px] truncate" title={company.name}>
                          {company.name}
                        </h3>
                      </div>
                      <span className="inline-block text-[11px] text-[#71857b] truncate max-w-full mt-0.5" title={company.category}>
                        {company.category}
                      </span>
                    </div>
                  </div>

                  {/* Status & Job Count Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 my-2 border-y border-[#edf3f0] text-xs">
                    <div>{getStatusBadge(company.integrationStatus)}</div>

                    {hasActiveJobs ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[#087f5b] bg-[#eaf6ef] px-2 py-0.5 rounded-md border border-[#cbe4d4] text-[10px]">
                        <Briefcase className="h-3 w-3 text-[#087f5b]" />
                        {company.activeJobCount} active {company.activeJobCount === 1 ? 'job' : 'jobs'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#8ea197]">
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
                        className="font-bold text-[#087f5b] hover:text-[#075e45] transition inline-flex items-center gap-1"
                      >
                        View {company.activeJobCount} openings
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                      <a
                        href={company.careersUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8ea197] hover:text-[#172b25] inline-flex items-center gap-1"
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
                      className="w-full py-2 px-3 bg-[#f7faf8] hover:bg-[#eaf6ef] hover:text-[#087f5b] text-[#33463e] font-semibold rounded-xl text-center transition inline-flex items-center justify-center gap-1.5 border border-[#e1ebe6] hover:border-[#bce4ce]"
                    >
                      Official Careers Portal
                      <ExternalLink className="h-3.5 w-3.5 text-[#8ea197]" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Separate Section: Explore More Job Sources (Naukri & Unstop) ── */}
      <section className="bg-white border border-[#e1ebe6] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#edf3f0]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#087f5b] block">
              EXTERNAL JOB-DISCOVERY PORTALS
            </span>
            <h2 className="font-display font-extrabold text-xl text-[#172b25] mt-0.5">
              Explore More Job Sources
            </h2>
          </div>
          <span className="text-xs text-[#708479] max-w-sm text-left sm:text-right">
            Out-of-registry external discovery portals. Preserved as official link-only sources without private scraping.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Naukri */}
          <div className="bg-[#fcfdfc] border border-[#e1ebe6] rounded-xl p-5 hover:border-[#a0d6b6] transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#eaf6ef] text-[#087f5b] font-display font-bold flex items-center justify-center text-sm border border-[#cbe4d4]">
                    N
                  </div>
                  <div>
                    <h3 className="font-bold text-[#172b25] text-sm">Naukri.com</h3>
                    <span className="text-[10px] text-[#708479]">Lateral Tech & Enterprise Ingestion</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f4f7f5] text-[#556960] border border-[#e1ebe6]">
                  LINK_ONLY
                </span>
              </div>
              <p className="text-xs text-[#62756d] leading-relaxed mb-4">
                India's largest job portal for IT, software engineering, and corporate roles. We provide direct outbound search links to search official listings safely on Naukri.
              </p>
            </div>

            <a
              href="https://www.naukri.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-[#eaf6ef] hover:bg-[#d8f1e2] text-[#087f5b] text-xs font-bold rounded-xl transition border border-[#cbe4d4]"
            >
              Explore on Naukri.com
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Unstop */}
          <div className="bg-[#fcfdfc] border border-[#e1ebe6] rounded-xl p-5 hover:border-[#a0d6b6] transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#eaf6ef] text-[#087f5b] font-display font-bold flex items-center justify-center text-sm border border-[#cbe4d4]">
                    U
                  </div>
                  <div>
                    <h3 className="font-bold text-[#172b25] text-sm">Unstop</h3>
                    <span className="text-[10px] text-[#708479]">Fresher Drives, Hackathons & Internships</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f4f7f5] text-[#556960] border border-[#e1ebe6]">
                  LINK_ONLY
                </span>
              </div>
              <p className="text-xs text-[#62756d] leading-relaxed mb-4">
                Early-career opportunities, student hackathons, campus hiring challenges, and graduate programmes. Explore directly on Unstop's official platform.
              </p>
            </div>

            <a
              href="https://unstop.com/jobs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-[#eaf6ef] hover:bg-[#d8f1e2] text-[#087f5b] text-xs font-bold rounded-xl transition border border-[#cbe4d4]"
            >
              Explore on Unstop
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#edf3f0] flex items-center gap-2 text-xs text-[#62756d]">
          <ShieldCheck className="h-4 w-4 text-[#087f5b] shrink-0" />
          <span>
            Aggregator portals are separate from our verified company ATS crawler. NextRole India respects provider terms and never bypasses anti-bot defenses.
          </span>
        </div>
      </section>
    </div>
  );
}
