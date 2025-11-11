/**
 * 资源页面英文翻译内容
 */
import type { IResourcesTranslations } from './types';

export const resourcesEn: IResourcesTranslations = {
  page: {
    title: 'Healing Resources',
    subtitle: 'Curated music, movies, and books for mental wellness',
    description: 'Discover carefully selected music, movies, and books that can support your mental health journey and provide comfort during difficult times.',
  },
  categories: {
    music: 'Music',
    movies: 'Movies',
    books: 'Books',
    all: 'All',
  },
  sections: {
    music: {
      title: 'Healing Music',
      description: 'Soothing melodies and sounds designed to calm the mind and reduce stress.',
    },
    movies: {
      title: 'Uplifting Movies',
      description: 'Films that inspire hope, resilience, and positive thinking.',
    },
    books: {
      title: 'Wellness Books',
      description: 'Books that offer insights, strategies, and comfort for mental health.',
    },
  },
  filters: {
    title: 'Filter Resources',
    searchPlaceholder: 'Search resources...',
    filterByCategory: 'Filter by Category',
    clearFilters: 'Clear Filters',
  },
  details: {
    author: 'Author',
    director: 'Director',
    artist: 'Artist',
    year: 'Year',
    viewDetails: 'View Details',
    close: 'Close',
  },
  cta: {
    title: 'Ready to Start Your Healing Journey?',
    description: 'Explore our comprehensive self-help guides for practical mental health strategies.',
    button: 'Browse Guides',
  },
  links: {
    spotify: 'Spotify',
    youtube: 'YouTube',
    watch: 'Watch',
    trailer: 'Trailer',
    amazon: 'Amazon',
    goodreads: 'Goodreads',
  },
  crisis: {
    title: 'Crisis Hotlines',
    subtitle: '24/7 Mental Health Support',
    description: 'Find professional mental health crisis support hotlines and resources by country/region. These services provide free, confidential support for people in distress.',
    emergency: {
      title: '🚨 In Immediate Danger?',
      description: 'If you are in immediate danger or experiencing a life-threatening emergency, please call your local emergency services (e.g., 911 in the US, 999 in the UK) immediately.',
    },
    filters: {
      searchPlaceholder: 'Search by country or hotline name...',
      selectRegion: 'Select Country/Region',
      allRegions: 'All Countries/Regions',
    },
    hotline: {
      phone: 'Phone',
      website: 'Website',
      available: 'Available',
      languages: 'Languages',
      call: 'Call',
      visitWebsite: 'Visit Website',
      available247: '24/7',
    },
    noResults: {
      title: 'No hotlines found',
      description: 'Try adjusting your search or filter criteria.',
    },
    disclaimer: 'This information is provided for informational purposes only. We do not endorse or guarantee the services listed. Please verify the current contact information before use.',
    encouragement: {
      title: 'You Are Not Alone',
      message: 'Where the sun meets the rain, hope and healing are always within reach. Reaching out for help is a sign of strength, not weakness.',
    },
  },
};

export default resourcesEn;
