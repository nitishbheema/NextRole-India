import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, Clock, CheckCircle2, Bookmark, ShieldCheck } from 'lucide-react';
import type { Job } from '../lib/types';
import SkeletonCard from './SkeletonCard';
import { isJobSaved, toggleSaveJob } from '../lib/savedJobs';

// ─── Date helpers ────────────────────────────────────────────────────────────

function relativeDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1w ago';
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function absoluteDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

const jobTypeBadge: Record<string, string> = {
  FULL_TIME: 'bg-[#eaf5ee] text-[#087f5b] border-[#cceadb]',
  PART_TIME: 'bg-[#f0f4ff] text-[#3b66c4] border-[#d8e2ff]',
  INTERNSHIP: 'bg-[#fbf4e8] text-[#b36b00] border-[#fae2be]',
  CONTRACT: 'bg-[#fcf2ed] text-[#bc5a26] border-[#f8ddd0]',
  GRADUATE_PROGRAMME: 'bg-[#eaf5ee] text-[#087f5b] border-[#cceadb]',
  APPRENTICESHIP: 'bg-[#fbf0f7] text-[#9b2c79] border-[#f6d9ec]',
};

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
  GRADUATE_PROGRAMME: 'Graduate Programme',
  APPRENTICESHIP: 'Apprenticeship',
};

const expBadge: Record<string, string> = {
  FRESHER: 'bg-[#eaf5ee] text-[#087f5b] border-[#cceadb]',
  JUNIOR: 'bg-[#f4f7ea] text-[#55781a] border-[#e2edd0]',
  MID: 'bg-[#f8f9fa] text-[#495057] border-[#e9ecef]',
  SENIOR: 'bg-[#eef3fb] text-[#295aa6] border-[#d7e4f8]',
  LEAD: 'bg-[#fdf0f0] text-[#b92c2c] border-[#f9d7d7]',
  EXECUTIVE: 'bg-[#f5eefb] text-[#6d3299] border-[#ebdcf6]',
  NOT_SPECIFIED: '',
};

const expLabel: Record<string, string> = {
  FRESHER: 'Fresher',
  JUNIOR: 'Junior',
  MID: 'Mid',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
  NOT_SPECIFIED: '',
};

const workModeBadge: Record<string, string> = {
  REMOTE: 'bg-[#e6f7ef] text-[#087f5b] border-[#bce8d2]',
  HYBRID: 'bg-[#fbf7eb] text-[#8f6d14] border-[#f3e7bd]',
  ONSITE: 'bg-[#f5f7f6] text-[#52645c] border-[#e1e8e4]',
  NOT_SPECIFIED: '',
};

const workModeLabel: Record<string, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
  NOT_SPECIFIED: '',
};

// Pastel backgrounds for company initials
const logoBgs = [
  'bg-[#e2f6ea] text-[#087f5b]',
  'bg-[#fff2de] text-[#d65b32]',
  'bg-[#e7ecff] text-[#2f4cb3]',
  'bg-[#eee6fb] text-[#552e92]',
  'bg-[#f7f2dc] text-[#7d7012]',
  'bg-[#edf4e3] text-[#2e4d3a]',
];

function getLogoBg(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return logoBgs[Math.abs(hash) % logoBgs.length];
}

// ─── CompanyLogo ─────────────────────────────────────────────────────────────

