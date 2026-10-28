import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CompaniesPage from '../pages/CompaniesPage';
import * as hooks from '../lib/hooks';
import type { RegistryCompany, PublicSourcesResponse } from '../lib/types';

vi.mock('../lib/hooks', async () => {
  const actual = await vi.importActual('../lib/hooks');
  return {
    ...actual,
    usePublicSources: vi.fn(),
  };
});

const generate100Companies = (): RegistryCompany[] => {
  const companies: RegistryCompany[] = [
    {
      id: 1,
      name: 'TCS',
      category: 'IT Services & Consulting',
      careersUrl: 'https://www.tcs.com/careers',
      sourceType: 'UNSUPPORTED',
      boardIdentifier: '',
      integrationStatus: 'LINK_ONLY',
      lastCheckedAt: '2026-10-28T00:00:00Z',
      lastSuccessAt: null,
      errorMessage: null,
      notes: 'Custom enterprise portal',
      activeJobCount: null,
      dbCompanyId: null,
    },
    {
      id: 2,
      name: 'Freshworks',
      category: 'Product & SaaS',
      careersUrl: 'https://freshworks.com/careers',
      sourceType: 'GREENHOUSE',
      boardIdentifier: 'freshworks',
      integrationStatus: 'ACTIVE_IMPORT',
      lastCheckedAt: '2026-10-28T12:00:00Z',
      lastSuccessAt: '2026-10-28T12:00:00Z',
      errorMessage: null,
      notes: 'Greenhouse public API',
      activeJobCount: 5,
      dbCompanyId: 42,
    },
    {
      id: 3,
      name: 'Tech Mahindra',
      category: 'IT Services & Consulting',
      careersUrl: 'https://careers.techmahindra.com/',
      sourceType: 'UNSUPPORTED',
      boardIdentifier: '',
      integrationStatus: 'NEEDS_VERIFICATION',
      lastCheckedAt: '2026-10-28T00:00:00Z',
      lastSuccessAt: null,
      errorMessage: null,
      notes: 'Under review',
      activeJobCount: 0,
      dbCompanyId: null,
    },
  ];

  // Fill remaining up to 100 unique companies
  for (let i = 4; i <= 100; i++) {
    const status = i % 3 === 0 ? 'ACTIVE_IMPORT' : i % 2 === 0 ? 'NEEDS_VERIFICATION' : 'LINK_ONLY';
    const cat = i % 4 === 0 ? 'Fintech & Payments' : i % 4 === 1 ? 'E-Commerce & Retail' : 'IT Services & Consulting';
    companies.push({
      id: i,
      name: `Benchmark Tech ${i}`,
      category: cat,
      careersUrl: `https://benchmarktech${i}.example.com/careers`,
      sourceType: 'UNSUPPORTED',
      boardIdentifier: '',
      integrationStatus: status,
      lastCheckedAt: '2026-10-28T00:00:00Z',
      lastSuccessAt: null,
      errorMessage: null,
      notes: 'Registry benchmark company',
      activeJobCount: status === 'ACTIVE_IMPORT' && i === 6 ? 2 : null,
      dbCompanyId: status === 'ACTIVE_IMPORT' && i === 6 ? 106 : null,
    });
  }

  return companies;
};

const mock100Companies = generate100Companies();

const mockPublicSourcesResponse: PublicSourcesResponse = {
  totalRegisteredCompanies: 100,
  statusBreakdown: {
    ACTIVE_IMPORT: 34,
    NEEDS_VERIFICATION: 33,
    LINK_ONLY: 33,
  },
  companies: mock100Companies,
  aggregators: {
    naukri: {
      name: 'Naukri.com',
      url: 'https://www.naukri.com/',
      mode: 'LINK_ONLY',
      note: 'External lateral portal',
    },
    unstop: {
      name: 'Unstop',
      url: 'https://unstop.com/jobs',
      mode: 'LINK_ONLY',
      note: 'External campus & competitions portal',
    },
  },
};

