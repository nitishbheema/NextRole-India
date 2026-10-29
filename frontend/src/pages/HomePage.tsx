import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, ShieldCheck, Sparkles, Building, Briefcase, GraduationCap, Laptop, CheckCircle, ExternalLink } from 'lucide-react';
import { useJobs } from '../lib/hooks';
import JobCard from '../components/JobCard';
import CategoryCard from '../components/CategoryCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

const QUICK_CATEGORIES = [
  {
    emoji: '💻',
    label: 'Software & IT',
    description: 'Backend, Frontend, Full Stack & Mobile',
    jobType: 'FULL_TIME',
    countLabel: 'High Demand',
  },
  {
    emoji: '🎓',
    label: 'Fresher & Trainee',
    description: '0-1 Years Experience & Entry Level',
    experienceLevel: 'FRESHER',
    countLabel: 'Campus & Off-Campus',
  },
  {
    emoji: '🚀',
    label: 'Internships',
    description: 'Paid Summer & Winter Tech Internships',
    jobType: 'INTERNSHIP',
    countLabel: 'College Students',
  },
  {
    emoji: '🌐',
    label: 'Remote Roles',
    description: 'Work from Anywhere across India',
    workMode: 'REMOTE',
    countLabel: 'Flexible',
  },
];

function JobSection({
  title,
  subtitle,
  filters,
  viewAllLink,
}: {
  title: string;
  subtitle?: string;
  filters: Parameters<typeof useJobs>[0];
  viewAllLink: string;
}) {
  const { data, loading, error } = useJobs({ ...filters, size: 6 });
  const jobs = data?.content ?? [];

  return (
    <section className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#172b25] tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-[#6e8077] mt-1">{subtitle}</p>}
        </div>
        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087f5b] hover:text-[#075e45] transition-colors"
        >
          View all roles <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error ? (
        <EmptyState variant="api-error" />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState variant="no-jobs" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (location) params.set('location', location);
    if (country) params.set('country', country);

    const queryStr = params.toString();
    navigate(queryStr ? `/jobs?${queryStr}` : '/jobs');
  };

  const POPULAR_TAGS = ['Java', 'React', 'Fresher', 'Internship', 'Python', 'Bengaluru', 'Remote'];

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-[#e5ede8]">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-gradient-to-br from-[#d9f5e5]/50 to-[#edf8df]/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e5f5ec] text-[#087f5b] text-[11px] font-bold tracking-wider uppercase mb-5">
              <span className="w-2 h-2 rounded-full bg-[#20a36d] shadow-[0_0_0_3px_#c9edda]" />
              Verified Tech Roles Across India
            </div>

            {/* Main Title */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#172b25] tracking-tight leading-[1.12] mb-5">
              Find your next role with <span className="text-[#087f5b]">verified tech employers</span>.
            </h1>

            <p className="text-sm sm:text-base text-[#61746a] leading-relaxed mb-8 max-w-2xl">
              Real engineering opportunities, fresher jobs, and internships collected directly from official company career portals. Direct applications only — no middleman, no spam.
            </p>

            {/* Unified Search Panel */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-2xl border border-[#dce7e1] p-2.5 shadow-[0_12px_32px_rgba(32,78,58,0.08)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl"
              role="search"
            >
              {/* Keyword field */}
              <div className="flex-1 flex items-center gap-2.5 px-3 min-w-0">
                <Search className="w-5 h-5 text-[#087f5b] shrink-0" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Role title, tech stack, or company..."
                  className="w-full text-xs sm:text-sm text-[#172b25] bg-transparent outline-none placeholder-[#8ea197]"
                  aria-label="Search jobs"
                />
              </div>

              <div className="hidden sm:block w-[1px] h-7 bg-[#e2ece6]" />

              {/* Location Select */}
              <div className="flex items-center gap-2 px-3 sm:w-44">
                <MapPin className="w-4 h-4 text-[#087f5b] shrink-0" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs text-[#52645c] font-semibold bg-transparent outline-none cursor-pointer"
                  aria-label="Location"
                >
                  <option value="">All Locations</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="bg-[#087f5b] hover:bg-[#075e45] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(8,127,91,0.2)] shrink-0 active:scale-[0.98]"
              >
                Search
              </button>
            </form>

            {/* Popular Search Chips */}
            <div className="flex items-center gap-2 flex-wrap mt-4 text-[11px]">
              <span className="text-[#81948a] font-bold">Trending:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setKeyword(tag);
                    navigate(`/jobs?q=${encodeURIComponent(tag)}`);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#e1ebe5] text-[#556960] hover:text-[#087f5b] hover:border-[#a8d9bd] hover:bg-[#eef8f2] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Trust Proof Badges */}
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-[#e6eee9] text-xs text-[#6e8077]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#087f5b]" />
                <span className="font-semibold text-[#172b25]">100% Direct Official Links</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#087f5b]" />
                <span>100+ Tracked Companies</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#087f5b]" />
                <span>Continuous ATS Synchronization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Container ────────────────────────────────────────── */}
      <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Quick Category Cards */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#087f5b]">
                EXPLORE BY PATHWAY
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#172b25] tracking-tight mt-0.5">
                Popular Career Categories
              </h2>
            </div>
            <Link to="/jobs" className="text-xs font-bold text-[#087f5b] hover:text-[#075e45]">
              Browse All Categories →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_CATEGORIES.map((cat) => (
              <CategoryCard key={cat.label} {...cat} />
            ))}
          </div>
        </section>

        {/* Latest Opportunities */}
        <JobSection
          title="Latest Openings"
          subtitle="Recently ingested roles from verified Indian ATS feeds"
          filters={{}}
          viewAllLink="/jobs"
        />

        {/* Fresher & Early Career Roles */}
        <JobSection
          title="Fresher Opportunities"
          subtitle="Positions welcoming 2024, 2025 & 2026 graduates with 0-1 years of experience"
          filters={{ experienceLevel: 'FRESHER' }}
          viewAllLink="/jobs?experienceLevel=FRESHER"
        />

        {/* Internships */}
        <JobSection
          title="Internships & Co-Ops"
          subtitle="Paid internships for engineering & IT students"
          filters={{ jobType: 'INTERNSHIP' }}
          viewAllLink="/jobs?jobType=INTERNSHIP"
        />

        {/* ── Verified Companies Spotlight ─────────────────────────── */}
        <section className="bg-[#edf7f0] border border-[#e1eee4] rounded-3xl p-7 sm:p-9">
          <div className="max-w-2xl mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#087f5b]">
              TRACKED ATS REGISTRY
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#172b25] tracking-tight mt-1">
              Top Employers Hiring Tech Talent
            </h2>
            <p className="text-xs sm:text-sm text-[#5f7369] mt-2 leading-relaxed">
              We monitor verified career portals of top Indian IT leaders, global MNCs, and high-growth unicorns including Thoughtworks, Zoho, Swiggy, Razorpay, and Infosys.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#d8e8dc]">
            <span className="text-xs font-bold text-[#4d6257]">
              100 Tracked Tech Enterprises & Startups
            </span>
            <Link
              to="/companies"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#087f5b] hover:bg-[#e4f4ea] border border-[#cbe4d3] text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Explore Company Directory
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ── Direct Employer Banner ─────────────────────────────────── */}
        <section className="bg-[#073f32] text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2 z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d8f26a]">
              FOR HIRING MANAGERS & FOUNDERS
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Hiring tech talent in India?
            </h2>
            <p className="text-xs sm:text-sm text-[#b8d1c6] leading-relaxed">
              Submit your job opening directly to NextRole India. Verified submissions receive a transparent review and are published without charging placement fees.
            </p>
          </div>

          <Link
            to="/post-job"
            className="z-10 inline-flex items-center gap-2 px-6 py-3.5 bg-[#d8f26a] hover:bg-[#cde95f] text-[#073f32] font-display font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shrink-0 active:scale-[0.98]"
          >
            Post a Job Opening
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Decorative watermark */}
          <div className="absolute right-4 -bottom-6 text-[140px] font-bold text-white/[0.04] select-none pointer-events-none">
            INDIA
          </div>
        </section>

        {/* ── External Job Portals Section ──────────────────────────── */}
        <section className="bg-white border border-[#e1ebe6] rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#798e83]">
                MANUAL SEARCH DIRECTORY
              </span>
              <h2 className="font-display font-bold text-xl text-[#172b25] mt-0.5">
                External Job Aggregators
              </h2>
            </div>
            <p className="text-xs text-[#798e83] max-w-sm">
              Official links for independent candidate search. We do not scrape unauthorized private portals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-[#e7ede9] rounded-xl p-5 hover:border-[#a8d9bd] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#172b25] text-sm">Naukri.com</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#f1f5f3] text-[#556960]">
                  LINK_ONLY
                </span>
              </div>
              <p className="text-xs text-[#6e8077] mb-3 leading-relaxed">
                Direct search on India's primary employment portal for lateral and IT services hiring.
              </p>
              <a
                href={keyword ? `https://www.naukri.com/${encodeURIComponent(keyword.trim().replace(/\s+/g, '-'))}-jobs` : 'https://www.naukri.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087f5b] hover:text-[#075e45]"
              >
                Search on Naukri.com
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="border border-[#e7ede9] rounded-xl p-5 hover:border-[#a8d9bd] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#172b25] text-sm">Unstop</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#f1f5f3] text-[#556960]">
                  LINK_ONLY
                </span>
              </div>
              <p className="text-xs text-[#6e8077] mb-3 leading-relaxed">
                Specialized hub for university hackathons, campus competitions, and fresher tech hiring.
              </p>
              <a
                href={keyword ? `https://unstop.com/jobs?searchTerm=${encodeURIComponent(keyword.trim())}` : 'https://unstop.com/jobs'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087f5b] hover:text-[#075e45]"
              >
                Explore on Unstop
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ── Privacy & Trust Note ──────────────────────────────────── */}
        <section className="bg-[#eff8f2] border border-[#cbe4d4] rounded-2xl p-5 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-[#087f5b] shrink-0 mt-0.5" />
          <div className="text-xs text-[#2b4438] leading-relaxed">
            <span className="font-bold block text-sm mb-1 text-[#172b25]">Privacy Guaranteed</span>
            NextRole India never collects applicant resumes or asks for payment. Every listing redirects you directly to the official company careers page or employer applicant tracking system.
          </div>
        </section>
      </div>
    </div>
  );
}
