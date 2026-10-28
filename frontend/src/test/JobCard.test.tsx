import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobCard from '../components/JobCard';
import type { Job } from '../lib/types';

const mockJob: Job = {
  id: 1,
  title: 'Senior Java Developer',
  companyName: 'Thoughtworks',
  location: 'Bengaluru, India',
  country: 'India',
  jobType: 'FULL_TIME',
  experienceLevel: 'SENIOR',
  workMode: 'HYBRID',
  applyUrl: 'https://boards.greenhouse.io/thoughtworks/jobs/1',
  publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  lastVerifiedAt: new Date().toISOString(),
};

describe('JobCard Component', () => {
  it('renders job title and company name', () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} />
      </MemoryRouter>
    );

    expect(screen.getByText('Senior Java Developer')).toBeInTheDocument();
    expect(screen.getByText('Thoughtworks')).toBeInTheDocument();
    expect(screen.getByText('Bengaluru, India')).toBeInTheDocument();
  });

  it('renders job type and experience badges', () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} />
      </MemoryRouter>
    );

    expect(screen.getByText('Full Time')).toBeInTheDocument();
    expect(screen.getByText('Senior')).toBeInTheDocument();
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
  });

  it('renders official View Job link with target="_blank"', () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} />
      </MemoryRouter>
    );

    const applyLink = screen.getByRole('link', { name: /view job/i });
    expect(applyLink).toBeInTheDocument();
    expect(applyLink).toHaveAttribute('href', mockJob.applyUrl);
    expect(applyLink).toHaveAttribute('target', '_blank');
    expect(applyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders skeleton loader when loading=true', () => {
    render(
      <MemoryRouter>
        <JobCard loading={true} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Senior Java Developer')).not.toBeInTheDocument();
  });
});
