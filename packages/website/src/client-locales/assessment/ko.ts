/**
 * Assessment 系统韩语翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { IAssessmentTranslations } from './types';

export const assessmentKo: IAssessmentTranslations = {
  /** 평가 목록 페이지 */
  list: {
    title: '정신건강 평가',
    subtitle: '과학적인 평가 도구를 통해 정신건강 상태를 이해하고 개인화된 권장사항과 자원을 얻으세요',
    categories: {
      mental_health: '정신건강 평가',
      personality: '성격 평가',
      stress: '스트레스 평가',
      mood: '기분 평가',
    },
    categoryDescriptions: {
      mental_health: '잠재적인 정신건강 문제를 식별하는 데 도움이 되는 전문적인 정신건강 선별 도구',
      personality: '성격 특성과 행동 패턴을 이해하세요',
      stress: '스트레스 수준과 대처 능력을 평가하세요',
      mood: '감정 상태와 경향을 모니터링하세요',
    },
    startButton: '평가 시작',
    minutes: '분',
    questions: '문항',
    activeSessions: {
      title: '{count}개의 미완료 평가가 있습니다',
      message: '클릭하여 평가를 계속하세요',
      continueLink: '평가 계속하기',
      lastActivity: '마지막 활동',
      progress: '진행률',
    },
    quickActions: {
      title: '빠른 작업',
      history: {
        title: '평가 기록',
        description: '과거 평가 결과 보기',
      },
      trends: {
        title: '트렌드 분석',
        description: '정신건강 트렌드 보기',
      },
      continue: {
        title: '평가 계속하기',
        description: '미완료 평가 완료하기',
      },
    },
    disclaimer: {
      title: '중요 공지',
      message: '이러한 평가 도구는 선별 및 자기 이해를 위한 것이며 전문적인 정신건강 진단을 대체할 수 없습니다. 고통을 느끼거나 도움이 필요한 경우 전문 정신건강 전문가에게 상담하세요.',
    },
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
    recommendedResources: '권장 자원',
    nextSteps: {
      title: '다음 단계',
      moreAssessments: {
        title: '더 많은 평가',
        description: '다른 평가 도구 탐색',
      },
      startPractice: {
        title: '연습 시작',
        description: '관련 정신건강 연습 시도',
      },
      browseResources: {
        title: '자원 탐색',
        description: '치유 자원 라이브러리 보기',
      },
    },
    actions: {
      share: '결과 공유',
      savePdf: 'PDF로 저장',
      viewHistory: '기록 보기',
    },
    riskLevels: {
      high: {
        title: '주의 필요',
        message: '평가 결과는 전문적인 도움이 필요할 수 있음을 나타냅니다. 정신건강 전문가 상담이나 정신건강 상담전화 이용을 고려하세요.',
      },
      medium: {
        title: '주의 권장',
        message: '평가 결과는 주의가 필요한 영역이 있음을 보여줍니다. 자기관리 조치 실행이나 지원 요청을 고려하세요.',
      },
      low: {
        title: '양호한 상태',
        message: '평가 결과가 정상 범위 내에 있습니다. 건강한 습관을 계속 유지하세요.',
      },
    },
    disclaimer: {
      title: '중요 공지',
      message: '이러한 평가 결과는 참고용이며 전문적인 정신건강 진단을 대체할 수 없습니다. 고통을 느끼거나 도움이 필요한 경우 전문 정신건강 전문가에게 상담하세요.',
    },
  },

  history: {
    title: '평가 기록',
    subtitle: '과거 평가 기록과 트렌드 분석 보기',
    statistics: {
      total: '총 평가 수',
      completed: '완료됨',
      averageTime: '평균 시간',
      lastAssessment: '마지막 평가',
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
      clearFilters: '필터 지우기',
    },
    list: {
      title: '평가 기록',
      viewDetails: '세부사항 보기',
      share: '공유',
      delete: '삭제',
      dimensions: '차원',
      today: '오늘',
      daysAgo: '일 전',
    },
    empty: {
      title: '평가 기록 없음',
      message: '아직 완료한 평가가 없습니다',
      startFirst: '첫 번째 평가 시작',
    },
    pagination: {
      showing: '표시 중',
      to: '~',
      of: '/',
      records: '기록',
      previous: '이전',
      next: '다음',
    },
    actions: {
      export: '데이터 내보내기',
      newAssessment: '새 평가',
    },
  },

  continue: {
    title: '평가 계속하기',
    subtitle: '미완료된 정신건강 평가를 완료하세요',
    loading: '미완료 평가 로딩 중...',
    noSessions: {
      title: '미완료 평가 없음',
      message: '현재 계속할 평가가 없습니다',
      startNew: '새 평가 시작',
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
        paused: '일시정지됨',
      },
    },
    actions: {
      startNew: '새 평가 시작',
      clearAll: '모든 미완료 평가 지우기',
    },
    confirmations: {
      deleteSession: '이 미완료 평가를 삭제하시겠습니까? 모든 진행 상황이 손실됩니다.',
      clearAll: '모든 미완료 평가를 지우시겠습니까? 모든 진행 상황이 손실됩니다.',
    },
  },

  trends: {
    title: '트렌드 분석',
    subtitle: '정신건강 트렌드와 발전 패턴 분석',
    loading: '트렌드 데이터 로딩 중...',
    timeRange: {
      title: '시간 범위',
      last30Days: '지난 30일',
      last3Months: '지난 3개월',
      lastYear: '지난 1년',
      allTime: '전체 기간',
    },
    charts: {
      overallTrend: '전체 트렌드',
      frequency: '평가 빈도',
      riskTrend: '위험 수준 변화',
      categoryPerformance: '카테고리별 성과',
    },
    insights: {
      title: '트렌드 인사이트',
      positive: '긍정적 트렌드',
      warning: '주의 필요',
      info: '안정적',
    },
    statistics: {
      improvementTrend: '개선 트렌드',
      stableDimensions: '안정적 차원',
      attentionNeeded: '주의 필요',
    },
    noData: {
      title: '트렌드 데이터 없음',
      message: '트렌드 분석을 보려면 최소 2개의 평가를 완료해야 합니다',
      startAssessment: '평가 시작',
    },
    actions: {
      exportReport: '트렌드 보고서 내보내기',
      newAssessment: '새 평가',
    },
  },

  common: {
    title: '정신건강 평가',
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
      high: '높은 위험',
    },
    timeUnits: {
      seconds: '초',
      minutes: '분',
      hours: '시간',
      days: '일',
    },
  },
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 评测加载 */
      assessment: '평가 로딩 중...',
      /** 翻译加载 */
      translations: '번역 로딩 중...',
      /** 问题加载 */
      question: '질문 로딩 중...',
      /** 结果分析 */
      analysis: '결과 분석 중...',
      /** 历史记录 */
      history: '기록 로딩 중...',
    },
    /** 错误信息 */
    errors: {
      /** 错误标题 */
      title: '오류가 발생했습니다',
      /** 会话启动失败 */
      sessionStartFailed: '평가 세션을 시작할 수 없습니다',
      /** 初始化失败 */
      initializationFailed: '초기화 실패',
      /** 提交失败 */
      submitFailed: '답변 제출에 실패했습니다. 다시 시도해주세요',
      /** 分析失败 */
      analysisFailed: '결과 분석에 실패했습니다',
      /** 无数据 */
      noData: '평가 데이터 로딩에 실패했습니다',
      /** 无效量表 */
      invalidScale: '{min}에서 {max} 사이의 값을 선택해주세요',
      /** 文本过长 */
      textTooLong: '텍스트는 1000자를 초과할 수 없습니다',
      /** 不支持的问题类型 */
      unsupportedQuestionType: '지원되지 않는 질문 유형: {type}',
      /** 网络错误 */
      networkError: '네트워크 연결 오류, 인터넷 연결을 확인해주세요',
      /** 超时错误 */
      timeoutError: '요청 시간 초과, 다시 시도해주세요',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: '다시 시도',
      /** 上一题 */
      previous: '이전',
      /** 下一题 */
      next: '다음',
      /** 完成 */
      complete: '평가 완료',
      /** 保存 */
      save: '진행 상황 저장',
      /** 已保存 */
      saved: '저장됨',
      /** 暂停 */
      pause: '일시정지',
      /** 继续 */
      continue: '계속',
      /** 退出 */
      exit: '종료',
      /** 开始新评测 */
      startNew: '새 평가 시작',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: '활성',
        /** 暂停 */
        paused: '일시정지됨',
        /** 已完成 */
        completed: '완료됨',
        /** 已过期 */
        expired: '만료됨',
      },
      /** 自动保存状态 */
      autoSave: {
        /** 保存中 */
        saving: '저장 중...',
        /** 已保存 */
        saved: '자동 저장됨',
        /** 保存失败 */
        failed: '저장 실패',
        /** 最后保存时间 */
        lastSaved: '마지막 저장: {time}',
      },
      /** 会话警告 */
      warnings: {
        /** 会话即将过期 */
        expiring: '세션이 {minutes}분 후에 만료됩니다',
        /** 网络连接不稳定 */
        unstableConnection: '불안정한 네트워크 연결이 감지되었습니다',
        /** 数据同步失败 */
        syncFailed: '서버와 데이터 동기화에 실패했습니다',
      },
    },
    /** 问题验证 */
    validation: {
      /** 必填字段 */
      required: '이 필드는 필수입니다',
      /** 选择数量不足 */
      minSelections: '최소 {min}개의 옵션을 선택해주세요',
      /** 选择数量过多 */
      maxSelections: '최대 {max}개의 옵션만 선택해주세요',
      /** 文本长度不足 */
      minLength: '최소 {min}자를 입력해주세요',
      /** 文本长度过长 */
      maxLength: '텍스트는 {max}자를 초과할 수 없습니다',
      /** 数值范围错误 */
      outOfRange: '값은 {min}에서 {max} 사이여야 합니다',
    },
    /** 键盘快捷键 */
    shortcuts: {
      /** 下一题 */
      next: 'Enter 키를 눌러 다음 질문으로',
      /** 上一题 */
      previous: 'Shift+Enter 키를 눌러 이전 질문으로',
      /** 保存 */
      save: 'Ctrl+S 키를 눌러 저장',
      /** 暂停 */
      pause: 'Esc 키를 눌러 일시정지',
      /** 帮助 */
      help: 'F1 키를 눌러 도움말',
    },
  },
  /** 평가 실행 관련 번역 */
  execution: {
    /** 로딩 상태 */
    loading: '평가 로딩 중...',
    /** 일시정지 */
    pause: '일시정지',
    /** 진행상황 저장 */
    save: '진행상황 저장',
    /** 다음 질문 */
    next: '다음',
    /** 이전 질문 */
    previous: '이전',
    /** 평가 완료 */
    complete: '평가 완료',
    /** 소요 시간 */
    timeSpent: '소요 시간',
    /** 필수 */
    required: '* 필수',
    /** 질문 번호 */
    questionNumber: '질문',
    /** 총 질문 수 */
    totalQuestions: '문',
    /** 완료 상태 */
    completion: {
      /** 제목 */
      title: '평가 완료!',
      /** 메시지 */
      message: '결과를 분석 중...',
    },
    /** 일시정지 모달 */
    pauseModal: {
      /** 제목 */
      title: '평가 일시정지',
      /** 메시지 */
      message: '진행상황이 자동으로 저장되었습니다. 나중에 평가를 계속할 수 있습니다.',
      /** 계속 */
      continue: '평가 계속',
      /** 종료 */
      exit: '종료',
    },
    /** 오류 메시지 */
    errors: {
      /** 필수 필드 */
      required: '계속하기 전에 이 질문에 답해주세요.',
      /** 제출 실패 */
      submitFailed: '답변 제출에 실패했습니다. 다시 시도해주세요.',
      /** 로딩 실패 */
      loadFailed: '평가 로딩에 실패했습니다. 페이지를 새로고침하고 다시 시도해주세요.',
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 进度显示 */
    progress: {
      /** 进度文本 */
      text: '{current} / {total}',
      /** 完成百分比 */
      percentage: '{percentage}% 완료',
      /** 剩余时间 */
      timeRemaining: '예상 남은 시간: {time}',
    },
    /** 问题显示 */
    question: {
      /** 问题编号 */
      number: '질문 {current} / {total}',
      /** 必答标记 */
      required: '* 필수',
      /** 已选择数量 */
      selectedCount: '{count}개 항목 선택됨',
      /** 已选择值 */
      selectedValue: '현재 선택: {value}',
      /** 文本输入占位符 */
      textPlaceholder: '여기에 답변을 입력해주세요...',
      /** 字符计数 */
      characterCount: '{count}자 입력됨',
      /** 已输入文本 */
      textEntered: '답변 입력됨',
      /** 已回答 */
      answered: '답변 완료',
      /** 跳过 */
      skip: '이 질문 건너뛰기',
    },
    /** 导航控制 */
    navigation: {
      /** 上一题 */
      previous: '이전 질문',
      /** 下一题 */
      next: '다음 질문',
      /** 跳转到 */
      goTo: '질문 {number}로 이동',
      /** 问题列表 */
      questionList: '질문 목록',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: '진행 중',
        /** 暂停 */
        paused: '일시정지됨',
        /** 已完成 */
        completed: '완료됨',
      },
      /** 自动保存 */
      autoSave: {
        /** 保存中 */
        saving: '저장 중...',
        /** 已保存 */
        saved: '저장됨',
        /** 保存失败 */
        failed: '저장 실패',
      },
    },
    /** 结果显示 */
    results: {
      /** 分享选项 */
      share: {
        /** 分享结果 */
        title: '결과 공유',
        /** 复制链接 */
        copyLink: '링크 복사',
        /** 已复制 */
        copied: '클립보드에 복사됨',
        /** 下载PDF */
        downloadPdf: 'PDF 다운로드',
      },
      /** 图表交互 */
      charts: {
        /** 显示详情 */
        showDetails: '세부사항 표시',
        /** 隐藏详情 */
        hideDetails: '세부사항 숨기기',
        /** 切换视图 */
        toggleView: '보기 전환',
      },
    },
    /** 历史记录 */
    history: {
      /** 筛选器 */
      filters: {
        /** 应用筛选 */
        apply: '필터 적용',
        /** 清除筛选 */
        clear: '필터 지우기',
        /** 筛选选项 */
        options: '필터 옵션',
      },
      /** 排序 */
      sorting: {
        /** 按日期排序 */
        byDate: '날짜순 정렬',
        /** 按类型排序 */
        byType: '유형순 정렬',
        /** 按分数排序 */
        byScore: '점수순 정렬',
        /** 升序 */
        ascending: '오름차순',
        /** 降序 */
        descending: '내림차순',
      },
    },
    /** 问题类型特定交互 */
    questionTypes: {
      /** 单选题 */
      singleChoice: {
        /** 选择提示 */
        selectHint: '하나의 옵션을 선택하세요',
        /** 已选择 */
        selected: '선택됨',
      },
      /** 多选题 */
      multipleChoice: {
        /** 选择提示 */
        selectHint: '하나 이상의 옵션을 선택하세요',
        /** 最少选择 */
        minSelect: '최소 {min}개의 옵션을 선택하세요',
        /** 最多选择 */
        maxSelect: '최대 {max}개의 옵션을 선택하세요',
      },
      /** 量表题 */
      scale: {
        /** 拖拽提示 */
        dragHint: '드래그하여 값을 선택하세요',
        /** 点击提示 */
        clickHint: '클릭하여 값을 선택하세요',
        /** 当前值 */
        currentValue: '현재 값: {value}',
      },
      /** 文本题 */
      text: {
        /** 输入提示 */
        inputHint: '답변을 입력하세요',
        /** 字数统计 */
        wordCount: '{count}단어',
        /** 建议长度 */
        suggestedLength: '권장 길이: {min}-{max}단어',
      },
    },
    /** 辅助功能 */
    accessibility: {
      /** 屏幕阅读器提示 */
      screenReader: {
        /** 问题导航 */
        questionNavigation: '화살표 키를 사용하여 질문 간 이동',
        /** 进度信息 */
        progressInfo: '질문 {current}/{total}, {percentage}퍼센트 완료',
        /** 选项描述 */
        optionDescription: '옵션 {index}: {text}',
        /** 错误信息 */
        errorAnnouncement: '오류: {message}',
      },
      /** 键盘导航 */
      keyboard: {
        /** 导航提示 */
        navigationHint: 'Tab 키로 이동, Enter 키로 선택',
        /** 选择提示 */
        selectionHint: '스페이스 키로 옵션 선택/해제',
        /** 提交提示 */
        submitHint: 'Enter 키를 눌러 답변 제출',
      },
    },
  },
};

export default assessmentKo;
