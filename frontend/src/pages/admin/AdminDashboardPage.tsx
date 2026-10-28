import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminStats } from '../../lib/hooks';
import api from '../../lib/api';
import type { SyncRun } from '../../lib/types';
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
  Plus
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { data: stats, loading: statsLoading, refetch: refetchStats } = useAdminStats();

  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);

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

  useEffect(() => {
    fetchSyncRuns();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-200 gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Logged in as <span className="font-semibold text-gray-700">{user?.username}</span>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Jobs</div>
          <div className="text-2xl font-bold text-brand-600 mt-2">
            {statsLoading ? '...' : stats?.activeJobs.toLocaleString() ?? 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">Discoverable in search</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expired Jobs</div>
          <div className="text-2xl font-bold text-gray-700 mt-2">
            {statsLoading ? '...' : stats?.expiredJobs.toLocaleString() ?? 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">Audited & withdrawn</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Companies</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {statsLoading ? '...' : stats?.totalCompanies ?? 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">Configured in system</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Sources</div>
          <div className="text-2xl font-bold text-teal-600 mt-2">
            {statsLoading ? '...' : `${stats?.enabledSources ?? 0} / ${stats?.totalSources ?? 0}`}
          </div>
          <div className="text-xs text-gray-400 mt-1">Scheduled ATS crawlers</div>
        </div>
      </div>

      {/* Recent Sync Runs */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Synchronization Runs</h2>
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
                    No sync runs recorded yet. Click "Trigger Sync" to start one.
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
    </div>
  );
}
