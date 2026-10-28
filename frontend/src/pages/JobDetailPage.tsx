import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJob } from '../lib/hooks';
import {
  MapPin,
  ExternalLink,
  Clock,
  CheckCircle,
  Building2,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Shield
} from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = id ? parseInt(id, 10) : 0;
  const { data: job, loading, error, notFound } = useJob(jobId);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Job No Longer Available</h1>
        <p className="text-sm text-gray-600 mb-6">
          This position has either expired, been closed by the employer, or the link is invalid.
        </p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/jobs" className="hover:text-brand-600">Jobs</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 truncate max-w-xs">{job.title}</span>
      </nav>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            {job.companyLogoUrl ? (
              <img
                src={job.companyLogoUrl}
                alt={`${job.companyName} logo`}
                className="w-14 h-14 rounded-lg object-contain border border-gray-100 p-1 bg-white"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xl">
                {job.companyName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                <span className="font-medium text-gray-800">{job.companyName}</span>
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {job.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-lg transition shadow-sm"
          >
            Apply on official website
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-gray-100">
          {job.jobType && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              {job.jobType.replace(/_/g, ' ')}
            </span>
          )}
          {job.experienceLevel && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-green-50 text-green-700 border border-green-100">
              {job.experienceLevel.replace(/_/g, ' ')}
            </span>
          )}
          {job.workMode && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-teal-50 text-teal-700 border border-teal-100">
              {job.workMode.replace(/_/g, ' ')}
            </span>
          )}
          {formattedPublished && (
            <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              Posted {formattedPublished}
            </span>
          )}
          {formattedVerified && (
            <span className="flex items-center gap-1 text-xs text-teal-600">
              <CheckCircle className="h-3.5 w-3.5" />
              Verified {formattedVerified}
            </span>
          )}
        </div>

        {/* Stale Warning Banner if applicable */}
        {isStale && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>This position was last verified over 7 days ago and may have been filled by the employer.</span>
          </div>
        )}

        {/* Job Description (Safely rendered as plain text) */}
        <div className="mt-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Job Description & Details</h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed font-sans bg-gray-50/50 p-6 rounded-lg border border-gray-100">
            {job.description || 'No detailed description provided by the employer. Please visit the official career page for complete responsibilities and requirements.'}
          </div>
        </div>

        {/* Application Disclaimer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold block mb-0.5">Application Transparency Notice</span>
            You will be redirected to the official career portal ({job.sourceType || 'ATS'} / {job.companyName}) to submit your resume. NextRole India never charges candidates, asks for personal financial information, or conducts interviews.
          </div>
        </div>

        {/* Secondary Apply Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/jobs" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Browse more positions
          </Link>
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-lg transition"
          >
            Apply Now
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
