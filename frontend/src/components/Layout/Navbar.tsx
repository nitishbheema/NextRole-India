import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Bookmark, PlusCircle, Sparkles } from 'lucide-react';
import { getSavedJobIds } from '../../lib/savedJobs';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      setSavedCount(getSavedJobIds().length);
    };
    updateCount();
    window.addEventListener('savedJobsChanged', updateCount);
    return () => window.removeEventListener('savedJobsChanged', updateCount);
  }, []);

  const navLinks = [
    { to: '/jobs', label: 'Explore Jobs' },
    { to: '/companies', label: 'Companies' },
    { to: '/submission-status', label: 'Track Submission' },
    { to: '/about', label: 'About' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#073f32] text-[#eaf6f0] text-[11px] font-medium tracking-wide py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#d8f26a] shrink-0" />
        <span>Verified Indian Tech Opportunities · Apply Directly on Official Portals</span>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e7ede9] transition-all">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.01]" aria-label="NextRole India Home">
              <img
                src="/logo.png"
                alt="NextRole India"
                className="h-[34px] sm:h-[38px] w-auto max-w-[210px] object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7 h-full ml-10 mr-auto" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative h-full flex items-center text-[13px] font-semibold transition-colors ${
                      isActive
                        ? 'text-[#087f5b] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#087f5b] after:rounded-t-md'
                        : 'text-[#62756d] hover:text-[#087f5b]'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/jobs?saved=true"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#50625a] hover:bg-[#eaf5ee] hover:text-[#087f5b] transition-colors"
                title="View your saved jobs"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved</span>
                {savedCount > 0 && (
                  <span className="bg-[#e8f4ed] text-[#087f5b] px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    {savedCount}
                  </span>
                )}
              </Link>

              <Link
                to="/post-job"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#087f5b] hover:bg-[#075e45] text-white rounded-lg text-[13px] font-bold shadow-[0_4px_12px_rgba(8,127,91,0.18)] hover:shadow-md transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Post a Job
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-[#556961] hover:bg-[#f1f6f3] focus:outline-none"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[#edf2ef] px-4 py-4 space-y-1 shadow-lg">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#e7f6ef] text-[#087f5b]'
                      : 'text-[#62756d] hover:bg-[#f4f8f5] hover:text-[#172b25]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/jobs?saved=true"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-[#62756d] hover:bg-[#f4f8f5]"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#087f5b]" />
                Saved Jobs
              </span>
              {savedCount > 0 && (
                <span className="bg-[#e8f4ed] text-[#087f5b] px-2 py-0.5 rounded-full text-xs font-bold">
                  {savedCount}
                </span>
              )}
            </Link>

            <div className="pt-2">
              <Link
                to="/post-job"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#087f5b] text-white font-bold rounded-lg text-sm shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Post a Job
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
