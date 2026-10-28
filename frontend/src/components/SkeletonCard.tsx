import React from 'react';

export default function SkeletonCard() {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
      aria-hidden="true"
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        <div className="h-12 w-12 rounded-lg bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      {/* Location */}
      <div className="h-3 bg-gray-200 rounded w-2/5 mb-3" />

      {/* Badges */}
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-gray-200 rounded-full w-20" />
        <div className="h-5 bg-gray-200 rounded-full w-16" />
        <div className="h-5 bg-gray-200 rounded-full w-18" />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded-lg w-24" />
      </div>
    </div>
  );
}
