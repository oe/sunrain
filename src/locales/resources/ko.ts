/**
 * 资源页面韩文翻译内容
 */
import type { IResourcesTranslations } from './types';

export const resourcesKo: IResourcesTranslations = {
  page: {
    title: '치유 자원',
    subtitle: '정신 건강을 위한 큐레이션된 음악, 영화, 책',
    description: '정신 건강 여정을 지원하고 어려운 시기에 위안을 제공할 수 있는 신중하게 선택된 음악, 영화, 책을 발견하세요.',
  },
  categories: {
    music: '음악',
    movies: '영화',
    books: '책',
    all: '전체',
  },
  sections: {
    music: {
      title: '치유 음악',
      description: '마음을 진정시키고 스트레스를 줄이도록 설계된 편안한 멜로디와 소리.',
    },
    movies: {
      title: '희망적인 영화',
      description: '희망, 회복력, 긍정적 사고를 영감을 주는 영화.',
    },
    books: {
      title: '웰니스 책',
      description: '정신 건강을 위한 통찰, 전략, 위안을 제공하는 책.',
    },
  },
  filters: {
    title: '자원 필터링',
    searchPlaceholder: '자원 검색...',
    filterByCategory: '카테고리별 필터링',
    clearFilters: '필터 지우기',
  },
  details: {
    author: '저자',
    director: '감독',
    artist: '아티스트',
    year: '연도',
    viewDetails: '세부 정보 보기',
    close: '닫기',
  },
  cta: {
    title: '치유 여정을 시작할 준비가 되셨나요?',
    description: '실용적인 정신 건강 전략을 위한 포괄적인 자가 도움 가이드를 탐색하세요.',
    button: '가이드 탐색',
  },
  links: {
    spotify: 'Spotify',
    youtube: 'YouTube',
    watch: '시청',
    trailer: '예고편',
    amazon: 'Amazon',
    goodreads: 'Goodreads',
  },
  crisis: {
    title: '위기 상담 전화',
    subtitle: '24/7 정신 건강 지원',
    description: '국가/지역별 전문 정신 건강 위기 지원 상담 전화 및 리소스를 찾아보세요. 이러한 서비스는 어려움을 겪고 있는 사람들에게 무료이고 기밀적인 지원을 제공합니다.',
    emergency: {
      title: '🚨 즉각적인 위험에 처해 있나요?',
      description: '즉각적인 위험에 처해 있거나 생명을 위협하는 응급 상황을 경험하고 있다면, 즉시 지역 응급 서비스(예: 미국 911, 한국 119)에 전화하세요.',
    },
    filters: {
      searchPlaceholder: '국가 또는 상담 전화 이름으로 검색...',
      selectRegion: '국가/지역 선택',
      allRegions: '모든 국가/지역',
    },
    hotline: {
      phone: '전화',
      website: '웹사이트',
      available: '이용 가능',
      languages: '언어',
      call: '전화하기',
      visitWebsite: '웹사이트 방문',
      available247: '24/7',
    },
    noResults: {
      title: '상담 전화를 찾을 수 없습니다',
      description: '검색 또는 필터 조건을 조정해 보세요.',
    },
    disclaimer: '이 정보는 정보 제공 목적으로만 제공됩니다. 나열된 서비스를 보증하거나 보장하지 않습니다. 사용 전 현재 연락처 정보를 확인하세요.',
    encouragement: {
      title: '당신은 혼자가 아닙니다',
      message: '태양이 비를 만나는 곳에서 희망과 치유는 항상 손이 닿는 곳에 있습니다. 도움을 구하는 것은 약함이 아니라 강함의 표시입니다.',
    },
  },
};

export default resourcesKo;