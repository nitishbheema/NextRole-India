import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, GitBranch, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { GithubIcon, LinkedinIcon } from '../Icons';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#072d24] text-[#cfded7] border-t border-[#0d4739] mt-20">
      <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90" aria-label="NextRole India Home">
              <img
                src="/logo-white.png"
                alt="NextRole India"
                className="h-[34px] w-auto max-w-[200px] object-contain"
              />
            </Link>
            <p className="text-xs text-[#a3b8af] leading-relaxed">
              Automated public job discovery platform for Indian IT freshers, internships, and tech professionals. Apply directly on official employer career pages.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-[#b8cfc4]">
              <ShieldCheck className="w-4 h-4 text-[#d8f26a] shrink-0" />
              <span>100% Free · No Intermediary Fees</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold text-[#e8f6ef] uppercase tracking-wider mb-4">
              Explore Roles
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  All Opportunities
                </Link>
              </li>
              <li>
                <Link to="/jobs?experienceLevel=FRESHER" className="hover:text-white transition-colors">
                  Fresher & Trainee Roles
                </Link>
              </li>
              <li>
                <Link to="/jobs?jobType=INTERNSHIP" className="hover:text-white transition-colors">
                  Internships & Co-ops
                </Link>
              </li>
              <li>
                <Link to="/jobs?workMode=REMOTE" className="hover:text-white transition-colors">
                  Remote Tech Positions
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-white transition-colors">
                  100 Tracked Companies
                </Link>
              </li>
            </ul>
          </div>

          {/* External Portals Notice */}
          <div>
            <h3 className="text-xs font-bold text-[#e8f6ef] uppercase tracking-wider mb-4">
              External Portals
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href={siteConfig.aggregators.naukri.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5 text-[#b2c8be]"
                >
                  Explore on Naukri.com
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.aggregators.unstop.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5 text-[#b2c8be]"
                >
                  Explore on Unstop
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              </li>
            </ul>
            <p className="mt-3 text-[11px] text-[#8aa398] leading-relaxed">
              Official ATS feeds are queried directly without unauthorized scraping. External platform links are provided for manual exploration.
            </p>
          </div>

          {/* Creator & Project */}
          <div>
            <h3 className="text-xs font-bold text-[#e8f6ef] uppercase tracking-wider mb-4">
              Project & Creator
            </h3>
            <div className="bg-[#0b382d] p-4 rounded-xl border border-[#144d3f] text-xs">
              <p className="text-[#8aa398] text-[11px] mb-0.5">Designed & Built by</p>
              <p className="font-bold text-white text-[13px] mb-3">
                {siteConfig.author.name}
              </p>
              <div className="flex flex-col gap-2 text-xs">
                <a
                  href={siteConfig.author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#b8cfc4] hover:text-[#d8f26a] transition-colors"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  GitHub Profile
                </a>
                <a
                  href={siteConfig.author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#b8cfc4] hover:text-[#d8f26a] transition-colors"
                >
                  <LinkedinIcon className="h-3.5 w-3.5" />
                  LinkedIn Profile
                </a>
                <a
                  href={siteConfig.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#b8cfc4] hover:text-[#d8f26a] transition-colors"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  Repository & Source
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#114537] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#8aa398]">
          <p>&copy; {year} {siteConfig.name}. Handcrafted for Indian tech talent 🇮🇳</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-white transition">About & Guidelines</Link>
            <span className="text-[#195243]">·</span>
            <Link to="/submission-status" className="hover:text-white transition">Submission Status</Link>
            <span className="text-[#195243]">·</span>
            <Link to="/admin/login" className="hover:text-white transition">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
