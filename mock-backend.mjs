// Lightweight local development API server (mirrors the Spring Boot 3 REST API)
// Allows viewing and interacting with the website locally when Java 21 / PostgreSQL is not installed locally.

import http from 'http';
import url from 'url';

const PORT = 8080;

// Dev seed dataset clearly labelled as development/demo data
let seedCompanies = [
  { id: 1, name: 'Thoughtworks', logoUrl: 'https://www.thoughtworks.com/favicon.ico', careersUrl: 'https://www.thoughtworks.com/en-in/careers', activeJobCount: 3 },
  { id: 2, name: 'Gojek', logoUrl: null, careersUrl: 'https://www.gojek.io/careers', activeJobCount: 2 },
  { id: 3, name: 'Freshworks', logoUrl: 'https://www.freshworks.com/favicon.ico', careersUrl: 'https://www.freshworks.com/company/careers/', activeJobCount: 2 },
  { id: 4, name: 'Razorpay', logoUrl: null, careersUrl: 'https://razorpay.com/jobs/', activeJobCount: 1 },
  { id: 5, name: 'PhonePe', logoUrl: null, careersUrl: 'https://www.phonepe.com/careers/', activeJobCount: 1 }
];

let seedJobs = [
  {
    id: 1,
    title: 'Graduate Software Engineer - 2026 Batch',
    companyName: 'Thoughtworks',
    companyLogoUrl: 'https://www.thoughtworks.com/favicon.ico',
    location: 'Bengaluru, Karnataka, India',
    country: 'India',
    jobType: 'GRADUATE_PROGRAMME',
    experienceLevel: 'FRESHER',
    workMode: 'HYBRID',
    applyUrl: 'https://boards.greenhouse.io/thoughtworks/jobs/1',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    description: `About the Role:\nThoughtworks is looking for passionate fresh graduates to join our team as Graduate Software Developers. You will write clean, well-tested code and collaborate with cross-functional agile teams.\n\nKey Responsibilities:\n- Learn and practice TDD (Test Driven Development) and agile software engineering.\n- Build responsive web applications using Java, Python, and React.\n- Participate in design sessions, code reviews, and pair programming.\n\nRequirements:\n- BE/B.Tech/MCA/M.Tech in Computer Science, IT, or related fields.\n- Strong foundation in data structures, algorithms, and object-oriented programming.\n- Enthusiasm for modern software design principles.`,
    sourceUrl: 'https://boards.greenhouse.io/thoughtworks',
    sourceType: 'GREENHOUSE',
    status: 'ACTIVE'
  },
  {
    id: 2,
    title: 'Software Engineering Intern (Summer 2027)',
    companyName: 'Freshworks',
    companyLogoUrl: 'https://www.freshworks.com/favicon.ico',
    location: 'Chennai, Tamil Nadu, India',
    country: 'India',
    jobType: 'INTERNSHIP',
    experienceLevel: 'FRESHER',
    workMode: 'ONSITE',
    applyUrl: 'https://boards.greenhouse.io/freshworks/jobs/2',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    description: `Freshworks is hiring Software Engineering Interns for our Chennai engineering hub.\n\nWhat you'll do:\n- Work with mentors to develop customer-facing features on Freshdesk and Freshsales.\n- Develop scalable APIs using Node.js and Java.\n- Write automated unit and integration tests.\n\nEligibility:\n- Pre-final or final year engineering students.\n- Familiarity with web fundamentals (HTML, CSS, JavaScript, REST APIs).`,
    sourceUrl: 'https://boards.greenhouse.io/freshworks',
    sourceType: 'GREENHOUSE',
    status: 'ACTIVE'
  },
  {
    id: 3,
    title: 'Junior Backend Developer - Python / Go',
    companyName: 'Gojek',
    companyLogoUrl: null,
    location: 'Gurugram, Haryana, India',
    country: 'India',
    jobType: 'FULL_TIME',
    experienceLevel: 'JUNIOR',
    workMode: 'HYBRID',
    applyUrl: 'https://jobs.lever.co/gojek/3',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    description: `As a Junior Backend Engineer at Gojek, you will work on our high-throughput distributed payment and logistics pipelines handling millions of daily transactions across Southeast Asia.\n\nRequirements:\n- 0-2 years of software engineering experience.\n- Proficiency in Python, Go, or Java.\n- Understanding of relational databases (PostgreSQL/MySQL) and message queues (Kafka).`,
    sourceUrl: 'https://jobs.lever.co/gojek',
    sourceType: 'LEVER',
    status: 'ACTIVE'
  },
  {
    id: 4,
    title: 'Senior Full Stack Engineer (React + Spring Boot)',
    companyName: 'Thoughtworks',
    companyLogoUrl: 'https://www.thoughtworks.com/favicon.ico',
    location: 'Pune, Maharashtra, India',
    country: 'India',
    jobType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    workMode: 'REMOTE',
    applyUrl: 'https://boards.greenhouse.io/thoughtworks/jobs/4',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    description: `Looking for Senior Full Stack Engineers with deep expertise in Java 17+, Spring Boot, and modern React/TypeScript architectures.`,
    sourceUrl: 'https://boards.greenhouse.io/thoughtworks',
    sourceType: 'GREENHOUSE',
    status: 'ACTIVE'
  },
  {
    id: 5,
    title: 'SDET / QA Automation Engineer',
    companyName: 'Razorpay',
    companyLogoUrl: null,
    location: 'Bengaluru, Karnataka, India',
    country: 'India',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    workMode: 'HYBRID',
    applyUrl: 'https://razorpay.com/jobs/5',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    description: `Responsible for automating tests across payment gateways, checkout flows, and banking integrations. Experience with Cypress, Playwright, or Selenium required.`,
    sourceUrl: 'https://razorpay.com/jobs',
    sourceType: 'GREENHOUSE',
    status: 'ACTIVE'
  },
  {
    id: 6,
    title: 'Cloud DevOps & SRE Engineer',
    companyName: 'PhonePe',
    companyLogoUrl: null,
    location: 'Bengaluru, Karnataka, India',
    country: 'India',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    workMode: 'ONSITE',
    applyUrl: 'https://phonepe.com/careers/6',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    firstSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    description: `Manage Kubernetes clusters on AWS/bare-metal handling billions of UPI transactions. Terraform, Prometheus, Grafana, and Linux internals proficiency.`,
    sourceUrl: 'https://phonepe.com/careers',
    sourceType: 'LEVER',
    status: 'ACTIVE'
  }
];

