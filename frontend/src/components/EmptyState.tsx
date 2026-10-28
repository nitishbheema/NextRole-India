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
    icon: <Inbox className="h-12 w-12 text-gray-300" aria-hidden="true" />,
    title: 'No jobs yet',
    description:
      "We haven't crawled any jobs yet. Check back soon — we sync regularly from company career pages.",
  },
  'no-results': {
    icon: <SearchX className="h-12 w-12 text-gray-300" aria-hidden="true" />,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters to find more opportunities.',
  },
  'api-error': {
    icon: <ServerCrash className="h-12 w-12 text-red-300" aria-hidden="true" />,
    title: 'Something went wrong',
    description:
      "We couldn't load job listings right now. Please try again in a moment.",
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
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="mb-4">{defaults.icon}</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title ?? defaults.title}</h3>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        {description ?? defaults.description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
