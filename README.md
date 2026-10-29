# NextRole India 🚀

> **Automated public job discovery platform for IT jobs, internships, graduate programmes, and fresher recruitment across India.**

Built and maintained by **[Bheema Nitish Guru Datha](https://www.linkedin.com/in/nitishbheema/)**  
GitHub: [@nitishbheema](https://github.com/nitishbheema/) • Repository: [nitishbheema/NextRole-India](https://github.com/nitishbheema/NextRole-India.git)

---

## 1. Overview & Architecture

NextRole India automatically collects, verifies, and surfaces technology openings directly from official company career pages and verified Applicant Tracking Systems (Greenhouse, Lever, and Ashby).

```
┌─────────────────────────────────────────────────────────────┐
│                    Users / Job Seekers                       │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│           Render Static Site (frontend/)                     │
│           React 19 + Vite + TypeScript + Tailwind CSS        │
│           SPA served globally from CDN                      │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API (CORS restricted)
┌───────────────────────────▼─────────────────────────────────┐
│           Render Web Service (backend/)                      │
│           Spring Boot 3.3.x + Java 21 + Docker              │
│           Public: GET /api/jobs, /api/companies, /api/sources│
│           Protected: /api/admin/** (HttpOnly session auth)   │
└───────────────────────────┬─────────────────────────────────┘
                            │ JDBC + SSL
┌───────────────────────────▼─────────────────────────────────┐
│           Neon PostgreSQL (Free Tier)                        │
│           Flyway migrations, connection pool (max 3)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           GitHub Actions (Scheduled Sync Worker)             │
│           Runs every 6h: 00:17, 06:17, 12:17, 18:17 UTC    │
│           java -jar app.jar --sync                           │
│           Direct Neon connection (no dependency on Render)   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS (Public ATS APIs)
┌───────────────────────────▼─────────────────────────────────┐
│  Greenhouse API     │   Lever API     │   Ashby GraphQL     │
│  boards-api.g.io    │  api.lever.co   │  jobs.ashbyhq.com   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 100-Company Target Registry

We track a curated directory of **100 benchmark employers in India** across 4 sectors:
1. **Indian IT Services & Consulting (25):** TCS, Infosys, Wipro, HCLTech, Tech Mahindra, LTIMindtree, Accenture, Capgemini, Deloitte, etc.
2. **Product, Cloud & Big Tech (25):** Microsoft, Google, Amazon, Apple, Meta, NVIDIA, Intel, Cisco, Qualcomm, Razorpay, Freshworks, etc.
3. **Indian Startups, SaaS & FinTech (25):** Flipkart, Meesho, Swiggy, Groww, CRED, BrowserStack, Chargebee, Hasura, Dream11, Ather Energy, etc.
4. **Engineering, Hardware, Analytics & Banking Tech (25):** Siemens, Bosch, Honeywell, Samsung, Sony, Arm, Micron, JPMorgan Chase, Goldman Sachs, Visa, etc.

Full registry file: [`backend/src/main/resources/company-sources.json`](file:///d:/Projects%20or%20Internships/JOB%20PORTAL/backend/src/main/resources/company-sources.json)  
Comprehensive breakdown: [`docs/company-source-registry.md`](file:///d:/Projects%20or%20Internships/JOB%20PORTAL/docs/company-source-registry.md)

---

## 3. Special Aggregators Policy (Naukri & Unstop)

- **Naukri.com (`LINK_ONLY`):** In strict accordance with our terms of service and anti-scraping policy, we do not bypass CAPTCHAs, bot defenses, or harvest private session cookies. Users can click direct links with URL-encoded search terms to search on Naukri's official portal.
- **Unstop (`LINK_ONLY`):** Dedicated exploration for student hackathons, coding challenges, and internships.
- **Visual Separation:** Aggregators are surfaced separately from verified company-direct listings so candidates always know the origin.

---

## 4. Job Lifecycle & Safety Rules

- `ACTIVE`: New job discovered during complete successful source sync.
- `NEEDS_RECHECK`: When an active job disappears from a complete fetch, `missing_from_source_count` increments to 1.
- `EXPIRED`: Only marked after **two consecutive complete successful syncs** confirm disappearance, or if the source explicitly marks it closed.
- **Failure Isolation:** Timeouts, HTTP 5xx, or provider downtime never cause existing jobs to expire.

---

## 5. Quick Start (Local Run)

### Prerequisites
- Node.js 18+ & npm
- Java 21 & Maven (or use `./mvnw`)

### Running Frontend
```bash
cd frontend
npm ci
npm run dev        # http://localhost:5173
npm test           # Vitest unit test suite (8/8 passed)
npm run build      # Verifies production build
```

### Running Backend
```bash
cd backend
# Development profile (PostgreSQL or local DB):
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Running One-Shot Sync Locally
```bash
cd backend
java -jar target/nextrole-backend-1.0.0-SNAPSHOT.jar --sync
```

---

## 6. Deployment to Render & Neon (₹0 Budget)

Refer to [`docs/free-tier-limitations.md`](file:///d:/Projects%20or%20Internships/JOB%20PORTAL/docs/free-tier-limitations.md) for details on sleep behavior and quotas.

### Step 1: Neon Database
1. Create a free PostgreSQL database on [neon.tech](https://neon.tech) in Singapore (`ap-southeast-1`).
2. Copy the JDBC connection string (must have `?sslmode=require`).

### Step 2: Render Backend Web Service
1. Create a new Web Service from this repo with root directory `backend`.
2. Runtime: `Docker`.
3. Set environment variables:
   - `DATABASE_URL`: Your Neon JDBC string
   - `DATABASE_USERNAME`: Database user
   - `DATABASE_PASSWORD`: Database password
   - `CORS_ALLOWED_ORIGINS`: Your Render static site URL (no trailing slash)
   - `ADMIN_USERNAME`: Administrator username
   - `ADMIN_PASSWORD`: Strong password

### Step 3: Render Static Site (Frontend) & SPA Rewrite Rules
NextRole India provides a root `render.yaml` Blueprint that automatically provisions both the backend Docker Web Service and frontend Static Site with SPA fallback routing.

If configuring manually via the **Render Dashboard**:
1. Create a **Static Site** from this repo with:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
2. Set Environment Variable:
   - `VITE_API_BASE_URL`: Your backend Render URL (e.g., `https://nextrole-backend.onrender.com`).
3. **Crucial for SPA Page Refresh (Prevents 404s)**:
   - Go to your Static Site service in the Render Dashboard.
   - Click on **Redirects/Rewrites** in the left sidebar menu.
   - Click **Add Rule** and enter:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite` *(Do not use `Redirect`)*
   - Save changes. This ensures direct links and page refreshes on `/jobs`, `/jobs/:id`, `/companies`, etc., correctly serve the React SPA index instead of returning `Not Found`.
   *(Note: Render Static Sites do not read Netlify `_redirects` files; the rule must be configured either via `render.yaml` Blueprint or in the Render Dashboard).*

### Step 4: GitHub Actions Secrets for Scheduled Sync
Set these repository secrets in GitHub (`Settings -> Secrets and variables -> Actions`):
- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`

The workflow in `.github/workflows/sync-jobs.yml` will automatically run every 6 hours and update your Neon database.

---

## 7. Git Push Instructions

To push this codebase to your GitHub repository:

```bash
git add .
git commit -m "feat: complete NextRole India MVP with 100-company registry, ATS adapters, and sync worker"
git branch -M main
git push -u origin main
```

---

*NextRole India is an independent project by [Bheema Nitish Guru Datha](https://www.linkedin.com/in/nitishbheema/). Not affiliated with any company or aggregator listed.*