let seedSources = [
  { id: 1, companyId: 1, companyName: 'Thoughtworks', sourceType: 'GREENHOUSE', boardIdentifier: 'thoughtworks', enabled: true, lastAttemptedAt: new Date().toISOString(), lastSuccessfulAt: new Date().toISOString(), lastError: null },
  { id: 2, companyId: 2, companyName: 'Gojek', sourceType: 'LEVER', boardIdentifier: 'gojek', enabled: true, lastAttemptedAt: new Date().toISOString(), lastSuccessfulAt: new Date().toISOString(), lastError: null },
  { id: 3, companyId: 3, companyName: 'Freshworks', sourceType: 'GREENHOUSE', boardIdentifier: 'freshworks', enabled: true, lastAttemptedAt: new Date().toISOString(), lastSuccessfulAt: new Date().toISOString(), lastError: null },
  { id: 4, companyId: 4, companyName: 'Razorpay', sourceType: 'GREENHOUSE', boardIdentifier: 'razorpay', enabled: true, lastAttemptedAt: new Date().toISOString(), lastSuccessfulAt: new Date().toISOString(), lastError: null }
];

let seedSyncRuns = [
  { id: 101, sourceId: 1, companyName: 'Thoughtworks', sourceType: 'GREENHOUSE', boardIdentifier: 'thoughtworks', startedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(), status: 'SUCCESS', jobsFound: 14, jobsCreated: 2, jobsUpdated: 12, jobsExpired: 0 },
  { id: 102, sourceId: 2, companyName: 'Gojek', sourceType: 'LEVER', boardIdentifier: 'gojek', startedAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 43).toISOString(), status: 'SUCCESS', jobsFound: 8, jobsCreated: 1, jobsUpdated: 7, jobsExpired: 0 },
  { id: 103, sourceId: 3, companyName: 'Freshworks', sourceType: 'GREENHOUSE', boardIdentifier: 'freshworks', startedAt: new Date(Date.now() - 1000 * 60 * 43).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(), status: 'SUCCESS', jobsFound: 21, jobsCreated: 3, jobsUpdated: 18, jobsExpired: 1 }
];

