import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobsPage from '../pages/JobsPage';
import * as hooks from '../lib/hooks';

vi.mock('../lib/hooks', async () => {
  const actual = await vi.importActual('../lib/hooks');
  return {
    ...actual,
    useJobs: vi.fn(),
  };
});

describe('JobsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state with skeleton cards', () => {
    vi.mocked(hooks.useJobs).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <JobsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Discover Opportunities')).toBeInTheDocument();
  });

  it('renders job cards when jobs are loaded', () => {
    vi.mocked(hooks.useJobs).mockReturnValue({
      data: {
        content: [
          {
            id: 10,
            title: 'React Frontend Engineer',
            companyName: 'Freshworks',
            location: 'Chennai, India',
            applyUrl: 'https://freshworks.com/job/10',
            jobType: 'FULL_TIME',
            experienceLevel: 'JUNIOR',
            workMode: 'ONSITE',
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <JobsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('React Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Freshworks')).toBeInTheDocument();
  });

  it('renders empty state when no jobs are returned', () => {
    vi.mocked(hooks.useJobs).mockReturnValue({
      data: {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <JobsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('No jobs yet')).toBeInTheDocument();
  });

  it('renders error state on API failure', () => {
    vi.mocked(hooks.useJobs).mockReturnValue({
      data: null,
      loading: false,
      error: 'Network Error',
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <JobsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Could not load jobs')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});
