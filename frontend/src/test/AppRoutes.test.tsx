import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { AuthProvider } from '../contexts/AuthContext';
import * as hooks from '../lib/hooks';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: null }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../lib/hooks', async () => {
  const actual = await vi.importActual('../lib/hooks');
  return {
    ...actual,
    useJobs: vi.fn(),
    useJob: vi.fn(),
    usePublicSources: vi.fn(),
    useSubmissionStatus: vi.fn(),
  };
});

describe('AppRoutes - Direct Navigation and Page Refresh Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hooks.useJobs).mockReturnValue({
      data: {
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    vi.mocked(hooks.useJob).mockReturnValue({
      data: {
        id: 42,
        title: 'Lead Software Architect',
        companyName: 'Thoughtworks',
        location: 'Bengaluru, India',
        country: 'India',
        description: '<p>Exciting engineering role</p>',
        applyUrl: 'https://thoughtworks.com/jobs/42',
        sourceType: 'GREENHOUSE',
        jobType: 'FULL_TIME',
        experienceLevel: 'LEAD',
        workMode: 'HYBRID',
        publishedAt: '2026-10-28T10:00:00Z',
        lastVerifiedAt: '2026-10-28T10:00:00Z',
      },
      loading: false,
      error: null,
      notFound: false,
    });

    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: {
        totalRegisteredCompanies: 1,
        statusBreakdown: { ACTIVE_IMPORT: 1 },
        aggregators: {
          naukri: { name: 'Naukri', url: 'https://www.naukri.com', mode: 'LINK_ONLY' },
          unstop: { name: 'Unstop', url: 'https://unstop.com', mode: 'LINK_ONLY' },
        },
        companies: [
          {
            id: 1,
            name: 'Freshworks',
            category: 'Product & SaaS',
            careersUrl: 'https://freshworks.com/careers',
            sourceType: 'GREENHOUSE',
            boardIdentifier: 'freshworks',
            integrationStatus: 'ACTIVE_IMPORT',
            lastCheckedAt: '2026-10-28T10:00:00Z',
            lastSuccessAt: '2026-10-28T10:00:00Z',
            errorMessage: null,
            notes: 'Active ATS integration',
            activeJobCount: 15,
            dbCompanyId: 1,
          },
        ],
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    vi.mocked(hooks.useSubmissionStatus).mockReturnValue({
      data: {
        referenceId: 'SUB-20261029-ABCD',
        jobTitle: 'Backend Engineer',
        companyName: 'NextCorp India',
        status: 'UNDER_REVIEW',
        submittedAt: '2026-10-29T10:00:00Z',
        updatedAt: '2026-10-29T10:00:00Z',
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  const renderWithRoute = (initialPath: string) => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders HomePage on direct load to "/"', async () => {
    renderWithRoute('/');
    expect(await screen.findByText(/Find your next role with/i)).toBeInTheDocument();
  });

  it('renders JobsPage on direct load or refresh to "/jobs"', async () => {
    renderWithRoute('/jobs');
    expect(await screen.findByText('Discover Opportunities')).toBeInTheDocument();
  });

  it('renders JobDetailPage on direct load or refresh to "/jobs/:id"', async () => {
    renderWithRoute('/jobs/42');
    expect(await screen.findByRole('heading', { name: 'Lead Software Architect' })).toBeInTheDocument();
    expect(screen.getAllByText('Thoughtworks').length).toBeGreaterThan(0);
  });

  it('renders CompaniesPage on direct load or refresh to "/companies"', async () => {
    renderWithRoute('/companies');
    expect(await screen.findByRole('heading', { name: /100 Target Companies/i })).toBeInTheDocument();
  });

  it('renders PostJobPage on direct load or refresh to "/post-job"', async () => {
    renderWithRoute('/post-job');
    expect(await screen.findByRole('heading', { name: /Post an Opportunity on NextRole India/i })).toBeInTheDocument();
  });

  it('renders SubmissionStatusPage on direct load or refresh to "/submission-status"', async () => {
    renderWithRoute('/submission-status');
    expect(await screen.findByRole('heading', { name: /Track Employer Submission Status/i })).toBeInTheDocument();
  });

  it('renders SubmissionStatusPage with details on direct load to "/submission-status/:ref"', async () => {
    renderWithRoute('/submission-status/SUB-20261029-ABCD');
    expect(await screen.findByRole('heading', { name: /Track Employer Submission Status/i })).toBeInTheDocument();
    expect(await screen.findByText(/SUB-20261029-ABCD/)).toBeInTheDocument();
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
  });

  it('renders AboutPage on direct load or refresh to "/about"', async () => {
    renderWithRoute('/about');
    expect(await screen.findByText('About NextRole India')).toBeInTheDocument();
    expect(screen.getByText('Mission & Architecture')).toBeInTheDocument();
  });

  it('renders AdminLoginPage on direct load or refresh to "/admin/login"', async () => {
    renderWithRoute('/admin/login');
    expect(await screen.findByText('NextRole Administration')).toBeInTheDocument();
  });

  it('renders NotFoundPage on direct load or refresh to an unknown route "/*"', async () => {
    renderWithRoute('/some/invalid/path-that-does-not-exist');
    expect(await screen.findByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText(/404/)).toBeInTheDocument();
  });
});
