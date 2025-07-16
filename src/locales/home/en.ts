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
      description: '自我心理测评（压力、焦虑、抑郁、自尊等）',
      button: 'Start Check →',
    },
    dailyPractice: {
      title: 'Daily Practice',
      description: '正念训练、呼吸练习，构建心理韧性',
      button: 'Begin Practice →',
    },
    quickRelief: {
      title: 'Quick Relief',
      description: '白噪音、放松小游戏、放松呼吸互动',
      button: 'Find Relief →',
    },
    healingLibrary: {
      title: 'Healing Library',
      description: '音乐、电影、播客、图书推荐（疗愈系）',
      button: 'Explore →',
    },
    psychologyWiki: {
      title: 'Psychology Wiki',
      description: '心理知识百科，解释各种常见心理问题',
      button: 'Learn More →',
    },
    supportHotline: {
      title: 'Support Hotline',
      description: '全球心理援助热线、当地咨询资源指引',
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
