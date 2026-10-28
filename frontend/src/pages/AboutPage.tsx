import { Shield, RefreshCw, ExternalLink, GitBranch, AlertCircle, Compass } from 'lucide-react';
import { siteConfig } from '../config/site';
import { GithubIcon, LinkedinIcon } from '../components/Icons';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          About NextRole India
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          An automated public job discovery platform engineered for Indian IT freshers, internships, and tech professionals.
        </p>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        {/* Creator / Built By Section */}
        <section className="bg-gradient-to-r from-brand-50 to-teal-50 border border-brand-100 rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider block mb-1">
                Project Creator & Maintainer
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                {siteConfig.author.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1 max-w-lg">
                Full-stack developer building transparent, zero-cost developer tooling and discovery solutions for India's software engineering community.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
              <a
                href={siteConfig.author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-gray-800 hover:text-brand-600 text-xs font-semibold rounded-lg border border-gray-200 shadow-xs hover:border-brand-200 transition"
              >
                <LinkedinIcon className="h-4 w-4 text-brand-600" />
                Connect on LinkedIn
              </a>
              <a
                href={siteConfig.author.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-gray-800 hover:text-gray-900 text-xs font-semibold rounded-lg border border-gray-200 shadow-xs hover:border-gray-400 transition"
              >
                <GithubIcon className="h-4 w-4 text-gray-800" />
                GitHub Profile
              </a>
              <a
                href={siteConfig.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 text-white hover:bg-brand-700 text-xs font-semibold rounded-lg shadow-xs transition"
              >
                <GitBranch className="h-4 w-4" />
                NextRole Repository
              </a>
            </div>
          </div>
        </section>

        {/* Mission & Principles */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" />
            Our Core Principles
          </h2>
          <p className="mb-4 text-sm leading-relaxed">
            Finding genuine, active tech jobs in India is frustrating. Portals are often cluttered with expired postings, ghost jobs, placement spam, or unauthorized scrapers.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li><strong>Official Company Application URLs:</strong> Every job redirects directly to the company's verified careers portal (Greenhouse, Lever, Ashby, or corporate career system).</li>
            <li><strong>No Candidate Data Collection:</strong> We never collect resumes, conduct interviews, or ask for applicant financial details.</li>
            <li><strong>Honest Integration Statuses:</strong> We never claim a source is automated unless a verified public machine-readable API feed is actively tested and working.</li>
          </ul>
        </section>

        {/* The 100-Company Registry */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Compass className="h-5 w-5 text-brand-600" />
            100 Target Companies Registry
          </h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            NextRole India maintains a version-controlled registry of 100 premier enterprise, product, startup, and deep-tech employers operating in India.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="font-semibold text-gray-900 block mb-1">1. IT Services & Consulting (25)</span>
              <p className="text-gray-500">TCS, Infosys, Wipro, HCLTech, Tech Mahindra, LTIMindtree, Accenture, Capgemini, Deloitte, etc.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="font-semibold text-gray-900 block mb-1">2. Product & Cloud (25)</span>
              <p className="text-gray-500">Microsoft, Google, Amazon, Apple, Meta, NVIDIA, Intel, Cisco, Qualcomm, Salesforce, Razorpay, Freshworks, etc.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="font-semibold text-gray-900 block mb-1">3. Startups & SaaS (25)</span>
              <p className="text-gray-500">Flipkart, Meesho, Swiggy, Groww, CRED, BrowserStack, Chargebee, Hasura, Dream11, Ather Energy, etc.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="font-semibold text-gray-900 block mb-1">4. Engineering & FinTech (25)</span>
              <p className="text-gray-500">Siemens, Bosch, Honeywell, Samsung, Sony, Arm, Micron, Wells Fargo, JPMorgan Chase, Goldman Sachs, Visa, etc.</p>
            </div>
          </div>
        </section>

        {/* Aggregators Policy: Naukri & Unstop */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Special Handling: Naukri & Unstop
          </h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            In compliance with our anti-scraping policy and provider terms of service, large portals that do not offer open public machine-readable APIs are classified as <strong>LINK_ONLY</strong>. We never bypass CAPTCHAs, bot defenses, or reuse private cookies.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-amber-900 text-sm">Naukri.com</span>
                <span className="px-2 py-0.5 rounded bg-amber-200/60 text-amber-800 font-semibold text-[10px]">LINK_ONLY</span>
              </div>
              <p className="text-amber-800 leading-relaxed mb-3">
                Broad Indian lateral recruitment aggregator. Visitors can search directly on Naukri with keyword parameters safely without intermediary data scraping.
              </p>
              <a
                href={siteConfig.aggregators.naukri.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-900 font-semibold hover:underline"
              >
                Search on Naukri.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-lg text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-teal-900 text-sm">Unstop</span>
                <span className="px-2 py-0.5 rounded bg-teal-200/60 text-teal-800 font-semibold text-[10px]">LINK_ONLY</span>
              </div>
              <p className="text-teal-800 leading-relaxed mb-3">
                Early-career hiring competitions, college hackathons, fresher recruitment, and student internships across India.
              </p>
              <a
                href={siteConfig.aggregators.unstop.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-teal-900 font-semibold hover:underline"
              >
                Explore on Unstop
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>

        {/* Expiration Rules */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-teal-600" />
            Automated Lifecycle & Expiration Logic
          </h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Our background worker runs automatically every 6 hours via GitHub Actions and synchronizes listings without keeping our local machine powered on:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li><strong>ACTIVE:</strong> Newly discovered jobs inserted upon successful source fetch.</li>
              <li><strong>NEEDS_RECHECK:</strong> If a previously active job is missing from a complete successful fetch, its missing counter increments to 1.</li>
              <li><strong>EXPIRED:</strong> If confirmed missing across <strong>two consecutive full successful runs</strong>, or if the ATS signals closure, the listing is expired and hidden from active search.</li>
              <li><strong>Fault-Tolerant:</strong> Temporary network errors or provider rate limits never trigger premature expiration.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
