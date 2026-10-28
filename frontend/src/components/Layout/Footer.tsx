import { Link } from 'react-router-dom';
import { Rocket, ExternalLink, GitBranch } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { GithubIcon, LinkedinIcon } from '../Icons';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Rocket className="h-5 w-5 text-brand-500" aria-hidden="true" />
              {siteConfig.name}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Automated public job discovery platform for Indian IT freshers, internships, and tech professionals.
            </p>
            <div className="text-xs text-gray-400">
              <span className="font-semibold text-gray-300">Target Audience:</span> India-focused Software Engineering, Java, Python, QA, Cloud, and Data roles.
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  All Opportunities
                </Link>
              </li>
              <li>
                <Link to="/jobs?experienceLevel=FRESHER" className="hover:text-white transition-colors">
                  Fresher Roles
                </Link>
              </li>
              <li>
                <Link to="/jobs?jobType=INTERNSHIP" className="hover:text-white transition-colors">
                  Internships & Graduate
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-white transition-colors">
                  100 Tracked Companies
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About NextRole
                </Link>
              </li>
            </ul>
          </div>

          {/* Aggregators (Link-Only) */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Discovery Portals
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={siteConfig.aggregators.naukri.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Explore on Naukri.com
                  <ExternalLink className="h-3 w-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.aggregators.unstop.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Explore on Unstop
                  <ExternalLink className="h-3 w-3 text-gray-500" />
                </a>
              </li>
            </ul>
            <p className="mt-3 text-[11px] text-gray-500 leading-tight">
              Direct links provided for independent searching. NextRole India queries official ATS feeds without scraping.
            </p>
          </div>

          {/* Built by & Project Details */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Project & Creator
            </h3>
            <div className="bg-gray-800/80 p-3.5 rounded-lg border border-gray-700/60 text-xs">
              <p className="text-gray-400 text-[11px] mb-1">Built by</p>
              <p className="font-semibold text-white text-sm mb-2.5">
                {siteConfig.author.name}
              </p>
              <div className="flex flex-col gap-1.5 text-xs">
                <a
                  href={siteConfig.author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <GithubIcon className="h-3.5 w-3.5 text-brand-400" />
                  GitHub Profile
                </a>
                <a
                  href={siteConfig.author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <LinkedinIcon className="h-3.5 w-3.5 text-brand-400" />
                  LinkedIn Profile
                </a>
                <a
                  href={siteConfig.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <GitBranch className="h-3.5 w-3.5 text-brand-400" />
                  Source Repository
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>&copy; {year} {siteConfig.name}. Designed & Built for Indian tech seekers 🇮🇳</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-gray-400 transition">About & Disclaimer</Link>
            <span className="text-gray-700">|</span>
            <Link to="/admin/login" className="hover:text-gray-400 transition">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
