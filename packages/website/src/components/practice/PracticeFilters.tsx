import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { PracticeType, PracticeCategory, DifficultyLevel } from '@/types/practice';

interface PracticeFiltersProps {
  practices: PracticeType[];
  onFilteredPractices: (practices: PracticeType[]) => void;
}

export default function PracticeFilters({ practices, onFilteredPractices }: PracticeFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PracticeCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedDuration, setSelectedDuration] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories: PracticeCategory[] = ['mindfulness', 'breathing', 'meditation', 'relaxation', 'movement', 'visualization'];
  const difficulties: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    filterPractices();
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedDuration, practices]);

  const filterPractices = () => {
    let filtered = [...practices];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(practice =>
        practice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practice.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(practice => practice.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(practice => practice.difficulty === selectedDifficulty);
    }

    // Duration filter
    if (selectedDuration !== 'all') {
      filtered = filtered.filter(practice => {
        const duration = practice.defaultDuration;
        switch (selectedDuration) {
          case 'short':
            return duration <= 5;
          case 'medium':
            return duration > 5 && duration <= 15;
          case 'long':
            return duration > 15;
          default:
            return true;
        }
      });
    }

    onFilteredPractices(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedDuration('all');
  };

  const getCategoryIcon = (category: PracticeCategory) => {
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

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search practices..."
          className="input input-bordered w-full pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchTerm('')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        
        {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedDuration !== 'all') && (
          <button
            className="btn btn-ghost btn-sm text-gray-500"
            onClick={clearFilters}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="space-y-4 border-t pt-4">
          {/* Category Filter */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Category</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`btn btn-sm ${selectedCategory === category ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="mr-1">{getCategoryIcon(category)}</span>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Difficulty</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`btn btn-sm ${selectedDifficulty === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedDifficulty('all')}
              >
                All
              </button>
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  className={`btn btn-sm ${selectedDifficulty === difficulty ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  <span className={`badge ${getDifficultyColor(difficulty)} badge-sm mr-1`}>
                    {difficulty.charAt(0).toUpperCase()}
                  </span>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Duration</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`btn btn-sm ${selectedDuration === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedDuration('all')}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${selectedDuration === 'short' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedDuration('short')}
              >
                ⚡ Short (&le;5 min)
              </button>
              <button
                className={`btn btn-sm ${selectedDuration === 'medium' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedDuration('medium')}
              >
                ⏱️ Medium (5-15 min)
              </button>
              <button
                className={`btn btn-sm ${selectedDuration === 'long' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedDuration('long')}
              >
                🕐 Long (&gt;15 min)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedDuration !== 'all') && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Active filters:
            {selectedCategory !== 'all' && (
              <span className="badge badge-primary badge-sm ml-2">
                {getCategoryIcon(selectedCategory)} {selectedCategory}
              </span>
            )}
            {selectedDifficulty !== 'all' && (
              <span className={`badge ${getDifficultyColor(selectedDifficulty)} badge-sm ml-2`}>
                {selectedDifficulty}
              </span>
            )}
            {selectedDuration !== 'all' && (
              <span className="badge badge-outline badge-sm ml-2">
                {selectedDuration} duration
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
