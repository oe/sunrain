/**
 * Assessment 系统韩语翻译内容 (CSR)
 * 包含实际使用的翻译键，匹配组件中的client前缀结构
 */
import type { IAssessmentTranslations } from './types';

export const assessmentKo: IAssessmentTranslations = {
  assessment: {
    title: '정신건강 평가',
  },

  loading: {
    default: '로딩 중...',
    assessment: '평가 로딩 중...',
  },

  errors: {
    title: '오류',
    initializationFailed: '초기화 실패',
    sessionStartFailed: '평가 세션을 시작할 수 없습니다',
    noData: '평가 데이터 로딩에 실패했습니다',
    validationFailed: '검증에 실패했습니다',
    unsupportedQuestionType: '지원되지 않는 질문 유형: {type}',
    boundary: {
      title: '애플리케이션 오류',
      message: '죄송합니다. 애플리케이션에서 오류가 발생했습니다.',
      details: '오류 세부사항',
      retry: '다시 시도',
      goHome: '홈으로 이동',
    },
  },

  question: {
    number: '질문 {number}',
    required: '필수',
    selectedCount: '{count}개 선택됨',
    selectedValue: '선택됨: {value}',
    textPlaceholder: '답변을 입력해주세요...',
    characterCount: '{count}자',
    textEntered: '텍스트 입력됨',
    answered: '답변 완료',
  },

  questionList: {
    title: '질문 목록',
    progress: '진행률: {current}/{total}',
    questionNumber: '질문 {number}',
    completed: '완료',
    remaining: '남은',
  },

  continue: {
    loading: '미완료 평가 로딩 중...',
  },

  list: {
    activeSessions: {
      title: '{count}개의 미완료 평가가 있습니다',
      continueLink: '평가 계속하기',
      lastActivity: '마지막 활동',
      progress: '진행률',
    },
  },

  progress: {
    text: '{current} / {total}',
  },

  validation: {
    checking: '검증 중...',
  },

  execution: {
    errors: {
      submitFailed: '제출 실패',
      required: '이 필드는 필수입니다',
    },
    completion: {
      title: '평가 완료',
      message: '결과 생성 중...',
    },
    pauseModal: {
      title: '평가 일시정지',
      message: '평가를 일시정지하시겠습니까?',
      continue: '계속',
      exit: '종료',
    },
    navigation: {
      previous: '이전',
      next: '다음',
      submit: '제출',
      save: '저장',
      submitting: '제출 중...',
    },
    pause: '일시정지',
    questionNumber: '질문 {number}',
    timeSpent: '소요 시간',
    complete: '완료',
  },
};

export default assessmentKo;
