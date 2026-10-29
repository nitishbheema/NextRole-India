import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { EmployerJobSubmissionRequest, EmployerJobSubmissionResponse } from '../lib/types';
import {
  Briefcase,
  Building2,
  Mail,
  User,
  Globe,
  MapPin,
  Link2,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function PostJobPage() {
  const [formData, setFormData] = useState<EmployerJobSubmissionRequest>({
    companyName: '',
    companyWebsite: '',
    recruiterName: '',
    recruiterEmail: '',
    jobTitle: '',
    jobDescription: '',
    location: '',
    country: 'India',
    jobType: 'FULL_TIME',
    experienceLevel: 'FRESHER',
    workMode: 'HYBRID',
    salaryRange: '',
    applyUrl: '',
    officialJobUrl: '',
    deadline: '',
    authorizedConsent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<EmployerJobSubmissionResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.authorizedConsent) {
      setError('You must confirm authorization to post this job on behalf of the employer.');
      return;
    }

    // Basic business email check
    const emailDomain = formData.recruiterEmail.split('@')[1]?.toLowerCase();
    const commonFreeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'mail.ru'];
    if (emailDomain && commonFreeProviders.includes(emailDomain)) {
      setError('Please use your official company business email address (e.g., recruiter@company.com) for verified employer postings.');
      return;
    }

    setLoading(true);
    try {
      const payload: EmployerJobSubmissionRequest = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      };

      const res = await api.post<EmployerJobSubmissionResponse>('/api/employer/jobs', payload);
      setResponse(res.data);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errorObj.response?.data?.message || errorObj.message || 'Failed to submit job posting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyReferenceId = () => {
    if (response?.referenceId) {
      navigator.clipboard.writeText(response.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (response) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-xs text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
            Submission Received
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4 mb-3">
            Job Posting Submitted for Verification
          </h1>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 my-6 text-left">
            <p className="text-sm font-medium text-emerald-900 leading-relaxed">
              “Your job posting has been submitted and is under verification. Our team will review the company details and application link before publishing it. You will be notified when a decision is made.”
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
            <div className="text-xs text-gray-500 mb-1">Your Unique Reference ID</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                {response.referenceId}
              </span>
              <button
                type="button"
                onClick={copyReferenceId}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
                title="Copy reference ID"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Save this reference ID to track your listing's verification status anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/submission-status/${response.referenceId}`}
              className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition inline-flex items-center justify-center gap-2"
            >
              Track Review Status
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition inline-flex items-center justify-center"
            >
              Explore Public Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
          <Briefcase className="h-4 w-4" />
          Verified Employer Recruiting
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Post an Opportunity on NextRole India
        </h1>
        <p className="text-gray-600 mt-2 text-base leading-relaxed max-w-2xl">
          Connect with motivated software engineers, fresh graduates, and interns across India.
          All employer postings undergo automated phishing, lookalike domain, and security checks before approval.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
        {/* Section 1: Company & Recruiter Details */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-600" />
            1. Company & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Freshworks, Razorpay, Zepto"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Official Company Website <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  name="companyWebsite"
                  required
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Recruiter / Talent Partner Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="recruiterName"
                  required
                  value={formData.recruiterName}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Official Business Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="recruiterEmail"
                  required
                  value={formData.recruiterEmail}
                  onChange={handleChange}
                  placeholder="recruiter@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <span className="text-[11px] text-gray-500 mt-1 block">
                Must match company domain. Public webmails (Gmail, Yahoo) are flagged for manual security screening.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Role Specifications */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-600" />
            2. Job Role Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                required
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Graduate QA Engineer / React Frontend Developer"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="GRADUATE_PROGRAMME">Graduate Programme / Trainee</option>
                <option value="CONTRACT">Contract</option>
                <option value="PART_TIME">Part Time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="FRESHER">Fresher / Entry Level (0-1 yrs)</option>
                <option value="JUNIOR">Junior (1-3 yrs)</option>
                <option value="MID">Mid Level (3-5 yrs)</option>
                <option value="SENIOR">Senior (5+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Work Mode <span className="text-red-500">*</span>
              </label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite (Office)</option>
                <option value="REMOTE">Remote (Work from home)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru / Hyderabad / Pune"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Salary Range (Optional)
              </label>
              <input
                type="text"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleChange}
                placeholder="e.g. ₹6 - 12 LPA or ₹30,000/mo stipend"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Application Deadline (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="jobDescription"
                required
                rows={5}
                value={formData.jobDescription}
                onChange={handleChange}
                placeholder="Outline the responsibilities, tech stack, qualifications, and recruitment process..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Official Links & Verification */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-brand-600" />
            3. Application Destination & PhishSense Security Check
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Official Application URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="applyUrl"
                required
                value={formData.applyUrl}
                onChange={handleChange}
                placeholder="https://jobs.company.com/... or https://boards.greenhouse.io/..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Destination where students will apply. Scanned automatically for phishing, suspicious redirects, and SSRF attacks.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Official Job Posting Page URL (Optional)
              </label>
              <input
                type="url"
                name="officialJobUrl"
                value={formData.officialJobUrl}
                onChange={handleChange}
                placeholder="https://company.com/careers/engineering-lead"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Consent & Verification Commitment */}
        <div className="pt-2 border-t border-gray-100">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="authorizedConsent"
              checked={formData.authorizedConsent}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
            />
            <span className="text-xs text-gray-600 leading-relaxed">
              I certify that I am an authorized talent acquisition representative of the company, the job details and compensation represent an authentic vacancy, and the application link directs candidates to our official hiring pipeline without requiring fees or credential collection.
            </span>
          </label>
        </div>

        {/* Submit Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <span>PhishSense & SSRF protected review process</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scanning & Submitting...
              </>
            ) : (
              <>
                Submit for Verification
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
