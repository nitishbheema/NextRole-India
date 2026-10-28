import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminSources, useCompanies } from '../../lib/hooks';
import api from '../../lib/api';
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Power,
  RefreshCw
} from 'lucide-react';

export default function AdminSourcesPage() {
  const { data: sources, loading, error, refetch } = useAdminSources();
  const { data: companies, refetch: refetchCompanies } = useCompanies();

  const [isAdding, setIsAdding] = useState(false);
  const [companyId, setCompanyId] = useState<number | ''>('');
  const [sourceType, setSourceType] = useState('GREENHOUSE');
  const [boardIdentifier, setBoardIdentifier] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New Company inline fields
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyCareersUrl, setNewCompanyCareersUrl] = useState('');
  const [newCompanyLogoUrl, setNewCompanyLogoUrl] = useState('');

  const handleToggleEnabled = async (sourceId: number, currentEnabled: boolean) => {
    try {
      if (currentEnabled) {
        await api.delete(`/api/admin/sources/${sourceId}`);
      } else {
        await api.put(`/api/admin/sources/${sourceId}`, { enabled: true });
      }
      refetch();
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Failed to update source status: ' + (e?.message || 'Unknown error'));
    }
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      let targetCompanyId = companyId;

      if (isCreatingCompany) {
        if (!newCompanyName.trim() || !newCompanyCareersUrl.trim()) {
          throw new Error('Company name and careers URL are required.');
        }
        const compRes = await api.post<{ id: number }>('/api/admin/companies', {
          name: newCompanyName.trim(),
          careersUrl: newCompanyCareersUrl.trim(),
          logoUrl: newCompanyLogoUrl.trim() || undefined,
        });
        targetCompanyId = compRes.data.id;
        await refetchCompanies();
      }

      if (!targetCompanyId) {
        throw new Error('Please select or create a company.');
      }
      if (!boardIdentifier.trim()) {
        throw new Error('Board identifier is required.');
      }

      await api.post('/api/admin/sources', {
        companyId: targetCompanyId,
        sourceType,
        boardIdentifier: boardIdentifier.trim(),
        enabled: true,
      });

      setIsAdding(false);
      setBoardIdentifier('');
      setIsCreatingCompany(false);
      setNewCompanyName('');
      setNewCompanyCareersUrl('');
      refetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setFormError(e?.response?.data?.message || e?.message || 'Failed to create source.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-8">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Sources & ATS Adapters</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Configure Greenhouse, Lever, and Ashby boards for automated sync.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="h-4 w-4" />
          Add Source
        </button>
      </div>

      {/* Add Source Modal / Panel */}
      {isAdding && (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Add New Job Source</h2>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateSource} className="space-y-4 max-w-xl">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Company
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCompany(!isCreatingCompany)}
                  className="text-xs text-brand-600 hover:underline"
                >
                  {isCreatingCompany ? 'Choose Existing' : '+ New Company'}
                </button>
              </div>

              {isCreatingCompany ? (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swiggy"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Official Careers URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://careers.swiggy.com"
                      value={newCompanyCareersUrl}
                      onChange={(e) => setNewCompanyCareersUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Logo URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={newCompanyLogoUrl}
                      onChange={(e) => setNewCompanyLogoUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              ) : (
                <select
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a company...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Source Type
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="GREENHOUSE">Greenhouse</option>
                  <option value="LEVER">Lever</option>
                  <option value="ASHBY">Ashby</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Board Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. thoughtworks, gojek"
                  value={boardIdentifier}
                  onChange={(e) => setBoardIdentifier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Source'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sources Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3.5">Company</th>
                <th className="px-6 py-3.5">Platform</th>
                <th className="px-6 py-3.5">Board Identifier</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Sync</th>
                <th className="px-6 py-3.5">Last Error</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Loading job sources...
                  </td>
                </tr>
              ) : sources.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No sources configured yet. Add your first Greenhouse, Lever, or Ashby board.
                  </td>
                </tr>
              ) : (
                sources.map((src) => (
                  <tr key={src.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3.5 font-semibold text-gray-900">{src.companyName}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {src.sourceType}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-gray-600">{src.boardIdentifier}</td>
                    <td className="px-6 py-3.5">
                      {src.enabled ? (
                        <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400 font-medium">
                          <XCircle className="h-3.5 w-3.5 text-gray-400" />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">
                      {src.lastSuccessfulAt
                        ? new Date(src.lastSuccessfulAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Never'}
                    </td>
                    <td className="px-6 py-3.5 max-w-xs truncate text-red-600" title={src.lastError || ''}>
                      {src.lastError || '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleEnabled(src.id, src.enabled)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                          src.enabled
                            ? 'text-red-700 bg-red-50 hover:bg-red-100'
                            : 'text-green-700 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        <Power className="h-3 w-3" />
                        {src.enabled ? 'Disable' : 'Enable'}
                      </button>
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
