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
        <div className="bg-white border border-[#e1ebe6] rounded-2xl p-8 sm:p-10 shadow-[0_4px_24px_rgba(18,65,48,0.06)] text-center">
          <div className="w-16 h-16 bg-[#eaf6ef] text-[#087f5b] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#cbe4d4]">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#087f5b] bg-[#eaf6ef] px-3.5 py-1 rounded-full border border-[#bce4ce]">
            Submission Received
          </span>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#172b25] mt-4 mb-3 tracking-tight">
            Job Posting Submitted for Verification
          </h1>

          <div className="bg-[#eff8f2] border border-[#cbe4d4] rounded-xl p-5 my-6 text-left">
            <p className="text-xs sm:text-sm font-medium text-[#233f31] leading-relaxed">
              “Your job posting has been submitted and is under verification. Our team will review the company details and application link before publishing it. You will be notified when a decision is made.”
            </p>
          </div>

          <div className="bg-[#f7faf8] border border-[#e1ebe6] rounded-xl p-5 mb-8">
            <div className="text-xs text-[#708479] mb-1">Your Unique Reference ID</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-mono font-bold text-[#172b25] tracking-wider">
                {response.referenceId}
              </span>
              <button
                type="button"
                onClick={copyReferenceId}
                className="p-2 rounded-lg bg-white border border-[#e1ebe6] hover:bg-[#eaf6ef] text-[#556960] transition"
                title="Copy reference ID"
              >
                {copied ? <Check className="h-4 w-4 text-[#087f5b]" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-[#708479] mt-2">
              Save this reference ID to track your listing's verification status anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/submission-status/${response.referenceId}`}
              className="w-full sm:w-auto px-6 py-3 bg-[#087f5b] hover:bg-[#075e45] text-white font-bold rounded-xl text-xs sm:text-sm transition inline-flex items-center justify-center gap-2 shadow-xs"
            >
              Track Review Status
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-6 py-3 bg-[#eaf6ef] hover:bg-[#d8f1e2] text-[#087f5b] font-bold rounded-xl text-xs sm:text-sm transition inline-flex items-center justify-center border border-[#cbe4d4]"
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7f6ef] text-[#087f5b] text-[11px] font-bold tracking-wider uppercase mb-2">
          <Briefcase className="h-3.5 w-3.5" />
          Verified Employer Recruiting
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#172b25] tracking-tight">
          Post an Opportunity on NextRole India
        </h1>
        <p className="text-[#64776e] mt-2 text-xs sm:text-base leading-relaxed max-w-2xl">
          Connect with motivated software engineers, fresh graduates, and interns across India.
          All employer postings undergo automated phishing, lookalike domain, and security checks before approval.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-[#e1ebe6] rounded-2xl p-6 sm:p-10 shadow-[0_4px_24px_rgba(18,65,48,0.04)]">
        {/* Section 1: Employer Details */}
        <div>
          <h2 className="font-display font-bold text-lg text-[#172b25] mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#087f5b]" />
            1. Company & Recruiter Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Freshworks, Razorpay, Zepto"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Official Company Website <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  type="url"
                  name="companyWebsite"
                  required
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Recruiter / Hiring Contact Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  type="text"
                  name="recruiterName"
                  required
                  value={formData.recruiterName}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Official Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  type="email"
                  name="recruiterEmail"
                  required
                  value={formData.recruiterEmail}
                  onChange={handleChange}
                  placeholder="recruiter@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
                />
              </div>
              <p className="text-[11px] text-[#708479] mt-1">
                Must match company domain for automated trust verification.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Opportunity Details */}
        <div className="pt-6 border-t border-[#edf3f0]">
          <h2 className="font-display font-bold text-lg text-[#172b25] mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#087f5b]" />
            2. Opportunity Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                required
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Graduate QA Engineer / Full Stack Trainee"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Job Description & Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                name="jobDescription"
                required
                rows={5}
                value={formData.jobDescription}
                onChange={handleChange}
                placeholder="Outline the responsibilities, expected skills (Java, React, SQL), eligibility batch, and selection process..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru / Hyderabad / Pune"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Work Mode <span className="text-red-500">*</span>
              </label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] bg-[#fafcfb] focus:outline-none focus:border-[#087f5b] cursor-pointer"
              >
                <option value="ONSITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] bg-[#fafcfb] focus:outline-none focus:border-[#087f5b] cursor-pointer"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="GRADUATE_PROGRAMME">Graduate Programme</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] bg-[#fafcfb] focus:outline-none focus:border-[#087f5b] cursor-pointer"
              >
                <option value="FRESHER">Fresher (0-1 yrs)</option>
                <option value="JUNIOR">Junior (1-3 yrs)</option>
                <option value="MID">Mid-Level (3-5 yrs)</option>
                <option value="SENIOR">Senior (5+ yrs)</option>
                <option value="LEAD">Lead / Architect</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Salary Range / Stipend (Optional)
              </label>
              <input
                type="text"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleChange}
                placeholder="e.g. ₹6-8 LPA or ₹25,000/month"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Application Deadline (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] bg-[#fafcfb] focus:outline-none focus:border-[#087f5b]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Official Application URL */}
        <div className="pt-6 border-t border-[#edf3f0]">
          <h2 className="font-display font-bold text-lg text-[#172b25] mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#087f5b]" />
            3. Official Application & Redirect Links
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#35483f] mb-1">
                Official Candidate Apply URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  type="url"
                  name="applyUrl"
                  required
                  value={formData.applyUrl}
                  onChange={handleChange}
                  placeholder="https://jobs.company.com/apply/1234 or ATS portal URL"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
                />
              </div>
              <p className="text-[11px] text-[#708479] mt-1">
                Candidates will be redirected to this link to complete their application. Must belong to your official company domain or supported ATS.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Consent & Authorization */}
        <div className="pt-6 border-t border-[#edf3f0]">
          <div className="p-4 rounded-xl bg-[#eff8f2] border border-[#cbe4d4] flex items-start gap-3">
            <input
              type="checkbox"
              id="authorizedConsent"
              name="authorizedConsent"
              checked={formData.authorizedConsent}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-[#bce4ce] text-[#087f5b] focus:ring-[#087f5b] accent-[#087f5b] cursor-pointer shrink-0"
            />
            <label htmlFor="authorizedConsent" className="text-xs text-[#2b4438] leading-relaxed cursor-pointer select-none">
              <span className="font-bold text-[#172b25] block mb-0.5">Employer Authorization & Accuracy Consent</span>
              I confirm that I am an authorized recruiter, HR professional, or official representative of the hiring company. I certify that this job opportunity is authentic, adheres to Indian employment guidelines, does not require candidate payment, and directs candidates to our official application page.
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end gap-4">
          <Link
            to="/submission-status"
            className="text-xs font-semibold text-[#708479] hover:text-[#172b25] transition"
          >
            Track Existing Submission
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 bg-[#087f5b] hover:bg-[#075e45] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(8,127,91,0.22)] disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Submitting & Verifying…' : 'Submit for Verification'}
          </button>
        </div>
      </form>
    </div>
  );
}
