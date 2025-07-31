/**
 * 评测系统韩语翻译内容
 */
import type { IAssessmentTranslations } from './types';

export const assessmentKo: IAssessmentTranslations = {
  pageTitle: '정신건강 평가',

  list: {
    title: '정신건강 평가',
    subtitle: '과학적인 평가 도구를 통해 정신건강 상태를 이해하고 개인 맞춤형 권장사항과 자료를 받아보세요',
    categories: {
      mental_health: '정신건강 평가',
      personality: '성격 평가',
      stress: '스트레스 평가',
      mood: '기분 평가'
    },
    categoryDescriptions: {
      mental_health: '잠재적인 정신건강 문제를 식별하는 데 도움이 되는 전문적인 정신건강 선별 도구',
      personality: '성격 특성과 행동 패턴을 이해하세요',
      stress: '스트레스 수준과 대처 능력을 평가하세요',
      mood: '감정 상태와 변화 추이를 모니터링하세요'
    },
    startButton: '평가 시작',
    minutes: '분',
    questions: '문항',
    activeSessions: {
      title: '{count}개의 미완료 평가가 있습니다',
      message: '클릭하여 평가를 계속하세요',
      continueLink: '평가 계속하기',
      lastActivity: '마지막 활동',
      progress: '진행률'
    },
    quickActions: {
      title: '빠른 작업',
      history: {
        title: '평가 기록',
        description: '과거 평가 결과 보기'
      },
      trends: {
        title: '추세 분석',
        description: '정신건강 추세 보기'
      },
      continue: {
        title: '평가 계속하기',
        description: '미완료 평가 완료하기'
      }
    },
    disclaimer: {
      title: '중요 안내',
      message: '이러한 평가 도구는 선별 검사와 자기 이해를 위한 것이며 전문적인 정신건강 진단을 대체할 수 없습니다. 고통을 느끼거나 도움이 필요한 경우 전문 정신건강 전문가와 상담하시기 바랍니다.'
    }
  },

  execution: {
    loading: '평가 로딩 중...',
    pause: '일시정지',
    save: '진행상황 저장',
    next: '다음',
    previous: '이전',
    complete: '평가 완료',
    timeSpent: '소요 시간',
    required: '* 필수',
    questionNumber: '질문',
    totalQuestions: '문항',
    completion: {
      title: '평가 완료!',
      message: '결과를 분석 중...'
    },
    pauseModal: {
      title: '평가 일시정지',
      message: '진행상황이 자동으로 저장되었습니다. 나중에 평가를 계속할 수 있습니다.',
      continue: '평가 계속하기',
      exit: '종료'
    },
    errors: {
      required: '계속하기 전에 이 질문에 답해주세요.',
      submitFailed: '답변 제출에 실패했습니다. 다시 시도해주세요.',
      loadFailed: '평가 로딩에 실패했습니다. 페이지를 새로고침하고 다시 시도해주세요.'
    }
  },

  results: {
    loading: '평가 결과 로딩 중...',
    completedAt: '완료 시간',
    timeSpent: '소요 시간',
    overallAssessment: '전체 평가',
    detailedInterpretation: '상세 해석',
    scoreDistribution: '점수 분포',
    riskAssessment: '위험 평가',
    personalizedRecommendations: '개인 맞춤 권장사항',
    recommendedResources: '추천 자료',
    nextSteps: {
      title: '다음 단계',
      moreAssessments: {
        title: '추가 평가',
        description: '다른 평가 도구 탐색'
      },
      startPractice: {
        title: '연습 시작',
        description: '관련 정신건강 연습 시도'
      },
      browseResources: {
        title: '자료 둘러보기',
        description: '치유 자료 라이브러리 보기'
      }
    },
    actions: {
      share: '결과 공유',
      savePdf: 'PDF로 저장',
      viewHistory: '기록 보기'
    },
    riskLevels: {
      high: {
        title: '주의 필요',
        message: '평가 결과에 따르면 전문적인 도움이 필요할 수 있습니다. 정신건강 전문가와 상담하거나 정신건강 상담전화에 연락하는 것을 고려해보세요.'
      },
      medium: {
        title: '관심 권장',
        message: '평가 결과에 따르면 주의가 필요한 영역이 있습니다. 자기관리 방법을 실행하거나 지원을 구하는 것을 고려해보세요.'
      },
      low: {
        title: '양호한 상태',
        message: '평가 결과가 정상 범위 내에 있습니다. 건강한 습관을 계속 유지하세요.'
      }
    },
    disclaimer: {
      title: '중요 안내',
      message: '이러한 평가 결과는 참고용이며 전문적인 정신건강 진단을 대체할 수 없습니다. 고통을 느끼거나 도움이 필요한 경우 전문 정신건강 전문가와 상담하시기 바랍니다.'
    }
  },

  history: {
    title: '평가 기록',
    subtitle: '과거 평가 기록과 추세 분석 보기',
    statistics: {
      total: '총 평가 수',
      completed: '완료됨',
      averageTime: '평균 시간',
      lastAssessment: '마지막 평가'
    },
    filters: {
      assessmentType: '평가 유형',
      timeRange: '시간 범위',
      riskLevel: '위험 수준',
      allTypes: '모든 유형',
      allTimes: '모든 시간',
      allLevels: '모든 수준',
      last7Days: '지난 7일',
      last30Days: '지난 30일',
      last3Months: '지난 3개월',
      lastYear: '지난 1년',
      clearFilters: '필터 지우기'
    },
    list: {
      title: '평가 기록',
      viewDetails: '세부사항 보기',
      share: '공유',
      delete: '삭제',
      dimensions: '차원',
      today: '오늘',
      daysAgo: '일 전'
    },
    empty: {
      title: '평가 기록 없음',
      message: '아직 완료한 평가가 없습니다',
      startFirst: '첫 번째 평가 시작'
    },
    pagination: {
      showing: '표시 중',
      to: '에서',
      of: '의',
      records: '기록',
      previous: '이전',
      next: '다음'
    },
    actions: {
      export: '데이터 내보내기',
      newAssessment: '새 평가'
    }
  },

  continue: {
    title: '평가 계속하기',
    subtitle: '미완료된 정신건강 평가를 완료하세요',
    loading: '미완료 평가 로딩 중...',
    noSessions: {
      title: '미완료 평가 없음',
      message: '현재 계속할 평가가 없습니다',
      startNew: '새 평가 시작'
    },
    session: {
      startedAt: '시작 시간',
      timeSpent: '소요 시간',
      progress: '진행률',
      answered: '답변 완료',
      estimatedRemaining: '예상 남은 시간',
      continueButton: '평가 계속하기',
      status: {
        active: '진행 중',
        paused: '일시정지됨'
      }
    },
    actions: {
      startNew: '새 평가 시작',
      clearAll: '모든 미완료 평가 지우기'
    },
    confirmations: {
      deleteSession: '이 미완료 평가를 삭제하시겠습니까? 모든 진행상황이 손실됩니다.',
      clearAll: '모든 미완료 평가를 지우시겠습니까? 모든 진행상황이 손실됩니다.'
    }
  },

  trends: {
    title: '추세 분석',
    subtitle: '정신건강 추세와 발전 패턴 분석',
    loading: '추세 데이터 로딩 중...',
    timeRange: {
      title: '시간 범위',
      last30Days: '지난 30일',
      last3Months: '지난 3개월',
      lastYear: '지난 1년',
      allTime: '전체 기간'
    },
    charts: {
      overallTrend: '전체 추세',
      frequency: '평가 빈도',
      riskTrend: '위험 수준 변화',
      categoryPerformance: '카테고리별 성과'
    },
    insights: {
      title: '추세 인사이트',
      positive: '긍정적 추세',
      warning: '주의 필요',
      info: '안정적'
    },
    statistics: {
      improvementTrend: '개선 추세',
      stableDimensions: '안정적 차원',
      attentionNeeded: '주의 필요'
    },
    noData: {
      title: '추세 데이터 없음',
      message: '추세 분석을 보려면 최소 2개의 평가를 완료해야 합니다',
      startAssessment: '평가 시작'
    },
    actions: {
      exportReport: '추세 보고서 내보내기',
      newAssessment: '새 평가'
    }
  },

  // 클라이언트 컴포넌트 전용 번역
  client: {
    loading: {
      assessment: '평가 로딩 중...',
      translations: '번역 로딩 중...',
      question: '질문 로딩 중...'
    },
    errors: {
      title: '오류 발생',
      sessionStartFailed: '평가 세션을 시작할 수 없습니다',
      initializationFailed: '초기화 오류',
      submitFailed: '답변 제출 실패',
      analysisFailed: '분석 오류',
      noData: '데이터가 없습니다',
      invalidScale: '{min}과 {max} 사이의 값을 선택해주세요',
      textTooLong: '텍스트는 1000자를 초과할 수 없습니다',
      unsupportedQuestionType: '지원되지 않는 질문 유형: {type}'
    },
    actions: {
      retry: '다시 시도',
      previous: '이전',
      next: '다음',
      complete: '완료',
      save: '저장',
      saved: '저장됨'
    },
    progress: {
      text: '진행률: {current} / {total}'
    },
    question: {
      number: '질문 {number}',
      required: '필수',
      selectedCount: '{count}개 항목 선택됨',
      selectedValue: '현재 선택: {value}',
      textPlaceholder: '여기에 답변을 입력해주세요...',
      characterCount: '{count}자 입력됨',
      textEntered: '답변 입력됨',
      answered: '답변 완료'
    }
  },

  common: {
    title: '제목',
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    refresh: '새로고침',
    cancel: '취소',
    confirm: '확인',
    delete: '삭제',
    save: '저장',
    share: '공유',
    export: '내보내기',
    riskLevels: {
      low: '낮은 위험',
      medium: '중간 위험',
      high: '높은 위험'
    },
    timeUnits: {
      seconds: '초',
      minutes: '분',
      hours: '시간',
      days: '일'
    }
  }
};

export default assessmentKo;
