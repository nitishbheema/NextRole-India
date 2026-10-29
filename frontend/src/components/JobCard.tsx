import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import type { Job } from '../lib/types';
import SkeletonCard from './SkeletonCard';

// ─── Date helpers ────────────────────────────────────────────────────────────

function relativeDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}

function absoluteDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

const jobTypeBadge: Record<string, string> = {
  FULL_TIME: 'bg-blue-100 text-blue-700',
  PART_TIME: 'bg-indigo-100 text-indigo-700',
  INTERNSHIP: 'bg-purple-100 text-purple-700',
  CONTRACT: 'bg-orange-100 text-orange-700',
  GRADUATE_PROGRAMME: 'bg-teal-100 text-teal-700',
  APPRENTICESHIP: 'bg-pink-100 text-pink-700',
};

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
  GRADUATE_PROGRAMME: 'Graduate',
  APPRENTICESHIP: 'Apprenticeship',
};

const expBadge: Record<string, string> = {
  FRESHER: 'bg-green-100 text-green-700',
  JUNIOR: 'bg-lime-100 text-lime-700',
  MID: 'bg-yellow-100 text-yellow-700',
  SENIOR: 'bg-amber-100 text-amber-700',
  LEAD: 'bg-red-100 text-red-700',
  EXECUTIVE: 'bg-rose-100 text-rose-700',
  NOT_SPECIFIED: 'bg-gray-100 text-gray-500',
};

const expLabel: Record<string, string> = {
  FRESHER: 'Fresher',
  JUNIOR: 'Junior',
  MID: 'Mid-Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
  NOT_SPECIFIED: '',
};

const workModeBadge: Record<string, string> = {
  REMOTE: 'bg-green-100 text-green-700',
  HYBRID: 'bg-yellow-100 text-yellow-700',
  ONSITE: 'bg-gray-100 text-gray-600',
  NOT_SPECIFIED: '',
};

const workModeLabel: Record<string, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
  NOT_SPECIFIED: '',
};

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
        className="h-12 w-12 rounded-lg object-contain border border-gray-100 bg-white p-1"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="h-12 w-12 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0"
      aria-label={`${name} logo`}
    >
      {initials}
    </div>
  );
}

// ─── JobCard ─────────────────────────────────────────────────────────────────

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

  return (
    <article className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-200 transition-all duration-200 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.companyName} logoUrl={job.companyLogoUrl} />
        <div className="flex-1 min-w-0">
          <Link
            to={`/jobs/${job.id}`}
            className="font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
          >
            {job.title}
          </Link>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{job.companyName}</p>
        </div>
      </div>

      {/* Location */}
      {job.location && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{job.location}</span>
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {job.isEmployerSubmitted && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Direct Employer Verified
          </span>
        )}
        {job.jobType && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              jobTypeBadge[job.jobType] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {jobTypeLabel[job.jobType] ?? job.jobType}
          </span>
        )}
        {job.experienceLevel && job.experienceLevel !== 'NOT_SPECIFIED' && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              expBadge[job.experienceLevel] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {expLabel[job.experienceLevel] ?? job.experienceLevel}
          </span>
        )}
        {job.workMode && job.workMode !== 'NOT_SPECIFIED' && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              workModeBadge[job.workMode] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {workModeLabel[job.workMode] ?? job.workMode}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
        <div className="flex flex-col gap-0.5 text-xs text-gray-400">
          {job.publishedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {relativeDate(job.publishedAt)}
            </span>
          )}
          {job.lastVerifiedAt && (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-400" aria-hidden="true" />
              Verified {absoluteDate(job.lastVerifiedAt)}
            </span>
          )}
        </div>

        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
          aria-label={`View job: ${job.title} at ${job.companyName} (opens in new tab)`}
        >
          View Job
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
