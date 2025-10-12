import { Play, Clock, Users, Star } from 'lucide-react';
import type { PracticeType } from '@/types/practice';
import { getRelativeLocaleUrl } from '@sunrain/shared';

interface PracticeCardProps {
  practice: PracticeType;
  lang?: string;
}

export default function PracticeCard({ practice, lang = 'en' }: PracticeCardProps) {

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breathing':
        return '🫁';
      case 'meditation':
        return '🧘';
      case 'mindfulness':
        return '🌱';
      case 'relaxation':
        return '😌';
      case 'movement':
        return '🤸';
      case 'visualization':
        return '🎨';
      default:
        return '🧠';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'badge-success';
      case 'intermediate':
        return 'badge-warning';
      case 'advanced':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(practice.category)}</span>
            <div>
              <h2 className="card-title text-lg">{practice.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{practice.defaultDuration} min</span>
              </div>
            </div>
          </div>
          <div className={`badge ${getDifficultyColor(practice.difficulty)}`}>
            {practice.difficulty}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {practice.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {practice.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge badge-outline badge-sm">
              {tag}
            </span>
          ))}
          {practice.tags.length > 3 && (
            <span className="badge badge-outline badge-sm">
              +{practice.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{practice.averageRating?.toFixed(1) || '4.5'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{Math.round((practice.completionRate || 0.8) * 100)}%</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="card-actions justify-end">
          <a
            href={getRelativeLocaleUrl(lang as any, `/practice/${practice.id}/`)}
            className="btn btn-primary btn-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Play className="w-4 h-4" />
            Start Practice
          </a>
        </div>
      </div>
    </div>
  );
}
