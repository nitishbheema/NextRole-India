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
  ArrowRight,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';

const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'throwawaymail.com', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'trashmail.com', 'yopmail.com', 'sharklasers.com',
  'getnada.com', 'dispostable.com', 'fakeinbox.com', 'mohmal.com'
];

const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com',
  'live.com', 'icloud.com', 'mail.ru', 'proton.me', 'protonmail.com'
];

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<EmployerJobSubmissionResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const getEmailDomain = (email: string) => {
    const parts = email.split('@');
    return parts.length > 1 ? parts[1].toLowerCase().trim() : '';
  };

  const domain = getEmailDomain(formData.recruiterEmail);
  const isPersonalEmail = PERSONAL_EMAIL_DOMAINS.includes(domain);
  const isDisposableEmail = DISPOSABLE_EMAIL_DOMAINS.includes(domain);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Clear inline field error on input change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (error) setError(null);

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required.';
    }
    if (!formData.companyWebsite.trim()) {
      errors.companyWebsite = 'Company website is required.';
    } else if (!/^https?:\/\//i.test(formData.companyWebsite.trim())) {
      errors.companyWebsite = 'Please enter a valid website URL starting with https:// or http://';
    }

    if (!formData.recruiterName.trim()) {
      errors.recruiterName = 'Recruiter or contact name is required.';
    }

    if (!formData.recruiterEmail.trim()) {
      errors.recruiterEmail = 'Recruiter email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recruiterEmail.trim())) {
      errors.recruiterEmail = 'Please provide a valid email format (e.g., recruiter@company.com).';
    } else {
      const emailDom = getEmailDomain(formData.recruiterEmail);
      if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDom)) {
        errors.recruiterEmail = 'Disposable/temporary email addresses are not permitted. Please use your official company or professional email.';
      }
    }

    if (!formData.jobTitle.trim()) {
      errors.jobTitle = 'Job title is required.';
    }
    if (!formData.jobDescription.trim()) {
      errors.jobDescription = 'Job description & requirements are required.';
    }
    if (!formData.location.trim()) {
      errors.location = 'Job location is required (e.g. Bengaluru, Remote, Pune).';
    }

    if (!formData.applyUrl.trim()) {
      errors.applyUrl = 'Official candidate application URL is required.';
    } else if (!/^https?:\/\//i.test(formData.applyUrl.trim())) {
      errors.applyUrl = 'Please enter a valid application URL starting with https:// or http://';
    }

    if (!formData.authorizedConsent) {
      errors.authorizedConsent = 'You must confirm authorization and accuracy before submitting.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please resolve the highlighted validation errors before submitting.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Normalize URLs if needed
      let formattedWebsite = formData.companyWebsite.trim();
      if (!/^https?:\/\//i.test(formattedWebsite)) {
        formattedWebsite = 'https://' + formattedWebsite;
      }

      let formattedApplyUrl = formData.applyUrl.trim();
      if (!/^https?:\/\//i.test(formattedApplyUrl)) {
        formattedApplyUrl = 'https://' + formattedApplyUrl;
      }

      // Format deadline for LocalDateTime (YYYY-MM-DDTHH:mm:ss)
      let formattedDeadline: string | undefined = undefined;
      if (formData.deadline && formData.deadline.trim()) {
        const trimmed = formData.deadline.trim();
        formattedDeadline = trimmed.includes('T') ? trimmed : `${trimmed}T23:59:59`;
      }

      const payload: EmployerJobSubmissionRequest = {
        ...formData,
        companyWebsite: formattedWebsite,
        applyUrl: formattedApplyUrl,
        deadline: formattedDeadline,
      };

      const res = await api.post<EmployerJobSubmissionResponse>('/api/employer/jobs', payload);

      if (res.data && res.data.referenceId) {
        setResponse(res.data);
      } else {
        throw new Error('Server returned an unexpected response without a reference ID.');
      }
    } catch (err: unknown) {
      const errorObj = err as {
        message?: string;
        response?: {
          status?: number;
          data?: {
            message?: string;
            errors?: Record<string, string>;
          };
        };
      };

      const status = errorObj.response?.status;
      const responseData = errorObj.response?.data;

      if (!errorObj.response) {
        setError('Cannot connect to NextRole backend service. Please check your internet connection or verify server status.');
      } else if (status === 400) {
        if (responseData?.errors && Object.keys(responseData.errors).length > 0) {
          setFieldErrors(responseData.errors);
          setError('Validation failed: please review the highlighted fields below.');
        } else {
          setError(responseData?.message || 'Submission failed validation. Please check your inputs.');
        }
      } else if (status === 403) {
        setError('Submission was rejected by security policy (CORS or restricted application URL). Please check the domain.');
      } else if (status === 404) {
        setError('Submission API endpoint (/api/employer/jobs) not found. Please verify the deployed backend URL.');
      } else if (status === 429) {
        setError('Too many submissions in a short period. Please wait a few minutes before trying again.');
      } else if (status && status >= 500) {
        setError('The server encountered an error while verifying this submission. Please try again shortly.');
      } else {
        setError(responseData?.message || errorObj.message || 'Failed to submit job posting. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyReferenceId = () => {
    if (response?.referenceId && navigator.clipboard) {
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
                aria-label="Copy reference ID"
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
      <form onSubmit={handleSubmit} noValidate className="space-y-8 bg-white border border-[#e1ebe6] rounded-2xl p-6 sm:p-10 shadow-[0_4px_24px_rgba(18,65,48,0.04)]">
        {/* Section 1: Employer Details */}
        <div>
          <h2 className="font-display font-bold text-lg text-[#172b25] mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#087f5b]" />
            1. Company & Recruiter Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="companyName" className="block text-xs font-bold text-[#35483f] mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Freshworks, Razorpay, Zepto"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:ring-2 bg-[#fafcfb] transition ${
                  fieldErrors.companyName
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-[#dce7e1] focus:border-[#087f5b] focus:ring-[#087f5b]/20'
                }`}
              />
              {fieldErrors.companyName && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {fieldErrors.companyName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="companyWebsite" className="block text-xs font-bold text-[#35483f] mb-1">
                Official Company Website <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  id="companyWebsite"
                  type="url"
                  name="companyWebsite"
                  required
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://company.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:ring-2 bg-[#fafcfb] transition ${
                    fieldErrors.companyWebsite
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-[#dce7e1] focus:border-[#087f5b] focus:ring-[#087f5b]/20'
                  }`}
                />
              </div>
              {fieldErrors.companyWebsite && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {fieldErrors.companyWebsite}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="recruiterName" className="block text-xs font-bold text-[#35483f] mb-1">
                Recruiter / Hiring Contact Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  id="recruiterName"
                  type="text"
                  name="recruiterName"
                  required
                  value={formData.recruiterName}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:ring-2 bg-[#fafcfb] transition ${
                    fieldErrors.recruiterName
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-[#dce7e1] focus:border-[#087f5b] focus:ring-[#087f5b]/20'
                  }`}
                />
              </div>
              {fieldErrors.recruiterName && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {fieldErrors.recruiterName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="recruiterEmail" className="block text-xs font-bold text-[#35483f] mb-1">
                Recruiter Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  id="recruiterEmail"
                  type="email"
                  name="recruiterEmail"
                  required
                  value={formData.recruiterEmail}
                  onChange={handleChange}
                  placeholder="recruiter@company.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:ring-2 bg-[#fafcfb] transition ${
                    fieldErrors.recruiterEmail
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-[#dce7e1] focus:border-[#087f5b] focus:ring-[#087f5b]/20'
                  }`}
                />
              </div>
              {fieldErrors.recruiterEmail ? (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {fieldErrors.recruiterEmail}
                </p>
              ) : isPersonalEmail ? (
                <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                  <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  Personal email detected: accepted for review with manual recruiter identity verification before publication.
                </p>
              ) : isDisposableEmail ? (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  Disposable temporary email addresses are not allowed.
                </p>
              ) : (
                <p className="text-[11px] text-[#708479] mt-1">
                  Company domain emails receive priority automated validation.
                </p>
              )}
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
              <label htmlFor="jobTitle" className="block text-xs font-bold text-[#35483f] mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                id="jobTitle"
                type="text"
                name="jobTitle"
                required
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Graduate QA Engineer / Full Stack Trainee"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:ring-2 bg-[#fafcfb] transition ${
                  fieldErrors.jobTitle
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-[#dce7e1] focus:border-[#087f5b] focus:ring-[#087f5b]/20'
                }`}
              />
              {fieldErrors.jobTitle && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {fieldErrors.jobTitle}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="jobDescription" className="block text-xs font-bold text-[#35483f] mb-1">
                Job Description & Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                required
                rows={5}
                value={formData.jobDescription}
                onChange={handleChange}
                placeholder="Outline the responsibilities, expected skills (Java, React, SQL), eligibility batch, and selection process..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:ring-2 bg-[#fafcfb] transition ${
                  fieldErrors.jobDescription
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-[#dce7e1] focus:border-[#087f5b] focus:ring-[#087f5b]/20'
                }`}
              ></textarea>
              {fieldErrors.jobDescription && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {fieldErrors.jobDescription}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-xs font-bold text-[#35483f] mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  id="location"
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru / Hyderabad / Pune"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:ring-2 bg-[#fafcfb] transition ${
                    fieldErrors.location
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-[#dce7e1] focus:border-[#087f5b] focus:ring-[#087f5b]/20'
                  }`}
                />
              </div>
              {fieldErrors.location && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {fieldErrors.location}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="workMode" className="block text-xs font-bold text-[#35483f] mb-1">
                Work Mode <span className="text-red-500">*</span>
              </label>
              <select
                id="workMode"
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
              <label htmlFor="jobType" className="block text-xs font-bold text-[#35483f] mb-1">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                id="jobType"
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
              <label htmlFor="experienceLevel" className="block text-xs font-bold text-[#35483f] mb-1">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <select
                id="experienceLevel"
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
              <label htmlFor="salaryRange" className="block text-xs font-bold text-[#35483f] mb-1">
                Salary Range / Stipend (Optional)
              </label>
              <input
                id="salaryRange"
                type="text"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleChange}
                placeholder="e.g. ₹6-8 LPA or ₹25,000/month"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce7e1] text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/20 bg-[#fafcfb]"
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-xs font-bold text-[#35483f] mb-1">
                Application Deadline (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  id="deadline"
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
              <label htmlFor="applyUrl" className="block text-xs font-bold text-[#35483f] mb-1">
                Official Candidate Apply URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea197]" />
                <input
                  id="applyUrl"
                  type="url"
                  name="applyUrl"
                  required
                  value={formData.applyUrl}
                  onChange={handleChange}
                  placeholder="https://jobs.company.com/apply/1234 or ATS portal URL"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#172b25] placeholder-[#8ea197] focus:outline-none focus:ring-2 bg-[#fafcfb] transition ${
                    fieldErrors.applyUrl
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-[#dce7e1] focus:border-[#087f5b] focus:ring-[#087f5b]/20'
                  }`}
                />
              </div>
              {fieldErrors.applyUrl ? (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {fieldErrors.applyUrl}
                </p>
              ) : (
                <p className="text-[11px] text-[#708479] mt-1">
                  Candidates will be redirected to this link to complete their application. Must belong to your official company domain or supported ATS.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Consent & Authorization */}
        <div className="pt-6 border-t border-[#edf3f0]">
          <div className={`p-4 rounded-xl border transition ${
            fieldErrors.authorizedConsent
              ? 'bg-red-50/50 border-red-300'
              : 'bg-[#eff8f2] border-[#cbe4d4]'
          } flex items-start gap-3`}>
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
          {fieldErrors.authorizedConsent && (
            <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {fieldErrors.authorizedConsent}
            </p>
          )}
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
            className="px-7 py-3 bg-[#087f5b] hover:bg-[#075e45] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(8,127,91,0.22)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting & Verifying…</span>
              </>
            ) : (
              <span>Submit for Verification</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
