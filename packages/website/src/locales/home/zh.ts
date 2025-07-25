/**
 * 首页中文翻译内容
 */
import type { IHomeTranslations } from './types';

export const homeZh: IHomeTranslations = {
  hero: {
    title: '您的心理健康之旅从这里开始',
    subtitle: '发现更好心理健康的工具、资源和指导',
    tagline: '太阳遇上雨的地方',
    description: '为您的心灵提供温暖、安全的空间。🤗',
    selfCheckButton: '🧠 开始自检',
    quickRelaxButton: '🎧 快速放松',
  },
  features: {
    title: '你心灵旅程的起点',
    subtitle: '六条通往健康的温柔路径，每一条都精心设计',
    selfCheck: {
      title: '自我测评',
      description: '自我心理测评（压力、焦虑、抑郁、自尊等）',
      button: '开始测评 →',
    },
    dailyPractice: {
      title: '日常练习',
      description: '正念训练、呼吸练习，构建心理韧性',
      button: '开始练习 →',
    },
    quickRelief: {
      title: '快速缓解',
      description: '白噪音、放松小游戏、放松呼吸互动',
      button: '寻找缓解 →',
    },
    healingLibrary: {
      title: '疗愈图书馆',
      description: '音乐、电影、播客、图书推荐（疗愈系）',
      button: '探索 →',
    },
    psychologyWiki: {
      title: '心理百科',
      description: '心理知识百科，解释各种常见心理问题',
      button: '了解更多 →',
    },
    supportHotline: {
      title: '支持热线',
      description: '全球心理援助热线、当地咨询资源指引',
      button: '获取帮助 →',
    },
  },
  userVoices: {
    title: '用户心声',
    subtitle: '来自我们社区的故事',
    testimonials: [
      {
        text: '这个地方让我感觉像家一样。',
        author: '匿名用户',
      },
      {
        text: '自我测评让我意识到我并不孤单。',
        author: '社区成员',
      },
      {
        text: '终于找到了真正有帮助的资源。',
        author: '感恩的访客',
      },
      {
        text: '正念练习改变了我的日常生活。',
        author: '常规用户',
      },
    ],
    feelSameButton: '❤️ 我也有同感',
  },
  cta: {
    title: '准备好开始你的疗愈之旅了吗？',
    description: '你并不孤单。迈出通往健康的温柔第一步。',
    submitStoryButton: '📝 分享你的故事',
    mindfulnessButton: '🧘 尝试正念练习',
  },
};

export default homeZh;
