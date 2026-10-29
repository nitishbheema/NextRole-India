import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminStats } from '../../lib/hooks';
import api from '../../lib/api';
import type { SyncRun, AdminSubmission, SubmissionStatus } from '../../lib/types';
import {
  Briefcase,
  Building2,
  Layers,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  FileSpreadsheet,
  Check,
  Clock,
  Eye,
  X
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { data: stats, loading: statsLoading, refetch: refetchStats } = useAdminStats();

  const [activeTab, setActiveTab] = useState<'sync' | 'submissions' | 'import'>('submissions');

  // Sync state
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);

  // Submissions state
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [subStatusFilter, setSubStatusFilter] = useState<string>('ALL');
  const [selectedSub, setSelectedSub] = useState<AdminSubmission | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // CSV Import state
  const [csvText, setCsvText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const fetchSyncRuns = async () => {
    setRunsLoading(true);
    try {
      const res = await api.get<SyncRun[]>('/api/admin/sync-runs?limit=25');
      setSyncRuns(res.data);
    } catch {
      // Ignored
    } finally {
      setRunsLoading(false);
    }
  };

  const fetchSubmissions = useCallback(async () => {
    setSubLoading(true);
    try {
      const params: Record<string, string> = {};
      if (subStatusFilter !== 'ALL') {
        params.status = subStatusFilter;
      }
      const res = await api.get<{ content: AdminSubmission[] }>('/api/admin/submissions', { params });
      setSubmissions(res.data.content || []);
    } catch {
      // Ignored
    } finally {
      setSubLoading(false);
    }
  }, [subStatusFilter]);

  useEffect(() => {
    fetchSyncRuns();
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleTriggerSync = async () => {
    setTriggering(true);
    setTriggerMessage(null);
    try {
      const res = await api.post<{ message: string }>('/api/admin/sync/trigger');
      setTriggerMessage(res.data.message || 'Sync started successfully!');
      setTimeout(() => {
        fetchSyncRuns();
        refetchStats();
      }, 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setTriggerMessage(e?.response?.data?.message || 'Failed to trigger sync.');
    } finally {
      setTriggering(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(true);
    try {
      await api.post(`/api/admin/submissions/${id}/approve`, { notes: actionNotes || 'Approved' });
      setSelectedSub(null);
      setActionNotes('');
      fetchSubmissions();
      refetchStats();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      alert('Error approving submission: ' + (e?.response?.data?.message || e?.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!actionNotes.trim()) {
      alert('Please provide a reason/note for rejecting the listing.');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/api/admin/submissions/${id}/reject`, { notes: actionNotes });
      setSelectedSub(null);
      setActionNotes('');
      fetchSubmissions();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      alert('Error rejecting submission: ' + (e?.response?.data?.message || e?.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async (id: number) => {
    if (!actionNotes.trim()) {
      alert('Please provide change instructions for the employer.');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/api/admin/submissions/${id}/request-changes`, { notes: actionNotes });
      setSelectedSub(null);
      setActionNotes('');
      fetchSubmissions();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      alert('Error requesting changes: ' + (e?.response?.data?.message || e?.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescan = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await api.post<AdminSubmission>(`/api/admin/submissions/${id}/rescan`);
      setSelectedSub(res.data);
      fetchSubmissions();
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Rescan failed: ' + e?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const res = await api.post<{ imported: number; skipped: number; errors: string[] }>('/api/admin/sources/import-csv', { csvData: csvText });
      setImportResult(res.data);
      refetchStats();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      alert('CSV Import error: ' + (e?.response?.data?.message || e?.message));
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-200 gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Operations Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Logged in as <span className="font-semibold text-gray-700">{user?.username}</span> • Protected System Administration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/sources"
            className="px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Manage Sources
          </Link>
          <button
            onClick={handleTriggerSync}
            disabled={triggering}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${triggering ? 'animate-spin' : ''}`} />
            {triggering ? 'Triggering...' : 'Trigger Sync'}
          </button>
          <button
            onClick={() => logout()}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {triggerMessage && (
        <div className="mb-6 p-3 bg-brand-50 border border-brand-200 text-brand-800 text-sm rounded-lg flex items-center justify-between">
          <span>{triggerMessage}</span>
          <button onClick={() => setTriggerMessage(null)} className="text-xs font-semibold text-brand-600">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Jobs</div>
          <div className="text-2xl font-bold text-brand-600 mt-2">
            {statsLoading ? '...' : stats?.activeJobs.toLocaleString() ?? 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">Live in search index</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Submissions</div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {submissions.filter((s) => s.status === 'PENDING_VERIFICATION' || s.status === 'UNDER_REVIEW').length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Awaiting review queue</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Companies</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {statsLoading ? '...' : stats?.totalCompanies ?? 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">Registry benchmark employers</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hourly Sync Crawlers</div>
          <div className="text-2xl font-bold text-teal-600 mt-2">
            {statsLoading ? '...' : `${stats?.enabledSources ?? 0} / ${stats?.totalSources ?? 0}`}
          </div>
          <div className="text-xs text-gray-400 mt-1">Hourly scheduled worker</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'submissions'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Employer Submissions Queue ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'sync'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Hourly Sync History & Runs
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'import'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Import Sources CSV
        </button>
      </div>

      {/* Tab 1: Submissions Review Queue */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Filter by Status:</span>
              <select
                value={subStatusFilter}
                onChange={(e) => setSubStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:ring-brand-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="NEEDS_CHANGES">Needs Changes</option>
                <option value="FLAGGED_FOR_SECURITY_REVIEW">Security Flagged</option>
              </select>
            </div>

            <button
              onClick={() => fetchSubmissions()}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Queue
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-5 py-3">Reference ID</th>
                    <th className="px-5 py-3">Company & Role</th>
                    <th className="px-5 py-3">Recruiter Contact</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">PhishSense Risk</th>
                    <th className="px-5 py-3">Submitted</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                  {subLoading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                        Loading submissions queue...
                      </td>
                    </tr>
                  ) : submissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                        No submissions matching the selected status.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3 font-mono font-bold text-gray-900">{sub.referenceId}</td>
                        <td className="px-5 py-3 font-medium text-gray-900">
                          <div>{sub.jobTitle}</div>
                          <span className="text-[11px] text-gray-500">{sub.companyName}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          <div>{sub.recruiterName}</div>
                          <span className="text-[11px] text-gray-400">{sub.recruiterEmail}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              sub.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.status === 'FLAGGED_FOR_SECURITY_REVIEW'
                                ? 'bg-purple-100 text-purple-800'
                                : sub.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                              sub.threatScore >= 60 || sub.riskLabel === 'MALICIOUS'
                                ? 'text-red-600'
                                : sub.threatScore >= 30 || sub.riskLabel === 'SUSPICIOUS'
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {sub.threatScore >= 30 ? (
                              <ShieldAlert className="h-3.5 w-3.5" />
                            ) : (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            )}
                            {sub.riskLabel} ({sub.threatScore})
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400">
                          {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedSub(sub);
                              setActionNotes('');
                            }}
                            className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-md text-xs transition inline-flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Review Details Modal */}
          {selectedSub && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-400">
                      REF: {selectedSub.referenceId}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">{selectedSub.jobTitle}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedSub.companyName} • {selectedSub.location} • {selectedSub.jobType}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSub(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Candidate URLs */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-2">
                  <div>
                    <span className="font-semibold text-gray-700">Official Company Website:</span>{' '}
                    <a
                      href={selectedSub.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline break-all"
                    >
                      {selectedSub.companyWebsite}
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Submitted Apply URL:</span>{' '}
                    <a
                      href={selectedSub.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline break-all"
                    >
                      {selectedSub.applyUrl}
                    </a>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">
                      PhishSense & SSRF Result:{' '}
                      <strong className={selectedSub.threatScore >= 30 ? 'text-red-600' : 'text-emerald-600'}>
                        {selectedSub.riskLabel} (Score: {selectedSub.threatScore}/100)
                      </strong>
                    </span>
                    <button
                      onClick={() => handleRescan(selectedSub.id)}
                      disabled={actionLoading}
                      className="px-2.5 py-1 text-[11px] bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                    >
                      Rescan URL
                    </button>
                  </div>
                  {selectedSub.riskDetails && (
                    <div className="text-[11px] font-mono bg-white p-2 rounded border border-gray-200 text-gray-600 break-all">
                      {selectedSub.riskDetails}
                    </div>
                  )}
                </div>

                {/* Description Preview */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase mb-1">Job Description Preview</h4>
                  <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-xl max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-gray-200">
                    {selectedSub.jobDescription}
                  </div>
                </div>

                {/* Reviewer Notes & Action */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-700">
                    Administrator Review Notes / Decision Reason:
                  </label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter review feedback, verification notes, or reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-brand-500"
                  />

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleRequestChanges(selectedSub.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg transition"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleReject(selectedSub.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition"
                    >
                      Reject Submission
                    </button>
                    <button
                      onClick={() => handleApprove(selectedSub.id)}
                      disabled={actionLoading || selectedSub.status === 'APPROVED'}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve & Publish Live
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Hourly Sync History */}
      {activeTab === 'sync' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Scheduled Synchronization Runs</h2>
            <button
              onClick={() => {
                fetchSyncRuns();
                refetchStats();
              }}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Source / Company</th>
                  <th className="px-6 py-3">Platform</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Found</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Updated</th>
                  <th className="px-6 py-3">Expired</th>
                  <th className="px-6 py-3">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {runsLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                      Loading sync history...
                    </td>
                  </tr>
                ) : syncRuns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                      No sync runs recorded yet.
                    </td>
                  </tr>
                ) : (
                  syncRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3.5 font-medium text-gray-900">
                        {run.companyName}
                        <span className="block text-[11px] text-gray-400">{run.boardIdentifier}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {run.sourceType}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {run.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            SUCCESS
                          </span>
                        ) : run.status === 'RUNNING' ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                            <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                            RUNNING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 font-medium" title={run.errorMessage}>
                            <XCircle className="h-3.5 w-3.5 text-red-600" />
                            FAILED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-gray-900">{run.jobsFound}</td>
                      <td className="px-6 py-3.5 text-green-600 font-semibold">+{run.jobsCreated}</td>
                      <td className="px-6 py-3.5 text-blue-600">{run.jobsUpdated}</td>
                      <td className="px-6 py-3.5 text-red-600 font-semibold">-{run.jobsExpired}</td>
                      <td className="px-6 py-3.5 text-gray-400">
                        {new Date(run.startedAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: CSV Import */}
      {activeTab === 'import' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-brand-600" />
              Import Companies & ATS Sources from CSV
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Paste CSV records exported from Google Sheets or Excel. Format: <code>Company Name, Careers URL, Source Type (GREENHOUSE/LEVER/ASHBY/SMARTRECRUITERS/WORKABLE/UNSUPPORTED), Board Identifier</code>
            </p>
          </div>

          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`Company Name,Careers URL,Source Type,Board Identifier\nZepto,https://www.zeptonow.com/careers,UNSUPPORTED,\nZerodha,https://zerodha.com/careers/,UNSUPPORTED,`}
            className="w-full px-4 py-3 font-mono text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Lines to process: <strong>{csvText.trim().split('\n').filter((l) => l.trim()).length}</strong>
            </span>
            <button
              onClick={handleImportCsv}
              disabled={importLoading || !csvText.trim()}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition disabled:opacity-50"
            >
              {importLoading ? 'Importing...' : 'Run CSV Import'}
            </button>
          </div>

          {importResult && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2">
              <div className="font-semibold text-gray-900">
                Import completed: <span className="text-emerald-600">{importResult.imported} imported</span>,{' '}
                <span className="text-gray-500">{importResult.skipped} skipped</span>
              </div>
              {importResult.errors.length > 0 && (
                <div className="text-red-600 max-h-32 overflow-y-auto">
                  {importResult.errors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
