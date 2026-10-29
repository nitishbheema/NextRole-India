import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import JobDescriptionRenderer from '../components/JobDescriptionRenderer';

describe('JobDescriptionRenderer Component', () => {
  const thoughtworksFixture = `
    &lt;div class=&quot;description content&quot;&gt;
    &lt;p&gt;We are looking for an &lt;strong&gt;Agentic AI Principal&lt;/strong&gt; to act as a senior technical authority.&lt;/p&gt;
    &lt;/div&gt;
    &lt;h2 id=&quot;job-responsibilities&quot;&gt;Job responsibilities&lt;/h2&gt;
    &lt;div class=&quot;job-responsibilities content&quot;&gt;
    &lt;ul&gt;
    &lt;li&gt;&lt;strong&gt;Agentic AI Advisory:&lt;/strong&gt; Shape enterprise AI strategy and solution complex pursuits.&lt;/li&gt;
    &lt;li&gt;&lt;strong&gt;Design &amp; Build:&lt;/strong&gt; Set architecture direction for multi-agent workflows.&lt;/li&gt;
    &lt;/ul&gt;
    &lt;/div&gt;
    &lt;h2 id=&quot;job-qualifications&quot;&gt;Job qualifications&lt;/h2&gt;
    &lt;div class=&quot;job-qualifications content&quot;&gt;
    &lt;h3 id=&quot;technical-skills&quot;&gt;Technical Skills&lt;/h3&gt;
    &lt;ul&gt;
    &lt;li&gt;Deep expertise in modern software engineering and Python.&lt;/li&gt;
    &lt;li&gt;Recognised experience architecting GenAI and agentic AI systems at scale.&lt;/li&gt;
    &lt;/ul&gt;
    &lt;h3 id=&quot;professional-skills&quot;&gt;Professional Skills&lt;/h3&gt;
    &lt;ul&gt;
    &lt;li&gt;Strong stakeholder management and executive consulting experience.&lt;/li&gt;
    &lt;/ul&gt;
    &lt;/div&gt;
    &lt;h2 id=&quot;about-the-company&quot;&gt;About the company&lt;/h2&gt;
    &lt;p&gt;Thoughtworks is a leading global technology consultancy.&lt;/p&gt;
  `;

  it('renders entity-encoded Thoughtworks HTML without displaying literal tags', () => {
    const { container } = render(<JobDescriptionRenderer description={thoughtworksFixture} />);

    // Literal escaped tags must NOT be present as text
    expect(container.textContent).not.toContain('&lt;div');
    expect(container.textContent).not.toContain('&lt;p&gt;');
    expect(container.textContent).not.toContain('<div');
    expect(container.textContent).not.toContain('<div>');
    expect(container.textContent).not.toContain('<p>');

    // Real headings should be rendered in the DOM
    const h2s = container.querySelectorAll('h2');
    expect(h2s.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole('heading', { level: 2, name: /job responsibilities/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /job qualifications/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /technical skills/i })).toBeInTheDocument();

    // List items should be rendered as real <li> elements
    const lis = container.querySelectorAll('li');
    expect(lis.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText(/Shape enterprise AI strategy and solution complex pursuits/i)).toBeInTheDocument();
  });

  it('unescapes backslash-escaped HTML tags (e.g. \\<div>, \\<p>, \\<h2>, \\<ul>, \\<li>)', () => {
    const backslashFixture = `
      \\<div>
      \\<p>Join our core engineering platform team.\\</p>
      \\<h2>Job responsibilities\\</h2>
      \\<ul>
      \\<li>Architect resilient microservices in Java and Go.\\</li\\>
      \\<li>Conduct peer code reviews and mentor junior developers.\\</li\\>
      \\</ul>
      \\<h2>Job qualifications\\</h2>
      \\<p>Bachelor's degree in Computer Science or related field.\\</p>
      \\</div>
    `;

    const { container } = render(<JobDescriptionRenderer description={backslashFixture} />);

    // Must NOT contain literal \<div>, \<p>, or backslash tags
    expect(container.textContent).not.toContain('\\<');
    expect(container.textContent).not.toContain('\\>');
    expect(container.textContent).not.toContain('<div>');
    expect(container.textContent).not.toContain('<p>');

    // Must have rendered proper heading and lists
    expect(screen.getByRole('heading', { level: 2, name: /job responsibilities/i })).toBeInTheDocument();
    expect(screen.getByText('Architect resilient microservices in Java and Go.')).toBeInTheDocument();
  });

  it('normalizes markdown links in href and escaped target attributes', () => {
    const linkFixture = `
      <p>Visit our career portal: <a href="[https://thoughtworks.com/careers](https://thoughtworks.com/careers)" target="\\_blank">Careers Page</a></p>
    `;

    const { container } = render(<JobDescriptionRenderer description={linkFixture} />);

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link?.getAttribute('href')).toBe('https://thoughtworks.com/careers');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toContain('noopener');
    expect(container.textContent).not.toContain('[https://');
    expect(container.textContent).not.toContain('\\_blank');
  });

  it('handles plain-text descriptions with paragraphs and bullet lists gracefully', () => {
    const plainText = `
      We are hiring a Backend Engineer for Bengaluru.

      Key Responsibilities:
      • Design and implement RESTful APIs
      • Maintain high system uptime and performance
      • Write thorough unit and integration tests

      Requirements:
      • 3+ years of experience with Spring Boot and PostgreSQL
    `;

    const { container } = render(<JobDescriptionRenderer description={plainText} />);

    expect(screen.getByText(/We are hiring a Backend Engineer for Bengaluru/i)).toBeInTheDocument();
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(4);
    expect(screen.getByText('Design and implement RESTful APIs')).toBeInTheDocument();
    expect(screen.getByText('3+ years of experience with Spring Boot and PostgreSQL')).toBeInTheDocument();
  });

  it('safely removes dangerous scripts, styles, and event handlers', () => {
    const malicious = `
      <p>Safe content</p>
      <script>window.pwned = true;</script>
      <img src="invalid-url" onerror="alert('xss')" />
      <a href="javascript:alert('steal')">Malicious Link</a>
    `;

    const { container } = render(<JobDescriptionRenderer description={malicious} />);

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    const maliciousLink = container.querySelector('a[href^="javascript:"]');
    expect(maliciousLink).toBeNull();
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders graceful fallback message when description is empty or null', () => {
    render(<JobDescriptionRenderer description="" />);
    expect(screen.getByText(/No detailed description provided by the employer/i)).toBeInTheDocument();
  });
});
