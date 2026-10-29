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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e5f5ec] text-[#087f5b] border border-[#c2e7d1]">
            <CheckCircle2 className="h-4 w-4 text-[#087f5b]" />
            Approved & Published Live
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
            <Clock className="h-4 w-4 text-[#2563eb]" />
            Under Verification by Review Team
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fef7eb] text-[#b36b00] border border-[#fae2be]">
            <Clock className="h-4 w-4 text-[#b36b00]" />
            Queued for Verification
          </span>
        );
      case 'NEEDS_CHANGES':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]">
            <AlertTriangle className="h-4 w-4 text-[#c2410c]" />
            Action Required / Needs Changes
          </span>
        );
      case 'FLAGGED_FOR_SECURITY_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#faf5ff] text-[#7e22ce] border border-[#f3e8ff]">
            <ShieldAlert className="h-4 w-4 text-[#7e22ce]" />
            Flagged for Security Review (PhishSense Flag)
          </span>
        );
      case 'REJECTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
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
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#172b25] tracking-tight">
          Track Employer Submission Status
        </h1>
        <p className="text-[#64776e] mt-2 text-xs sm:text-sm">
          Check the real-time verification and approval status of your submitted job opening.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-[#dce7e1] shadow-[0_4px_16px_rgba(18,65,48,0.04)] focus-within:ring-2 focus-within:ring-[#087f5b]/20 focus-within:border-[#087f5b]">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#087f5b]" />
            <input
              type="text"
              value={inputRef}
              onChange={(e) => setInputRef(e.target.value)}
              placeholder="Enter Reference ID (e.g. NR-2026-ABC123)…"
              className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none bg-transparent"
              aria-label="Submission reference ID"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#087f5b] hover:bg-[#075e45] text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            Track Status
          </button>
        </div>
      </form>

      {/* Result Card */}
      {loading ? (
        <div className="bg-white border border-[#e1ebe6] rounded-2xl p-8 shadow-xs animate-pulse space-y-4">
          <div className="h-6 bg-[#edf3ee] rounded w-1/3"></div>
          <div className="h-4 bg-[#edf3ee] rounded w-2/3"></div>
          <div className="h-20 bg-[#edf3ee] rounded"></div>
        </div>
      ) : error ? (
        <EmptyState
          variant="no-results"
          title="Submission Not Found"
          description={`We couldn't locate a submission matching "${activeRef}". Please double check your Reference ID and try again.`}
          action={
            <Link
              to="/post-job"
              className="px-5 py-2.5 bg-[#087f5b] text-white text-xs font-bold rounded-xl hover:bg-[#075e45] transition"
            >
              Post a New Job
            </Link>
          }
        />
      ) : data ? (
        <div className="bg-white border border-[#e1ebe6] rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(18,65,48,0.04)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#edf3f0]">
            <div>
              <span className="text-xs font-mono font-bold text-[#8ea197] uppercase tracking-wider block">
                Reference ID: {data.referenceId}
              </span>
              <h2 className="font-display font-bold text-xl text-[#172b25] mt-1 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#087f5b]" />
                {data.jobTitle}
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#64776e] mt-1">
                <Building2 className="h-4 w-4 text-[#8ea197]" />
                <span>{data.companyName}</span>
              </div>
            </div>

            <div>{getStatusBadge(data.status)}</div>
          </div>

          {/* Explanation Box */}
          <div className="bg-[#f7faf8] border border-[#e1ebe6] rounded-xl p-5 text-xs sm:text-sm text-[#2b4237] leading-relaxed">
            {getStatusExplanation(data.status)}
          </div>

          {/* Timeline / Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#708479] pt-2 border-t border-[#edf3f0]">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#8ea197]" />
              <span>
                Submitted on: <strong className="text-[#172b25]">{new Date(data.submittedAt).toLocaleString()}</strong>
              </span>
            </div>
            {data.updatedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#8ea197]" />
                <span>
                  Last update: <strong className="text-[#172b25]">{new Date(data.updatedAt).toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>

          {data.status === 'APPROVED' && (
            <div className="pt-4 flex justify-end">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#087f5b] hover:bg-[#075e45] text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                View in Jobs Directory
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-[#8ea197] text-sm">
          Enter a Reference ID above to see the current review status.
        </div>
      )}
    </div>
  );
}
