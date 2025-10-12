import PracticeCard from './PracticeCard';
import type { PracticeType } from '@/types/practice';
import { getRelativeLocaleUrl } from '@sunrain/shared';

interface PracticePageProps {
  practices: PracticeType[];
  lang: string;
}

export default function PracticePage({ practices, lang }: PracticePageProps) {
  const handleQuickStart = () => {
    // Start with the first practice
    if (practices.length > 0) {
      window.location.href = getRelativeLocaleUrl(lang as any, `/practice/${practices[0].id}/`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          Mindfulness Practices
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Guided mindfulness exercises for mental well-being
        </p>
      </div>

      {/* Practice Grid */}
      <div className="mb-8">
        {practices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practices.map((practice) => (
              <PracticeCard
                key={practice.id}
                practice={practice}
                lang={lang}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No practices found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your filters to see more practices.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={getRelativeLocaleUrl(lang as any, '/practice/history/')}
            className="btn btn-outline btn-primary"
          >
            📊 View History
          </a>
          <button
            className="btn btn-primary"
            onClick={handleQuickStart}
            disabled={practices.length === 0}
          >
            🚀 Quick Start
          </button>
        </div>
      </div>
    </div>
  );
}
