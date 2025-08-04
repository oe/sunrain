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

  results: {
    loading: '평가 결과 로딩 중...',
    completedAt: '완료 시간',
    timeSpent: '소요 시간',
    overallAssessment: '전체 평가',
    detailedInterpretation: '상세 해석',
    scoreDistribution: '점수 분포',
    riskAssessment: '위험 평가',
    personalizedRecommendations: '개인화된 권장사항',
    recommendedResources: '권장 리소스',
    nextSteps: {
      title: '다음 단계',
      moreAssessments: {
        title: '더 많은 평가',
        description: '다른 평가 도구 탐색'
      },
      startPractice: {
        title: '연습 시작',
        description: '관련 정신 건강 실습 시도'
      },
      browseResources: {
        title: '리소스 탐색',
        description: '치유 리소스 라이브러리 보기'
      }
    },
    actions: {
      share: '결과 공유',
      savePdf: 'PDF로 저장',
      viewHistory: '기록 보기',
      backToAssessments: '평가로 돌아가기'
    },
    riskLevels: {
      high: {
        title: '주의 필요',
        message: '평가 결과는 전문적인 도움이 필요할 수 있음을 나타냅니다. 정신 건강 전문가와 상담을 고려해보세요.'
      },
      medium: {
        title: '주의 권장',
        message: '평가 결과는 주의가 필요한 영역이 있음을 보여줍니다. 자기 관리 조치 실시를 고려해보세요.'
      },
      low: {
        title: '양호한 상태',
        message: '평가 결과는 정상 범위 내에 있습니다. 건강한 습관을 계속 유지하세요.'
      }
    },
    disclaimer: {
      title: '중요 공지',
      message: '이 평가 결과는 참고용이며 전문적인 정신 건강 진단을 대체할 수 없습니다.'
    },
    quickActions: '빠른 작업',
    noResultFound: '평가 결과를 찾을 수 없음',
    noResultData: '평가 데이터를 찾을 수 없음'
  },

  actions: {
    retry: '다시 시도',
    goBack: '돌아가기',
  },
};

export default assessmentKo;