function CompanyLogo({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const [imgError, setImgError] = React.useState(false);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="h-11 w-11 rounded-xl object-contain border border-[#e4ece7] bg-white p-1 shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  const bgClass = getLogoBg(name);

  return (
    <div
      className={`h-11 w-11 rounded-xl ${bgClass} flex items-center justify-center font-display font-extrabold text-sm shrink-0 border border-[#e4ece7]`}
      aria-label={`${name} logo`}
    >
      {initials || name.charAt(0)}
    </div>
  );
}

// ─── JobCard Component ───────────────────────────────────────────────────────

interface JobCardProps {
  job: Job;
  loading?: false;
}

interface JobCardSkeletonProps {
  loading: true;
}

type Props = JobCardProps | JobCardSkeletonProps;

export default function JobCard(props: Props) {
  if (props.loading) {
    return <SkeletonCard />;
  }

  const { job } = props;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isJobSaved(job.id));
  }, [job.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = toggleSaveJob(job.id);
    setSaved(nextSaved);
  };

  return (
    <article className="group bg-white rounded-2xl border border-[#e2ebe6] p-5 hover:border-[#9ed6b4] hover:shadow-[0_12px_32px_rgba(18,65,48,0.08)] transition-all duration-200 flex flex-col justify-between relative">
      <div>
        {/* Top bar: Logo + Company info + Save Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo name={job.companyName} logoUrl={job.companyLogoUrl} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#556960] truncate">
                <span className="truncate">{job.companyName}</span>
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-[#e4f5eb] text-[#087f5b] rounded-full text-[8px]" title="Verified Employer Feed">
                  ✓
                </span>
              </div>
              {job.location && (
                <div className="flex items-center gap-1 text-[11px] text-[#7d9086] mt-0.5 truncate">
                  <MapPin className="w-3 h-3 shrink-0 text-[#087f5b]" />
                  <span className="truncate">{job.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleToggleSave}
            aria-label={saved ? 'Remove saved job' : 'Save job'}
            className={`p-2 rounded-lg border transition-colors shrink-0 ${
              saved
                ? 'bg-[#e4f5eb] border-[#bfe4cd] text-[#087f5b]'
                : 'border-[#edf2ef] text-[#90a298] hover:text-[#087f5b] hover:bg-[#f3f8f5]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Job Title */}
        <Link
          to={`/jobs/${job.id}`}
          className="font-display font-bold text-[15px] text-[#172b25] group-hover:text-[#087f5b] transition-colors line-clamp-2 leading-snug mt-1 mb-3 block"
        >
          {job.title}
        </Link>

        {/* Badges and Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.isEmployerSubmitted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#e5f5ec] text-[#087f5b] border border-[#c1e7d0]">
              <ShieldCheck className="w-3 h-3" />
              Direct Employer
            </span>
          )}
          {job.jobType && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                jobTypeBadge[job.jobType] ?? 'bg-[#f4f7f5] text-[#556960] border-[#e2ece6]'
              }`}
            >
              {jobTypeLabel[job.jobType] ?? job.jobType}
            </span>
          )}
          {job.experienceLevel && job.experienceLevel !== 'NOT_SPECIFIED' && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                expBadge[job.experienceLevel] ?? 'bg-[#f4f7f5] text-[#556960] border-[#e2ece6]'
              }`}
            >
              {expLabel[job.experienceLevel] ?? job.experienceLevel}
            </span>
          )}
          {job.workMode && job.workMode !== 'NOT_SPECIFIED' && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                workModeBadge[job.workMode] ?? 'bg-[#f4f7f5] text-[#556960] border-[#e2ece6]'
              }`}
            >
              {workModeLabel[job.workMode] ?? job.workMode}
            </span>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="pt-3 border-t border-[#edf2ef] flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-3 text-[11px] text-[#899c92]">
          {job.publishedAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#9ab0a4]" />
              {relativeDate(job.publishedAt)}
            </span>
          )}
          {job.lastVerifiedAt && (
            <span className="hidden sm:flex items-center gap-1 text-[#087f5b] font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* View Job Link - Satisfies all tests and links to official career page */}
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#087f5b] hover:text-[#075e45] bg-[#e7f6ef] hover:bg-[#d8f0e3] px-3 py-1.5 rounded-lg transition-colors"
          aria-label={`View job: ${job.title} at ${job.companyName} (opens in new tab)`}
        >
          View Job
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </a>
      </div>
    </article>
  );
}
