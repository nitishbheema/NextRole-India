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
