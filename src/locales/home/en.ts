/**
 * 首页英文翻译内容
 */
import type { IHomeTranslations } from './types';

export const homeEn: IHomeTranslations = {
  hero: {
    title: 'Your Mental Health Journey Starts Here',
    subtitle: 'Discover tools, resources, and guidance for better mental well-being',
    tagline: 'Where the sun meets the rain',
    description: 'A warm, safe space for your mind. 🤗',
    selfCheckButton: '🧠 Start Self-Check',
    quickRelaxButton: '🎧 Quick Relax',
  },
  features: {
    title: 'Your Journey to Wellness Starts Here',
    subtitle: 'Six gentle paths to wellness, each designed with care',
    selfCheck: {
      title: 'Self-Check',
      description: 'Self-assessment for mental health (stress, anxiety, depression, self-esteem)',
      button: 'Start Check →',
    },
    dailyPractice: {
      title: 'Daily Practice',
      description: 'Mindfulness training, breathing exercises, building mental resilience',
      button: 'Begin Practice →',
    },
    quickRelief: {
      title: 'Quick Relief',
      description: 'White noise, relaxation games, interactive breathing exercises',
      button: 'Find Relief →',
    },
    healingLibrary: {
      title: 'Healing Library',
      description: 'Curated music, movies, podcasts, and book recommendations for healing',
      button: 'Explore →',
    },
    psychologyWiki: {
      title: 'Psychology Wiki',
      description: 'Encyclopedia of psychological knowledge, explaining common mental health issues',
      button: 'Learn More →',
    },
    supportHotline: {
      title: 'Support Hotline',
      description: 'Global mental health helplines and local consultation resources',
      button: 'Get Help →',
    },
  },
  userVoices: {
    title: 'User Voices',
    subtitle: 'Stories from our community',
    testimonials: [
      {
        text: 'This space felt like home.',
        author: 'Anonymous User',
      },
      {
        text: "The self-check helped me realize I wasn't alone.",
        author: 'Community Member',
      },
      {
        text: 'Finally found resources that actually help.',
        author: 'Grateful Visitor',
      },
      {
        text: 'The mindfulness exercises changed my daily routine.',
        author: 'Regular User',
      },
    ],
    feelSameButton: '❤️ I feel the same',
  },
  cta: {
    title: 'Ready to start your healing journey?',
    description: "You're not alone. Take the first gentle step towards wellness.",
    submitStoryButton: '📝 Submit Your Story',
    mindfulnessButton: '🧘 Try a Mindfulness Session',
  },
};

export default homeEn;
