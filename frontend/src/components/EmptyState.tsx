import React from 'react';
import { SearchX, ServerCrash, Inbox } from 'lucide-react';

type Variant = 'no-jobs' | 'no-results' | 'api-error';

interface EmptyStateProps {
  variant?: Variant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const DEFAULTS: Record<Variant, { icon: React.ReactNode; title: string; description: string }> = {
  'no-jobs': {
    icon: <Inbox className="h-12 w-12 text-[#9bb3a6]" aria-hidden="true" />,
    title: 'No jobs yet',
    description:
      "We haven't indexed any matching opportunities yet. Check back soon — our automated sync runs continuously from official ATS feeds.",
  },
  'no-results': {
    icon: <SearchX className="h-12 w-12 text-[#9bb3a6]" aria-hidden="true" />,
    title: 'No results found',
    description: 'Try adjusting your search terms, changing the location filter, or resetting category filters to discover more roles.',
  },
  'api-error': {
    icon: <ServerCrash className="h-12 w-12 text-rose-400" aria-hidden="true" />,
    title: 'Something went wrong',
    description:
      "We couldn't connect to the jobs index right now. Please check your network and try again in a moment.",
  },
};

export default function EmptyState({
  variant = 'no-results',
  title,
  description,
  action,
}: EmptyStateProps) {
  const defaults = DEFAULTS[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-dashed border-[#cbe1d4] my-6">
      <div className="mb-4 p-3.5 bg-[#eaf6ef] rounded-2xl text-[#087f5b]">{defaults.icon}</div>
      <h3 className="font-display text-lg font-bold text-[#172b25] mb-2">{title ?? defaults.title}</h3>
      <p className="text-sm text-[#667a70] max-w-md leading-relaxed">
        {description ?? defaults.description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
