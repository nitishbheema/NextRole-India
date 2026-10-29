import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSubmissionStatus } from '../lib/hooks';
import type { SubmissionStatus } from '../lib/types';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Building2,
  Calendar,
  Briefcase
} from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function SubmissionStatusPage() {
  const { ref: paramRef } = useParams<{ ref?: string }>();
  const navigate = useNavigate();

  const [inputRef, setInputRef] = useState(paramRef || '');
  const [activeRef, setActiveRef] = useState(paramRef || '');

  useEffect(() => {
    if (paramRef) {
      setInputRef(paramRef);
      setActiveRef(paramRef);
    }
  }, [paramRef]);

  const { data, loading, error, refetch } = useSubmissionStatus(activeRef);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.trim()) {
      setActiveRef(inputRef.trim());
      navigate(`/submission-status/${encodeURIComponent(inputRef.trim())}`);
    }
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Approved & Published Live
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            Under Verification by Review Team
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-4 w-4 text-amber-600" />
            Queued for Verification
          </span>
        );
      case 'NEEDS_CHANGES':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Action Required / Needs Changes
          </span>
        );
      case 'FLAGGED_FOR_SECURITY_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldAlert className="h-4 w-4 text-purple-600" />
            Flagged for Security Review (PhishSense Flag)
          </span>
        );
      case 'REJECTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            Listing Rejected
          </span>
        );
    }
  };

  const getStatusExplanation = (status: SubmissionStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'Congratulations! Your job posting has passed official domain verification, PhishSense link checks, and administrative review. It is currently live and discoverable on NextRole India.';
      case 'UNDER_REVIEW':
        return 'An administrator is currently reviewing your company domain and submitted application page to ensure all information is authentic.';
      case 'PENDING_VERIFICATION':
        return 'Your submission is queued for automated link analysis and employer identity confirmation. Standard verification takes 1-4 hours.';
      case 'NEEDS_CHANGES':
        return 'Our review team noted inconsistencies with the application URL or company details. Please contact support or resubmit with corrected information.';
      case 'FLAGGED_FOR_SECURITY_REVIEW':
        return 'Automated security scanners flagged potential redirect anomalies, punycode lookalike patterns, or unreachable endpoints. A senior reviewer is conducting a deep manual inspection.';
      case 'REJECTED':
      default:
        return 'This submission did not meet our verification criteria (e.g. invalid application destination, fee requirements, or unverified recruiter credentials).';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Track Employer Submission Status
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Check the real-time verification and approval status of your submitted job opening.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex gap-2 bg-white p-2 rounded-xl border border-gray-300 shadow-xs focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={inputRef}
              onChange={(e) => setInputRef(e.target.value)}
              placeholder="Enter Reference ID (e.g. NR-2026-ABC123)…"
              className="w-full pl-10 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              aria-label="Submission reference ID"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Track Status
          </button>
        </div>
      </form>

      {/* Result Card */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xs animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
          <div className="h-20 bg-gray-50 rounded"></div>
        </div>
      ) : error ? (
        <EmptyState
          variant="no-results"
          title="Submission Not Found"
          description={`We couldn't locate a submission matching "${activeRef}". Please double check your Reference ID and try again.`}
          action={
            <Link
              to="/post-job"
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
            >
              Post a New Job
            </Link>
          }
        />
      ) : data ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
                Reference ID: {data.referenceId}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-brand-600" />
                {data.jobTitle}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span>{data.companyName}</span>
              </div>
            </div>

            <div>{getStatusBadge(data.status)}</div>
          </div>

          {/* Explanation Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-700 leading-relaxed">
            {getStatusExplanation(data.status)}
          </div>

          {/* Timeline / Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>
                Submitted on: <strong className="text-gray-800">{new Date(data.submittedAt).toLocaleString()}</strong>
              </span>
            </div>
            {data.updatedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>
                  Last update: <strong className="text-gray-800">{new Date(data.updatedAt).toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>

          {data.status === 'APPROVED' && (
            <div className="pt-4 flex justify-end">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition"
              >
                View in Jobs Directory
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-sm">
          Enter a Reference ID above to see the current review status.
        </div>
      )}
    </div>
  );
}
