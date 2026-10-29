export interface Job {
  id: number;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location?: string;
  country?: string;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'GRADUATE_PROGRAMME' | 'APPRENTICESHIP';
  experienceLevel?: 'FRESHER' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE' | 'NOT_SPECIFIED';
  workMode?: 'REMOTE' | 'HYBRID' | 'ONSITE' | 'NOT_SPECIFIED';
  applyUrl: string;
  publishedAt?: string;
  lastVerifiedAt?: string;
  firstSeenAt?: string;
  isEmployerSubmitted?: boolean;
}

export interface JobDetail extends Job {
  description?: string;
  sourceUrl?: string;
  sourceType?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Company {
  id: number;
  name: string;
  logoUrl?: string;
  careersUrl: string;
  activeJobCount: number;
}

export type IntegrationStatus = 'ACTIVE_IMPORT' | 'NEEDS_VERIFICATION' | 'LINK_ONLY' | 'UNSUPPORTED' | 'DISABLED';

export interface RegistryCompany {
  id: number;
  name: string;
  category: string;
  careersUrl: string;
  sourceType: string;
  boardIdentifier?: string;
  integrationStatus: IntegrationStatus;
  lastCheckedAt?: string | null;
  lastSuccessAt?: string | null;
  errorMessage?: string | null;
  notes?: string;
  activeJobCount?: number | null;
  dbCompanyId?: number | null;
  logoUrl?: string | null;
}

export interface AggregatorInfo {
  name: string;
  url: string;
  mode: string;
  note?: string;
}

export interface PublicSourcesResponse {
  totalRegisteredCompanies: number;
  statusBreakdown: Record<string, number>;
  aggregators: {
    naukri: AggregatorInfo;
    unstop: AggregatorInfo;
  };
  companies: RegistryCompany[];
}

export interface JobFilters {
  q?: string;
  company?: string;
  location?: string;
  country?: string;
  jobType?: string;
  experienceLevel?: string;
  workMode?: string;
  page?: number;
  size?: number;
}

export interface SyncRun {
  id: number;
  sourceId: number;
  companyName: string;
  sourceType?: string;
  boardIdentifier?: string;
  startedAt: string;
  completedAt?: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
  jobsFound: number;
  jobsCreated: number;
  jobsUpdated: number;
  jobsExpired: number;
  errorMessage?: string;
}

export interface AdminStats {
  activeJobs: number;
  expiredJobs: number;
  totalJobs: number;
  totalCompanies: number;
  totalSources: number;
  enabledSources: number;
  syncRunsLast24h?: number;
  successfulSyncRunsLast24h?: number;
  recentSyncs?: SyncRun[];
}

export interface JobSource {
  id: number;
  companyId: number;
  companyName: string;
  sourceType: string;
  boardIdentifier: string;
  enabled: boolean;
  lastAttemptedAt?: string;
  lastSuccessfulAt?: string;
  lastError?: string;
}

export type SubmissionStatus =
  | 'PENDING_VERIFICATION'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_CHANGES'
  | 'FLAGGED_FOR_SECURITY_REVIEW';

export type RiskLabel = 'LOW_RISK' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNAVAILABLE' | 'UNKNOWN';

export interface EmployerJobSubmissionRequest {
  companyName: string;
  companyWebsite: string;
  recruiterName: string;
  recruiterEmail: string;
  jobTitle: string;
  jobDescription: string;
  location: string;
  country?: string;
  jobType: string;
  experienceLevel: string;
  workMode: string;
  salaryRange?: string;
  applyUrl: string;
  officialJobUrl?: string;
  deadline?: string;
  authorizedConsent: boolean;
}

export interface EmployerJobSubmissionResponse {
  referenceId: string;
  status: SubmissionStatus;
  message: string;
  submittedAt: string;
}

export interface SubmissionStatusResponse {
  referenceId: string;
  companyName: string;
  jobTitle: string;
  status: SubmissionStatus;
  submittedAt: string;
  updatedAt: string;
}

export interface StatusHistoryItem {
  id: number;
  fromStatus?: SubmissionStatus;
  toStatus: SubmissionStatus;
  notes?: string;
  changedBy?: string;
  createdAt: string;
}

export interface AdminSubmission {
  id: number;
  referenceId: string;
  companyName: string;
  companyWebsite: string;
  recruiterName: string;
  recruiterEmail: string;
  jobTitle: string;
  jobDescription: string;
  location: string;
  country: string;
  jobType: string;
  experienceLevel: string;
  workMode: string;
  salaryRange?: string;
  applyUrl: string;
  officialJobUrl?: string;
  deadline?: string;
  status: SubmissionStatus;
  riskLabel: RiskLabel;
  threatScore: number;
  riskDetails?: string;
  reviewerNotes?: string;
  reviewerUsername?: string;
  publishedJobId?: number;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  statusHistory: StatusHistoryItem[];
}
