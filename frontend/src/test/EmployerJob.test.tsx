import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PostJobPage from '../pages/PostJobPage';
import SubmissionStatusPage from '../pages/SubmissionStatusPage';
import api from '../lib/api';
import * as hooks from '../lib/hooks';

vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('../lib/hooks', async () => {
  const actual = await vi.importActual('../lib/hooks');
  return {
    ...actual,
    useSubmissionStatus: vi.fn(),
  };
});

describe('Employer Job Submission & Status System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Post a Job form with all required fields and consent', () => {
    render(
      <MemoryRouter>
        <PostJobPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Post an Opportunity on NextRole India')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Freshworks, Razorpay, Zepto/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('recruiter@company.com')).toBeInTheDocument();
    expect(screen.getByText(/Submit for Verification/i)).toBeInTheDocument();
  });

  it('shows confirmation message and unique Reference ID after submission', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        referenceId: 'NR-2026-TEST01',
        status: 'PENDING_VERIFICATION',
        message: 'Your job posting has been submitted and is under verification.',
        submittedAt: '2026-10-29T10:00:00Z',
      },
    });

    render(
      <MemoryRouter>
        <PostJobPage />
      </MemoryRouter>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Freshworks, Razorpay, Zepto/i), {
      target: { name: 'companyName', value: 'PhonePe' },
    });
    fireEvent.change(screen.getByPlaceholderText('https://company.com'), {
      target: { name: 'companyWebsite', value: 'https://phonepe.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Priya Sharma/i), {
      target: { name: 'recruiterName', value: 'Priya Sharma' },
    });
    fireEvent.change(screen.getByPlaceholderText('recruiter@company.com'), {
      target: { name: 'recruiterEmail', value: 'priya@phonepe.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Graduate QA Engineer/i), {
      target: { name: 'jobTitle', value: 'Backend Developer' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Outline the responsibilities/i), {
      target: { name: 'jobDescription', value: 'Building scalable microservices in Go and Java.' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Bengaluru \/ Hyderabad \/ Pune/i), {
      target: { name: 'location', value: 'Bengaluru' },
    });
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/jobs\.company\.com/i), {
      target: { name: 'applyUrl', value: 'https://phonepe.com/careers/backend-dev' },
    });

    // Check consent
    fireEvent.click(screen.getByRole('checkbox'));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit for Verification/i }));

    await waitFor(() => {
      expect(screen.getByText('Job Posting Submitted for Verification')).toBeInTheDocument();
      expect(screen.getByText('NR-2026-TEST01')).toBeInTheDocument();
      expect(screen.getByText(/Your job posting has been submitted and is under verification/i)).toBeInTheDocument();
    });
  });

  it('renders Submission Status Page with verification badge and details', () => {
    vi.mocked(hooks.useSubmissionStatus).mockReturnValue({
      data: {
        referenceId: 'NR-2026-TEST01',
        companyName: 'Groww',
        jobTitle: 'Frontend Engineer',
        status: 'UNDER_REVIEW',
        submittedAt: '2026-10-29T08:00:00Z',
        updatedAt: '2026-10-29T09:00:00Z',
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/submission-status/NR-2026-TEST01']}>
        <Routes>
          <Route path="/submission-status/:ref" element={<SubmissionStatusPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Track Employer Submission Status')).toBeInTheDocument();
    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Groww')).toBeInTheDocument();
    expect(screen.getByText('Under Verification by Review Team')).toBeInTheDocument();
  });
});
