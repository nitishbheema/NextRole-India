import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Shield } from 'lucide-react';
import { useJobs } from '../lib/hooks';
import JobCard from '../components/JobCard';
import CategoryCard from '../components/CategoryCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  {
    emoji: '💻',
    label: 'Software Development',
    description: 'Frontend, backend, full-stack and mobile engineering roles.',
    jobType: undefined,
    experienceLevel: undefined,
  },
  {
    emoji: '🧠',
    label: 'Data & AI',
    description: 'Data science, machine learning, analytics and AI/ML engineering.',
    jobType: undefined,
    experienceLevel: undefined,
  },
  {
    emoji: '🧪',
    label: 'Testing & QA',
    description: 'Quality assurance, automation testing and SDET positions.',
    jobType: undefined,
    experienceLevel: undefined,
  },
  {
    emoji: '🔒',
    label: 'Cybersecurity',
    description: 'Security engineering, penetration testing and SOC analyst roles.',
    jobType: undefined,
    experienceLevel: undefined,
  },
  {
    emoji: '☁️',
    label: 'Cloud & DevOps',
    description: 'AWS, Azure, GCP, Kubernetes, CI/CD and SRE positions.',
    jobType: undefined,
    experienceLevel: undefined,
  },
  {
    emoji: '🎓',
    label: 'Internships',
    description: 'Internships and graduate programmes for students and fresh graduates.',
    jobType: 'INTERNSHIP',
    experienceLevel: undefined,
  },
];

function JobSection({
  title,
  filters,
  viewAllLink,
}: {
  title: string;
  filters: Parameters<typeof useJobs>[0];
  viewAllLink: string;
}) {
  const { data, loading, error } = useJobs({ ...filters, size: 6 });
  const jobs = data?.content ?? [];

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700 transition-colors"
        >
          View all <ArrowRight className="h-4 w-4" />
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
  const [heroQuery, setHeroQuery] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroQuery.trim()) {
      window.location.href = `/jobs?q=${encodeURIComponent(heroQuery.trim())}`;
    } else {
      window.location.href = '/jobs';
    }
  };

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Your next opportunity <br className="hidden sm:block" />
            starts here.
          </h1>
          <p className="text-brand-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Real jobs from official company career pages — aggregated daily for India's IT
            professionals. No fake listings. No data collection.
          </p>

          {/* Hero search */}
          <form
            onSubmit={handleHeroSearch}
            className="flex gap-3 max-w-2xl mx-auto"
            role="search"
            aria-label="Search jobs"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder="Job title, company, skill…"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Search jobs"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-brand-200">
            {['React Developer', 'Data Scientist', 'DevOps Engineer', 'Fresher', 'Remote'].map(
              (tag) => (
                <Link
                  key={tag}
                  to={`/jobs?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {tag}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Categories ────────────────────────────── */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.label} {...cat} />
            ))}
          </div>
        </section>

        {/* ── Latest Jobs ───────────────────────────── */}
        <JobSection
          title="Latest Jobs"
          filters={{}}
          viewAllLink="/jobs"
        />

        {/* ── Fresher Jobs ──────────────────────────── */}
        <JobSection
          title="Fresher Opportunities"
          filters={{ experienceLevel: 'FRESHER' }}
          viewAllLink="/jobs?experienceLevel=FRESHER"
        />

        {/* ── Internships & Graduate Programmes ────── */}
        <JobSection
          title="Internships & Graduate Programmes"
          filters={{ jobType: 'INTERNSHIP' }}
          viewAllLink="/jobs?jobType=INTERNSHIP"
        />

        {/* ── Recently Verified ─────────────────────── */}
        <JobSection
          title="Recently Verified"
          filters={{}}
          viewAllLink="/jobs"
        />

        {/* ── External Portals (Naukri & Unstop) ── */}
        <section className="mt-16 bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Link-Only External Discovery
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                Explore External Job Aggregators
              </h2>
            </div>
            <span className="text-xs text-gray-500 max-w-sm text-left sm:text-right">
              Direct official portal links. NextRole India does not scrape unpermitted private endpoints.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-brand-300 transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-base">Naukri.com</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                  LINK_ONLY
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                India's largest job portal for IT, consulting, and lateral tech hiring. Direct search on the official portal with URL-encoded query filters.
              </p>
              <a
                href={heroQuery ? `https://www.naukri.com/${encodeURIComponent(heroQuery.trim().replace(/\s+/g, '-'))}-jobs` : 'https://www.naukri.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                Search on Naukri.com
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-teal-300 transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-base">Unstop</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                  LINK_ONLY
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Premier destination for student hackathons, coding challenges, internships, and off-campus recruitment drives across Indian universities.
              </p>
              <a
                href={heroQuery ? `https://unstop.com/jobs?searchTerm=${encodeURIComponent(heroQuery.trim())}` : 'https://unstop.com/jobs'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800"
              >
                Explore on Unstop
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ── Disclaimer ────────────────────────────── */}
        <section className="mt-16 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
            <Shield className="h-6 w-6 text-brand-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-brand-800 mb-1">Your privacy is protected</h3>
              <p className="text-sm text-brand-700 leading-relaxed">
                All applications are completed on official company websites. NextRole India never
                collects your personal data during the application process. We simply surface the
                listings — you apply directly on the employer's site.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
