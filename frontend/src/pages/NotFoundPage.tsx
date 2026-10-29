import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-[#eaf6ef] text-[#087f5b] flex items-center justify-center font-display font-extrabold text-2xl mb-4 border border-[#cbe4d4]">
        404
      </div>
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#172b25] mb-2 tracking-tight">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-[#64776e] max-w-sm mb-6 leading-relaxed">
        The opportunity or page you are looking for does not exist or may have been updated.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#087f5b] text-white rounded-xl text-xs font-bold hover:bg-[#075e45] transition shadow-xs"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#eaf6ef] text-[#087f5b] rounded-xl text-xs font-bold hover:bg-[#d8f1e2] border border-[#cbe4d4] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse Jobs
        </Link>
      </div>
    </div>
  );
}
