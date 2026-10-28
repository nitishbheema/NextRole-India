# Free-Tier Architecture & Operational Limitations

NextRole India operates on an initial budget of **₹0 per month** using public and community free tiers. This document details architectural trade-offs, service constraints, and expectations for job seekers and system administrators.

---

## 1. Neon PostgreSQL (Free Tier)

- **Storage Quota:** Up to 0.5 GB. At ~2 KB per normalized active job, this accommodates ~50,000 active records and audit logs before archiving is needed.
- **Compute Unit:** 1 shared Compute Unit (CU).
- **Auto-Suspend Behavior:** Neon compute engines auto-suspend after 5 minutes of total inactivity.
- **Cold Wake Latency:** The initial connection after an idle period incurs a 1.5–3.5 second compute resume latency. Hikari connection pool timeouts are configured with conservative connection pooling (`maximum-pool-size: 3`) to prevent exhaustion.
- **Connection String:** Requires `sslmode=require`.

---

## 2. Render Web Service (Free Tier Backend)

- **Compute Capacity:** 0.1 CPU core, 512 MB RAM.
- **Inactivity Spin-Down:** If no incoming HTTP traffic arrives for 15 consecutive minutes, Render spins down the container.
- **Cold Start Duration:** The first visitor to visit after a spin-down will experience a **30 to 50 second cold start** while Docker spins up the Spring Boot JVM. Subsequent requests respond in <100ms.
- **Isolation from Scheduled Sync:** The automated synchronization worker does **NOT** run through the Render Web Service. It runs as an independent GitHub Actions runner and connects straight to Neon, ensuring sync never fails because Render is asleep.

---

## 3. Render Static Site (Free Tier Frontend)

- **CDN Distribution:** Hosted on Render's global edge network.
- **Bandwidth:** 100 GB/month included.
- **Performance:** Instant delivery with zero cold start.
- **Client Fallback:** If the backend is experiencing a cold start, the React frontend displays an animated skeleton and informative indicator rather than crashing.

---

## 4. GitHub Actions (Scheduled Sync Worker)

- **Execution Cadence:** Scheduled for 4 runs daily: `17 0,6,12,18 * * *` (00:17, 06:17, 12:17, 18:17 UTC / ~5:47 AM, 11:47 AM, 5:47 PM, 11:47 PM IST).
- **Queue Delays:** GitHub Actions schedules run on a shared public queue and may experience latency of several minutes during peak GitHub load. The 6-hour interval is a target rather than a real-time SLA.
- **Monthly Usage:** Each sync job takes ~1.5–2 minutes. 4 runs/day × 30 days = 120 runs = ~240 minutes/month out of GitHub's 2,000 free minutes for public repositories (~12% quota utilization).
- **Process Model:** One-shot worker via `java -jar app.jar --sync`. It terminates immediately upon completion and never stays running as a daemon.

---

## 5. Scope of Data Ingestion (What is vs. is NOT Imported)

| Capability | In Scope | Out of Scope / Unsupported |
|------------|----------|----------------------------|
| **Supported ATS** | Greenhouse (`boards-api.greenhouse.io`), Lever (`api.lever.co`), Ashby (`jobs.ashbyhq.com`) | Unofficial scrapers, unauthorized internal APIs. |
| **Aggregators** | Direct `LINK_ONLY` navigation with query parameters for Naukri and Unstop | Scraping, bypassing CAPTCHAs, automated session cookie replay. |
| **Data Integrity** | Explicitly published titles, verified dates, official apply URLs | Inferred salary ranges, speculative experience levels, synthetic listings. |
| **Coverage** | 100 curated benchmark Indian tech companies | Complete coverage of every firm in India. |