let currentUser = null;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // Buffer JSON body if POST/PUT
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let jsonBody = {};
    if (body) {
      try { jsonBody = JSON.parse(body); } catch (_) {}
    }

    // Public sources registry
    if (pathname === '/api/sources/public' && method === 'GET') {
      import('fs').then(fs => {
        try {
          const raw = fs.readFileSync('backend/src/main/resources/company-sources.json', 'utf8');
          const registry = JSON.parse(raw);
          const enriched = registry.map(comp => {
            const matched = seedCompanies.find(sc => sc.name.toLowerCase() === comp.name.toLowerCase());
            return {
              ...comp,
              activeJobCount: matched && matched.activeJobCount > 0 ? matched.activeJobCount : null,
              dbCompanyId: matched ? matched.id : null,
              logoUrl: matched ? matched.logoUrl : null,
            };
          });
          return sendJson(200, {
            totalRegisteredCompanies: enriched.length,
            statusBreakdown: {
              ACTIVE_IMPORT: enriched.filter(c => c.integrationStatus === 'ACTIVE_IMPORT').length,
              LINK_ONLY: enriched.filter(c => c.integrationStatus === 'LINK_ONLY').length,
              NEEDS_VERIFICATION: enriched.filter(c => c.integrationStatus === 'NEEDS_VERIFICATION').length
            },
            aggregators: {
              naukri: { name: 'Naukri.com', url: 'https://www.naukri.com/', mode: 'LINK_ONLY' },
              unstop: { name: 'Unstop', url: 'https://unstop.com/', mode: 'LINK_ONLY' }
            },
            companies: enriched
          });
        } catch (err) {
          return sendJson(500, { error: 'Failed to read registry' });
        }
      });
      return;
    }

    // Health
    if (pathname === '/api/health' && method === 'GET') {
      return sendJson(200, { status: 'UP', service: 'NextRole India (Local Dev Mode)', timestamp: new Date().toISOString(), database: 'UP' });
    }

    // Categories
    if (pathname === '/api/job-categories' && method === 'GET') {
      return sendJson(200, [
        { id: 'software-dev', name: 'Software Development', description: 'Java, Python, Full Stack & Mobile', icon: 'Code', queryKeyword: 'Software' },
        { id: 'data-ai', name: 'Data & AI', description: 'Data Science, ML & AI Engineering', icon: 'Cpu', queryKeyword: 'Data' },
        { id: 'qa-testing', name: 'Testing & QA', description: 'Manual, Automation, SDET', icon: 'CheckCircle', queryKeyword: 'QA' },
        { id: 'cybersecurity', name: 'Cybersecurity', description: 'Security Analyst, SOC & Infosec', icon: 'Shield', queryKeyword: 'Security' },
        { id: 'cloud-devops', name: 'Cloud & DevOps', description: 'AWS, Azure, Kubernetes, CI/CD', icon: 'Cloud', queryKeyword: 'DevOps' },
        { id: 'internships', name: 'Internships & Graduate', description: 'Internships & fresh graduate programmes', icon: 'GraduationCap', queryKeyword: 'Intern' }
      ]);
    }

    // Companies
    if (pathname === '/api/companies' && method === 'GET') {
      return sendJson(200, seedCompanies);
    }

    // Jobs Listing
    if (pathname === '/api/jobs' && method === 'GET') {
      let filtered = [...seedJobs];
      const q = parsedUrl.query.q ? parsedUrl.query.q.toLowerCase() : null;
      const comp = parsedUrl.query.company ? Number(parsedUrl.query.company) : null;
      const loc = parsedUrl.query.location ? parsedUrl.query.location.toLowerCase() : null;
      const jobType = parsedUrl.query.jobType;
      const exp = parsedUrl.query.experienceLevel;
      const mode = parsedUrl.query.workMode;

      if (q) {
        filtered = filtered.filter(j => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q) || j.companyName.toLowerCase().includes(q));
      }
      if (comp) {
        filtered = filtered.filter(j => {
          const c = seedCompanies.find(x => x.id === comp);
          return c && j.companyName === c.name;
        });
      }
      if (loc) {
        filtered = filtered.filter(j => j.location.toLowerCase().includes(loc));
      }
      if (jobType) {
        filtered = filtered.filter(j => j.jobType === jobType);
      }
      if (exp) {
        filtered = filtered.filter(j => j.experienceLevel === exp);
      }
      if (mode) {
        filtered = filtered.filter(j => j.workMode === mode);
      }

      const page = parseInt(parsedUrl.query.page || '0', 10);
      const size = parseInt(parsedUrl.query.size || '20', 10);
      const total = filtered.length;
      const content = filtered.slice(page * size, (page + 1) * size);

      return sendJson(200, {
        content,
        page,
        size,
        totalElements: total,
        totalPages: Math.ceil(total / size) || 1,
        hasNext: (page + 1) * size < total,
        hasPrev: page > 0
      });
    }

    // Job Detail
    if (pathname.startsWith('/api/jobs/') && method === 'GET') {
      const id = parseInt(pathname.split('/')[3], 10);
      const job = seedJobs.find(j => j.id === id);
      if (!job) {
        return sendJson(404, { status: 404, message: 'Job not found or no longer active' });
      }
      return sendJson(200, job);
    }

    // Admin Auth
    if (pathname === '/api/admin/auth/login' && method === 'POST') {
      if (jsonBody.username === 'admin' && jsonBody.password === 'changeme') {
        currentUser = { username: 'admin' };
        return sendJson(200, { status: 'SUCCESS', username: 'admin', roles: ['ROLE_ADMIN'] });
      } else {
        return sendJson(401, { error: 'Invalid username or password' });
      }
    }

    if (pathname === '/api/admin/auth/logout' && method === 'POST') {
      currentUser = null;
      return sendJson(200, { status: 'SUCCESS', message: 'Logged out' });
    }

    if (pathname === '/api/admin/auth/me' && method === 'GET') {
      if (currentUser) {
        return sendJson(200, { authenticated: true, username: currentUser.username, roles: ['ROLE_ADMIN'] });
      }
      return sendJson(401, { error: 'Not authenticated' });
    }

    // Admin Stats
    if (pathname === '/api/admin/stats' && method === 'GET') {
      return sendJson(200, {
        totalJobs: seedJobs.length + 3,
        activeJobs: seedJobs.length,
        expiredJobs: 3,
        totalCompanies: seedCompanies.length,
        totalSources: seedSources.length,
        enabledSources: seedSources.filter(s => s.enabled).length,
        syncRunsLast24h: seedSyncRuns.length,
        successfulSyncRunsLast24h: seedSyncRuns.filter(r => r.status === 'SUCCESS').length
      });
    }

    // Admin Sources
    if (pathname === '/api/admin/sources' && method === 'GET') {
      return sendJson(200, seedSources);
    }

    if (pathname === '/api/admin/sources' && method === 'POST') {
      const comp = seedCompanies.find(c => c.id === jsonBody.companyId);
      const newSource = {
        id: seedSources.length + 1,
        companyId: jsonBody.companyId,
        companyName: comp ? comp.name : 'Unknown',
        sourceType: jsonBody.sourceType,
        boardIdentifier: jsonBody.boardIdentifier,
        enabled: true,
        lastAttemptedAt: null,
        lastSuccessfulAt: null,
        lastError: null
      };
      seedSources.push(newSource);
      return sendJson(201, newSource);
    }

    if (pathname.startsWith('/api/admin/sources/') && method === 'DELETE') {
      const id = parseInt(pathname.split('/')[4], 10);
      const src = seedSources.find(s => s.id === id);
      if (src) src.enabled = false;
      return sendJson(200, { message: 'Source disabled' });
    }

    if (pathname.startsWith('/api/admin/sources/') && method === 'PUT') {
      const id = parseInt(pathname.split('/')[4], 10);
      const src = seedSources.find(s => s.id === id);
      if (src && jsonBody.enabled !== undefined) src.enabled = jsonBody.enabled;
      return sendJson(200, src || {});
    }

    if (pathname === '/api/admin/companies' && method === 'POST') {
      const newCompany = {
        id: seedCompanies.length + 1,
        name: jsonBody.name,
        careersUrl: jsonBody.careersUrl,
        logoUrl: jsonBody.logoUrl || null,
        activeJobCount: 0
      };
      seedCompanies.push(newCompany);
      return sendJson(201, newCompany);
    }

    // Admin Sync Runs
    if (pathname === '/api/admin/sync-runs' && method === 'GET') {
      return sendJson(200, seedSyncRuns);
    }

    // Admin Trigger Sync
    if (pathname === '/api/admin/sync/trigger' && method === 'POST') {
      seedSyncRuns.unshift({
        id: Date.now(),
        sourceId: 1,
        companyName: 'Thoughtworks',
        sourceType: 'GREENHOUSE',
        boardIdentifier: 'thoughtworks',
        startedAt: new Date().toISOString(),
        completedAt: new Date(Date.now() + 1500).toISOString(),
        status: 'SUCCESS',
        jobsFound: 14,
        jobsCreated: 0,
        jobsUpdated: 14,
        jobsExpired: 0
      });
      return sendJson(200, { status: 'STARTED', message: 'Synchronization triggered successfully.' });
    }

    // Default 404
    sendJson(404, { error: 'Not found', path: pathname });
  });
});

server.listen(PORT, () => {
  console.log(`[NextRole Local Dev API] Server listening on http://localhost:${PORT}`);
});
