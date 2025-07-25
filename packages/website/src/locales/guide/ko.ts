/**
 * 指南页面韩文翻译内容
 */
import type { IGuideTranslations } from './types';

export const guideKo: IGuideTranslations = {
  page: {
    title: '정신 건강 자가 도움 가이드',
    subtitle: '불안, 수면, 감정 관리를 위한 실용적인 자원',
    description: '불안, 우울증, 수면 문제, 감정 조절을 다루는 포괄적인 정신 건강 가이드 컬렉션을 탐색하세요.',
  },
  list: {
    viewAll: '모든 가이드 보기',
    noGuides: '현재 이용 가능한 가이드가 없습니다.',
    loading: '가이드 로딩 중...',
    featured: '추천 가이드',
    allGuides: '모든 가이드',
    featuredTag: '추천',
  },
  detail: {
    publishedOn: '게시일',
    updatedOn: '업데이트일',
    author: '저자',
    tags: '태그',
    tableOfContents: '목차',
    shareGuide: '이 가이드 공유',
  },
  navigation: {
    previous: '이전',
    next: '다음',
    backToGuides: '가이드 목록으로 돌아가기',
  },
  actions: {
    readMore: '더 읽기',
    backTo: '돌아가기',
    print: '인쇄',
    share: '공유',
  },
  help: {
    needMoreHelp: '더 많은 도움이 필요하신가요?',
    helpDescription: '정신 건강 위기를 겪고 있거나 즉각적인 지원이 필요한 경우, 주저하지 말고 전문적인 도움을 요청하세요.',
    exploreResources: '자원 탐색',
    getEmergencyHelp: '응급 도움 받기',
  },
  empty: {
    noGuidesAvailable: '이용 가능한 가이드 없음',
    emptyDescription: '새로운 정신 건강 가이드와 자원을 위해 곧 다시 확인해 주세요.',
  },
};

export default guideKo;