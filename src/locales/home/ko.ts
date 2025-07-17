/**
 * 首页韩语翻译内容
 */
import type { IHomeTranslations } from './types';

export const homeKo: IHomeTranslations = {
  hero: {
    title: '당신의 정신 건강 여정이 여기서 시작됩니다',
    subtitle: '더 나은 정신적 웰빙을 위한 도구, 리소스, 가이드를 발견하세요',
    tagline: '태양이 비를 만나는 곳',
    description: '당신의 마음을 위한 따뜻하고 안전한 공간. 🤗',
    selfCheckButton: '🧠 자가 진단 시작',
    quickRelaxButton: '🎧 빠른 휴식',
  },
  features: {
    title: '당신의 마음 여정의 시작점',
    subtitle: '정성껏 설계된 여섯 가지 부드러운 웰빙의 길',
    selfCheck: {
      title: '자가 진단',
      description: '정신 건강 자가 평가(스트레스, 불안, 우울증, 자존감 등)',
      button: '진단 시작 →',
    },
    dailyPractice: {
      title: '일상 연습',
      description: '마음챙김 훈련, 호흡 운동, 정신적 회복력 구축',
      button: '연습 시작 →',
    },
    quickRelief: {
      title: '빠른 완화',
      description: '백색 소음, 휴식 게임, 상호작용 호흡 운동',
      button: '완화 찾기 →',
    },
    healingLibrary: {
      title: '치유 라이브러리',
      description: '엄선된 음악, 영화, 팟캐스트, 치유를 위한 책 추천',
      button: '탐색하기 →',
    },
    psychologyWiki: {
      title: '심리학 위키',
      description: '심리학 지식 백과사전, 일반적인 정신 건강 문제 설명',
      button: '더 알아보기 →',
    },
    supportHotline: {
      title: '지원 핫라인',
      description: '글로벌 정신 건강 헬프라인 및 지역 상담 자원',
      button: '도움 받기 →',
    },
  },
  userVoices: {
    title: '사용자 목소리',
    subtitle: '우리 커뮤니티의 이야기',
    testimonials: [
      {
        text: '이 공간은 집처럼 느껴졌어요.',
        author: '익명 사용자',
      },
      {
        text: '자가 진단을 통해 내가 혼자가 아니라는 것을 깨달았어요.',
        author: '커뮤니티 회원',
      },
      {
        text: '마침내 정말 도움이 되는 자원을 찾았어요.',
        author: '감사한 방문자',
      },
      {
        text: '마음챙김 운동이 내 일상을 바꿨어요.',
        author: '정기 사용자',
      },
    ],
    feelSameButton: '❤️ 저도 같은 마음이에요',
  },
  cta: {
    title: '치유의 여정을 시작할 준비가 되셨나요?',
    description: '당신은 혼자가 아닙니다. 웰빙을 향한 첫 번째 부드러운 발걸음을 내딛으세요.',
    submitStoryButton: '📝 당신의 이야기 제출',
    mindfulnessButton: '🧘 마음챙김 세션 시도하기',
  },
};

export default homeKo;