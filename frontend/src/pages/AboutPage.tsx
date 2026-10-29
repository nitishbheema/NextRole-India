import React from 'react';
import { Shield, RefreshCw, ExternalLink, GitBranch, AlertCircle, Compass } from 'lucide-react';
import { siteConfig } from '../config/site';
import { GithubIcon, LinkedinIcon } from '../components/Icons';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <div className="mb-4 flex justify-center">
          <img src="/logo.png" alt="NextRole India" className="h-12 w-auto object-contain" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7f6ef] text-[#087f5b] text-[11px] font-bold tracking-wider uppercase mb-2">
          <Compass className="h-3.5 w-3.5" />
          Mission & Architecture
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#172b25] tracking-tight">
          About NextRole India
        </h1>
        <p className="mt-3 text-xs sm:text-base text-[#64776e] max-w-2xl mx-auto leading-relaxed">
          An automated public job discovery platform engineered for Indian IT freshers, internships, and tech professionals.
        </p>
      </div>

      <div className="space-y-8 text-[#2d4036] leading-relaxed">
        {/* Creator / Built By Section */}
        <section className="bg-gradient-to-br from-[#eaf6ef] to-[#f4fbf7] border border-[#cbe4d4] rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(18,65,48,0.04)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-[11px] font-bold text-[#087f5b] uppercase tracking-wider block mb-1">
                Project Creator & Maintainer
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#172b25]">
                {siteConfig.author.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#5f7469] mt-1 max-w-lg leading-relaxed">
                Full-stack developer building transparent, zero-cost developer tooling and discovery solutions for India's software engineering community.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
              <a
                href={siteConfig.author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#172b25] hover:text-[#087f5b] text-xs font-bold rounded-xl border border-[#dce7e1] shadow-xs hover:border-[#a0d6b6] transition"
              >
                <LinkedinIcon className="h-4 w-4 text-[#087f5b]" />
                Connect on LinkedIn
              </a>
              <a
                href={siteConfig.author.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#172b25] hover:text-[#087f5b] text-xs font-bold rounded-xl border border-[#dce7e1] shadow-xs hover:border-[#a0d6b6] transition"
              >
                <GithubIcon className="h-4 w-4" />
                GitHub Profile
              </a>
              <a
                href={siteConfig.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#087f5b] text-white hover:bg-[#075e45] text-xs font-bold rounded-xl shadow-xs transition"
              >
                <GitBranch className="h-4 w-4" />
                NextRole Repository
              </a>
            </div>
          </div>
        </section>

        {/* Mission & Principles */}
        <section className="bg-white border border-[#e1ebe6] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(18,65,48,0.03)]">
          <h2 className="font-display font-bold text-lg text-[#172b25] mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#087f5b]" />
            Our Core Principles
          </h2>
          <p className="mb-4 text-xs sm:text-sm leading-relaxed text-[#5f7469]">
            Finding genuine, active tech jobs in India is challenging due to expired postings, ghost listings, and unauthorized scrapers. NextRole India is built around three promises:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#44584e]">
            <li><strong>Official Company Application URLs:</strong> Every job redirects directly to the company's verified careers portal (Greenhouse, Lever, Ashby, or corporate career system).</li>
            <li><strong>No Candidate Data Collection:</strong> We never collect resumes, conduct interviews, or ask for applicant financial details.</li>
            <li><strong>Honest Integration Statuses:</strong> We never claim a source is automated unless a verified public machine-readable API feed is actively tested and working.</li>
          </ul>
        </section>

        {/* The 100-Company Registry */}
        <section className="bg-white border border-[#e1ebe6] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(18,65,48,0.03)]">
          <h2 className="font-display font-bold text-lg text-[#172b25] mb-3 flex items-center gap-2">
            <Compass className="h-5 w-5 text-[#087f5b]" />
            100 Target Companies Registry
          </h2>
          <p className="text-xs sm:text-sm text-[#5f7469] mb-4 leading-relaxed">
            NextRole India maintains a version-controlled registry of 100 premier enterprise, product, startup, and deep-tech employers operating in India.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#f7faf8] rounded-xl border border-[#e1ebe6]">
              <span className="font-bold text-[#172b25] block mb-1">1. IT Services & Consulting (25)</span>
              <p className="text-[#64776e]">TCS, Infosys, Wipro, HCLTech, Tech Mahindra, LTIMindtree, Accenture, Capgemini, Deloitte, etc.</p>
            </div>
            <div className="p-3.5 bg-[#f7faf8] rounded-xl border border-[#e1ebe6]">
              <span className="font-bold text-[#172b25] block mb-1">2. Product & Cloud (25)</span>
              <p className="text-[#64776e]">Microsoft, Google, Amazon, Apple, Meta, NVIDIA, Intel, Cisco, Qualcomm, Salesforce, Razorpay, Freshworks, etc.</p>
            </div>
            <div className="p-3.5 bg-[#f7faf8] rounded-xl border border-[#e1ebe6]">
              <span className="font-bold text-[#172b25] block mb-1">3. Startups & SaaS (25)</span>
              <p className="text-[#64776e]">Swiggy, Zomato, PhonePe, CRED, Zepto, Postman, BrowserStack, Zerodha, Zoho, Meesho, etc.</p>
            </div>
            <div className="p-3.5 bg-[#f7faf8] rounded-xl border border-[#e1ebe6]">
              <span className="font-bold text-[#172b25] block mb-1">4. Fintech & DeepTech (25)</span>
              <p className="text-[#64776e]">JPMorgan, Morgan Stanley, Goldman Sachs, Groww, Pine Labs, Paytm, PolicyBazaar, etc.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
