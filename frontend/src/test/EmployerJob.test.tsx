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
    expect(screen.getByRole('button', { name: /Submit for Verification/i })).toBeInTheDocument();
  });

  it('shows clear inline validation errors when required fields are missing or consent unchecked', async () => {
    render(
      <MemoryRouter>
        <PostJobPage />
      </MemoryRouter>
    );

    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /Submit for Verification/i }));

    expect(await screen.findByText('Company name is required.')).toBeInTheDocument();
    expect(screen.getByText('Company website is required.')).toBeInTheDocument();
    expect(screen.getByText('Recruiter or contact name is required.')).toBeInTheDocument();
    expect(screen.getByText('Recruiter email address is required.')).toBeInTheDocument();
    expect(screen.getByText('Job title is required.')).toBeInTheDocument();
    expect(screen.getByText('Job description & requirements are required.')).toBeInTheDocument();
    expect(screen.getByText('Official candidate application URL is required.')).toBeInTheDocument();
    expect(screen.getByText('You must confirm authorization and accuracy before submitting.')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('blocks disposable email addresses on the frontend', async () => {
    render(
      <MemoryRouter>
        <PostJobPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('recruiter@company.com'), {
      target: { name: 'recruiterEmail', value: 'recruiter@tempmail.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit for Verification/i }));

    expect(await screen.findByText(/Disposable\/temporary email addresses are not permitted/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('permits personal emails (@gmail.com) to submit for manual verification', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        referenceId: 'NR-2026-GMAIL1',
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

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Freshworks, Razorpay, Zepto/i), {
      target: { name: 'companyName', value: 'StartupX' },
    });
    fireEvent.change(screen.getByPlaceholderText('https://company.com'), {
      target: { name: 'companyWebsite', value: 'https://startupx.in' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Priya Sharma/i), {
      target: { name: 'recruiterName', value: 'Ananya Roy' },
    });
    fireEvent.change(screen.getByPlaceholderText('recruiter@company.com'), {
      target: { name: 'recruiterEmail', value: 'ananya.roy@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Graduate QA Engineer/i), {
      target: { name: 'jobTitle', value: 'Frontend Intern' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Outline the responsibilities/i), {
      target: { name: 'jobDescription', value: 'React and Tailwind experience preferred.' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Bengaluru \/ Hyderabad \/ Pune/i), {
      target: { name: 'location', value: 'Bengaluru' },
    });
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/jobs\.company\.com/i), {
      target: { name: 'applyUrl', value: 'https://startupx.in/careers/intern' },
    });

    // Notice should be displayed
    expect(screen.getByText(/Personal email detected/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Submit for Verification/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/employer/jobs',
        expect.objectContaining({
          recruiterEmail: 'ananya.roy@gmail.com',
          companyName: 'StartupX',
        })
      );
      expect(screen.getByText('NR-2026-GMAIL1')).toBeInTheDocument();
    });
  });

  it('successfully submits job with selected application deadline', async () => {
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

    // Set deadline
    const deadlineInput = document.getElementById('deadline') as HTMLInputElement;
    fireEvent.change(deadlineInput, {
      target: { name: 'deadline', value: '2026-11-30' },
    });

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Submit for Verification/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/employer/jobs',
        expect.objectContaining({
          deadline: '2026-11-30T23:59:59',
        })
      );
      expect(screen.getByText('Job Posting Submitted for Verification')).toBeInTheDocument();
      expect(screen.getByText('NR-2026-TEST01')).toBeInTheDocument();
    });
  });

  it('maps backend 400 validation field errors to inline errors', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          status: 400,
          message: 'Validation failed',
          errors: {
            applyUrl: 'Application URL must point to verified domain or ATS',
            companyWebsite: 'Company website could not be reached',
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <PostJobPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Freshworks, Razorpay, Zepto/i), {
      target: { name: 'companyName', value: 'Acme Corp' },
    });
    fireEvent.change(screen.getByPlaceholderText('https://company.com'), {
      target: { name: 'companyWebsite', value: 'https://acme.org' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Priya Sharma/i), {
      target: { name: 'recruiterName', value: 'John Smith' },
    });
    fireEvent.change(screen.getByPlaceholderText('recruiter@company.com'), {
      target: { name: 'recruiterEmail', value: 'john@acme.org' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Graduate QA Engineer/i), {
      target: { name: 'jobTitle', value: 'DevOps Engineer' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Outline the responsibilities/i), {
      target: { name: 'jobDescription', value: 'Kubernetes, Terraform, AWS.' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Bengaluru \/ Hyderabad \/ Pune/i), {
      target: { name: 'location', value: 'Remote' },
    });
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/jobs\.company\.com/i), {
      target: { name: 'applyUrl', value: 'https://suspicious-link.biz/apply' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: /Submit for Verification/i }));

    expect(await screen.findByText('Application URL must point to verified domain or ATS')).toBeInTheDocument();
    expect(screen.getByText('Company website could not be reached')).toBeInTheDocument();
  });

  it('handles server 500 errors and network failures gracefully and restores the submit button', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          message: 'Database connection failed',
        },
      },
    });

    render(
      <MemoryRouter>
        <PostJobPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Freshworks, Razorpay, Zepto/i), {
      target: { name: 'companyName', value: 'Test Co' },
    });
    fireEvent.change(screen.getByPlaceholderText('https://company.com'), {
      target: { name: 'companyWebsite', value: 'https://test.co' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Priya Sharma/i), {
      target: { name: 'recruiterName', value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText('recruiter@company.com'), {
      target: { name: 'recruiterEmail', value: 'jane@test.co' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Graduate QA Engineer/i), {
      target: { name: 'jobTitle', value: 'Engineer' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Outline the responsibilities/i), {
      target: { name: 'jobDescription', value: 'Engineering responsibilities' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Bengaluru \/ Hyderabad \/ Pune/i), {
      target: { name: 'location', value: 'Bengaluru' },
    });
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/jobs\.company\.com/i), {
      target: { name: 'applyUrl', value: 'https://test.co/apply' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    const submitBtn = screen.getByRole('button', { name: /Submit for Verification/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/The server encountered an error while verifying this submission/i)).toBeInTheDocument();
    // Button is restored and enabled
    expect(submitBtn).not.toBeDisabled();
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