describe('CompaniesPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton while fetching data', () => {
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('100 Target Companies & ATS Registry')).toBeInTheDocument();
  });

  it('renders all 100 unique registry companies', () => {
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: mockPublicSourcesResponse,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('100 Target Companies & ATS Registry')).toBeInTheDocument();
    expect(screen.getByText('TCS')).toBeInTheDocument();
    expect(screen.getByText('Freshworks')).toBeInTheDocument();
    expect(screen.getByText('Tech Mahindra')).toBeInTheDocument();
    expect(screen.getByText('Benchmark Tech 100')).toBeInTheDocument();

    // Check count feedback
    expect(
      screen.getByText((_, element) => element?.tagName === 'SPAN' && element?.textContent?.trim() === 'Showing 100 of 100 companies in registry')
    ).toBeInTheDocument();
  });

  it('filters companies by search query', () => {
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: mockPublicSourcesResponse,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByLabelText('Search companies');
    fireEvent.change(searchInput, { target: { value: 'Freshworks' } });

    expect(screen.getByText('Freshworks')).toBeInTheDocument();
    expect(screen.queryByText('TCS')).not.toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.tagName === 'SPAN' && element?.textContent?.trim() === 'Showing 1 of 100 companies in registry')
    ).toBeInTheDocument();
  });

  it('filters companies by category', () => {
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: mockPublicSourcesResponse,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    const categorySelect = screen.getByLabelText('Filter by category');
    fireEvent.change(categorySelect, { target: { value: 'Product & SaaS' } });

    expect(screen.getByText('Freshworks')).toBeInTheDocument();
    expect(screen.queryByText('TCS')).not.toBeInTheDocument();
  });

  it('filters companies by integration status', () => {
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: mockPublicSourcesResponse,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    const statusSelect = screen.getByLabelText('Filter by integration status');
    fireEvent.change(statusSelect, { target: { value: 'ACTIVE_IMPORT' } });

    expect(screen.getByText('Freshworks')).toBeInTheDocument();
    expect(screen.queryByText('TCS')).not.toBeInTheDocument();
    expect(screen.queryByText('Tech Mahindra')).not.toBeInTheDocument();
  });

  it('displays correct official careers links with target="_blank" and rel="noopener noreferrer"', () => {
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: mockPublicSourcesResponse,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    const tcsLink = screen.getAllByRole('link', { name: /Official Careers Portal/i })[0];
    expect(tcsLink).toHaveAttribute('href', 'https://www.tcs.com/careers');
    expect(tcsLink).toHaveAttribute('target', '_blank');
    expect(tcsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders integration status badges accurately', () => {
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: mockPublicSourcesResponse,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Automated Feed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Under Review').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Link Only').length).toBeGreaterThan(0);
  });

  it('does not fabricate active job counts for LINK_ONLY companies', () => {
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: mockPublicSourcesResponse,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    // Freshworks has activeJobCount: 5
    expect(screen.getByText('5 active jobs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View 5 openings/i })).toBeInTheDocument();

    // TCS has null activeJobCount and LINK_ONLY status -> should say "Official careers link"
    expect(screen.getAllByText('Official careers link').length).toBeGreaterThan(0);
    // Should NOT have a fake job count for TCS
    expect(screen.queryByText(/0 active jobs/i)).not.toBeInTheDocument();
  });

  it('renders Explore More Job Sources section with Naukri and Unstop separately', () => {
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: mockPublicSourcesResponse,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Explore More Job Sources')).toBeInTheDocument();
    expect(screen.getByText('Naukri.com')).toBeInTheDocument();
    expect(screen.getByText('Unstop')).toBeInTheDocument();

    const naukriLink = screen.getByRole('link', { name: /Explore on Naukri\.com/i });
    expect(naukriLink).toHaveAttribute('href', 'https://www.naukri.com/');

    const unstopLink = screen.getByRole('link', { name: /Explore on Unstop/i });
    expect(unstopLink).toHaveAttribute('href', 'https://unstop.com/jobs');
  });

  it('renders API error state with retry button', () => {
    const mockRefetch = vi.fn();
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to connect to backend server',
      refetch: mockRefetch,
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Failed to load company registry')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to backend server')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when search finds no matches and resets on click', () => {
    vi.mocked(hooks.usePublicSources).mockReturnValue({
      data: mockPublicSourcesResponse,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByLabelText('Search companies');
    fireEvent.change(searchInput, { target: { value: 'NonExistentCompanyXYZ' } });

    expect(screen.getByText('No companies match your filters')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearBtn);

    expect(screen.queryByText('No companies match your filters')).not.toBeInTheDocument();
    expect(screen.getByText('TCS')).toBeInTheDocument();
  });
});
