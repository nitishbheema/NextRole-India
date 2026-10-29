import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJob } from '../lib/hooks';
import {
  MapPin,
  ExternalLink,
  Clock,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Bookmark,
  Share2,
  Building,
  Briefcase,
  Globe
} from 'lucide-react';
import { isJobSaved, toggleSaveJob } from '../lib/savedJobs';
import JobDescriptionRenderer from '../components/JobDescriptionRenderer';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = id ? parseInt(id, 10) : 0;
  const { data: job, loading, error, notFound } = useJob(jobId);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (jobId) {
      setSaved(isJobSaved(jobId));
    }
  }, [jobId]);

  const handleToggleSave = () => {
    if (!job) return;
    const next = toggleSaveJob(job.id);
    setSaved(next);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-5 bg-[#e8eee9] rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 bg-[#e8eee9] rounded w-3/4"></div>
              <div className="h-5 bg-[#e8eee9] rounded w-1/2"></div>
              <div className="h-64 bg-[#edf3ee] rounded-2xl"></div>
            </div>
            <div className="h-80 bg-[#edf3ee] rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h1 className="font-display text-xl font-bold text-[#172b25] mb-2">Job No Longer Available</h1>
        <p className="text-sm text-[#667a70] mb-6">
          This position has either expired, been closed by the employer, or the link is invalid.
        </p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#087f5b] text-white text-xs font-bold rounded-xl hover:bg-[#075e45] transition shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all jobs
        </Link>
      </div>
    );
  }

  // Check if listing might be stale (> 7 days since last verification)
  const isStale = job.lastVerifiedAt
    ? Date.now() - new Date(job.lastVerifiedAt).getTime() > 7 * 24 * 60 * 60 * 1000
    : false;

  const formattedPublished = job.publishedAt
    ? new Date(job.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const formattedVerified = job.lastVerifiedAt
    ? new Date(job.lastVerifiedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#708479] mb-6 flex-wrap" aria-label="Breadcrumbs">
        <Link to="/" className="hover:text-[#087f5b] transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/jobs" className="hover:text-[#087f5b] transition-colors">Jobs</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[#172b25] font-semibold truncate max-w-xs">{job.title}</span>
      </nav>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card Header */}
          <div className="bg-white border border-[#e1ebe6] rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(18,65,48,0.04)]">
            <div className="flex items-start gap-4 pb-6 border-b border-[#edf3f0]">
              {job.companyLogoUrl ? (
                <img
                  src={job.companyLogoUrl}
                  alt={`${job.companyName} logo`}
                  className="w-14 h-14 rounded-xl object-contain border border-[#e4ede7] p-1.5 bg-white shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#eaf6ef] text-[#087f5b] font-display font-bold flex items-center justify-center text-xl shrink-0 border border-[#cbe4d4]">
                  {job.companyName.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#556960] mb-1">
                  <span>{job.companyName}</span>
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-[#e4f5eb] text-[#087f5b] rounded-full text-[8px]" title="Verified ATS Feed">
                    ✓
                  </span>
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#172b25] tracking-tight leading-snug">
                  {job.title}
                </h1>
                {job.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#708479] mt-2">
                    <MapPin className="w-3.5 h-3.5 text-[#087f5b]" />
                    <span>{job.location}</span>
                    {job.country && <span className="text-[#a4b5ac]">({job.country})</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {job.isEmployerSubmitted && (
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#e7f6ef] text-[#087f5b] border border-[#bce4ce]">
                  Direct Employer
                </span>
              )}
              {job.jobType && (
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#f0f4ff] text-[#345ec4] border border-[#d6e2ff]">
                  {job.jobType.replace(/_/g, ' ')}
                </span>
              )}
              {job.experienceLevel && (
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#f4f7ea] text-[#4d7014] border border-[#e1eccd]">
                  {job.experienceLevel.replace(/_/g, ' ')}
                </span>
              )}
              {job.workMode && (
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#f5f7f6] text-[#455850] border border-[#e0e8e4]">
                  {job.workMode.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            {/* Stale Warning Banner if applicable */}
            {isStale && (
              <div className="mt-5 p-3.5 bg-[#fef9ec] border border-[#fae2be] rounded-xl flex items-center gap-2.5 text-xs text-[#8f5e12]">
                <AlertTriangle className="h-4 w-4 text-[#d97706] shrink-0" />
                <span>This position was last verified over 7 days ago and may have been filled by the employer.</span>
              </div>
            )}

            {/* Structured Job Description */}
            <div className="mt-8 pt-6 border-t border-[#edf3f0]">
              <h2 className="font-display font-extrabold text-lg text-[#172b25] mb-4">
                Role Description & Requirements
              </h2>
              <div className="bg-[#f9fbf9] p-5 sm:p-7 rounded-2xl border border-[#e7ede9]">
                <JobDescriptionRenderer description={job.description} />
              </div>
            </div>

            {/* Application Disclaimer */}
            <div className="mt-8 p-4 bg-[#eef8f2] border border-[#cbe4d4] rounded-xl text-xs text-[#2b4438] flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#087f5b] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block mb-0.5 text-[#172b25]">Application Transparency Notice</span>
                You will be redirected to the official career portal ({job.sourceType || 'ATS'} / {job.companyName}) to submit your resume. NextRole India never charges candidates, asks for personal financial information, or conducts interviews.
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-[#edf3f0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link to="/jobs" className="text-xs font-semibold text-[#667a70] hover:text-[#172b25] flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Browse more positions
              </Link>
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#087f5b] hover:bg-[#075e45] text-white font-bold text-xs rounded-xl transition shadow-xs"
              >
                Apply on Official Site
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar */}
        <aside className="lg:sticky lg:top-24 space-y-5">
          {/* Main Action Card */}
          <div className="bg-white border border-[#e1ebe6] rounded-2xl p-6 shadow-[0_4px_24px_rgba(18,65,48,0.04)] space-y-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#087f5b] block mb-1">
                APPLICATION LINK
              </span>
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#087f5b] hover:bg-[#075e45] text-white font-display font-extrabold text-sm rounded-xl transition-all shadow-[0_4px_14px_rgba(8,127,91,0.25)] active:scale-[0.98]"
              >
                Apply on official website
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleToggleSave}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  saved
                    ? 'bg-[#e7f6ef] border-[#bce4ce] text-[#087f5b]'
                    : 'border-[#e1ebe6] text-[#556960] hover:bg-[#f3f8f5]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Saved' : 'Save Role'}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#e1ebe6] text-xs font-bold text-[#556960] hover:bg-[#f3f8f5] transition-colors"
                title="Copy job link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Role Metadata Details */}
            <div className="pt-4 border-t border-[#edf3f0] space-y-3 text-xs">
              <div className="flex items-center justify-between text-[#667a70]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#087f5b]" />
                  Posted Date
                </span>
                <span className="font-semibold text-[#172b25]">{formattedPublished || 'Recent'}</span>
              </div>

              {formattedVerified && (
                <div className="flex items-center justify-between text-[#667a70]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#087f5b]" />
                    Last Verified
                  </span>
                  <span className="font-semibold text-[#087f5b]">{formattedVerified}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#667a70]">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#087f5b]" />
                  Country Eligibility
                </span>
                <span className="font-semibold text-[#172b25]">{job.country || 'India'}</span>
              </div>

              {job.sourceType && (
                <div className="flex items-center justify-between text-[#667a70]">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#087f5b]" />
                    ATS System
                  </span>
                  <span className="font-semibold text-[#172b25]">{job.sourceType}</span>
                </div>
              )}
            </div>
          </div>

          {/* Company Mini Card */}
          <div className="bg-[#edf7f0] border border-[#dceee1] rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#087f5b]">
              <Building className="w-4 h-4" />
              <span>About Employer</span>
            </div>
            <p className="font-display font-bold text-base text-[#172b25]">{job.companyName}</p>
            <p className="text-xs text-[#5f7469] leading-relaxed">
              Tracked via official applicant tracking system. Positions are synced continuously to ensure direct candidate access.
            </p>
            <div className="pt-2">
              <Link
                to={`/jobs?q=${encodeURIComponent(job.companyName)}`}
                className="text-xs font-bold text-[#087f5b] hover:underline inline-flex items-center gap-1"
              >
                More jobs at {job.companyName} →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
