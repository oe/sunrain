/**
 * 评测系统日语翻译内容
 */
import type { IAssessmentTranslations } from './types';

export const assessmentJa: IAssessmentTranslations = {
  pageTitle: 'メンタルヘルス評価',

  list: {
    title: 'メンタルヘルス評価',
    subtitle: '科学的な評価ツールを通じてメンタルヘルスの状態を理解し、個人に合わせた推奨事項とリソースを取得します',
    categories: {
      mental_health: 'メンタルヘルス評価',
      personality: '性格評価',
      stress: 'ストレス評価',
      mood: '気分評価'
    },
    categoryDescriptions: {
      mental_health: '潜在的なメンタルヘルスの問題を特定するのに役立つ専門的なメンタルヘルススクリーニングツール',
      personality: 'あなたの性格特性と行動パターンを理解する',
      stress: 'ストレスレベルと対処能力を評価する',
      mood: '感情状態と傾向を監視する'
    },
    startButton: '評価を開始',
    minutes: '分',
    questions: '問',
    activeSessions: {
      title: '{count}つの未完了の評価があります',
      message: 'クリックして評価を続行してください',
      continueLink: '評価を続行',
      lastActivity: '最後のアクティビティ',
      progress: '進捗'
    },
    quickActions: {
      title: 'クイックアクション',
      history: {
        title: '評価履歴',
        description: '過去の評価結果を表示'
      },
      trends: {
        title: 'トレンド分析',
        description: 'メンタルヘルストレンドを表示'
      },
      continue: {
        title: '評価を続行',
        description: '未完了の評価を完了'
      }
    },
    existingSession: {
      title: "未完了の評価",
      message: "未完了の評価があります。中断したところから続行するか、最初からやり直すことができます。",
      progress: "進捗",
      lastActivity: "最後の活動",
      questionsAnswered: "回答済み",
      continue: "評価を続行",
      restart: "最初からやり直す",
      restartWarning: "最初からやり直すと、これまでの回答がすべて削除されます。"
    },
    disclaimer: {
      title: '重要なお知らせ',
      message: 'これらの評価ツールはスクリーニングと自己理解のためのものであり、専門的なメンタルヘルス診断に代わるものではありません。苦痛を感じたり助けが必要な場合は、専門のメンタルヘルス専門家にご相談ください。'
    }
  },

  execution: {
    loading: '評価を読み込み中...',
    pause: '一時停止',
    save: '進捗を保存',
    next: '次へ',
    previous: '前へ',
    complete: '評価を完了',
    timeSpent: '経過時間',
    required: '* 必須',
    questionNumber: '質問',
    totalQuestions: '問',
    completion: {
      title: '評価完了！',
      message: '結果を分析中...'
    },
    pauseModal: {
      title: '評価を一時停止',
      message: '進捗は自動的に保存されました。後で評価を続行できます。',
      continue: '評価を続行',
      exit: '終了'
    },
    errors: {
      required: '続行する前にこの質問に答えてください。',
      submitFailed: '回答の送信に失敗しました。もう一度お試しください。',
      loadFailed: '評価の読み込みに失敗しました。ページを更新してもう一度お試しください。'
    }
  },

  results: {
    loading: '評価結果を読み込み中...',
    completedAt: '完了時刻',
    timeSpent: '経過時間',
    overallAssessment: '総合評価',
    detailedInterpretation: '詳細な解釈',
    scoreDistribution: 'スコア分布',
    riskAssessment: 'リスク評価',
    personalizedRecommendations: '個人向け推奨事項',
    recommendedResources: '推奨リソース',
    nextSteps: {
      title: '次のステップ',
      moreAssessments: {
        title: 'その他の評価',
        description: '他の評価ツールを探索'
      },
      startPractice: {
        title: '練習を開始',
        description: '関連するメンタルヘルス練習を試す'
      },
      browseResources: {
        title: 'リソースを閲覧',
        description: 'ヒーリングリソースライブラリを表示'
      }
    },
    actions: {
      share: '結果を共有',
      savePdf: 'PDFとして保存',
      viewHistory: '履歴を表示'
    },
    riskLevels: {
      high: {
        title: '注意が必要',
        message: '評価結果は専門的な助けが必要である可能性を示しています。メンタルヘルス専門家への相談やメンタルヘルスヘルプラインへの連絡を検討してください。'
      },
      medium: {
        title: '注意を推奨',
        message: '評価結果は注意が必要な分野があることを示しています。セルフケア対策の実施やサポートの求めることを検討してください。'
      },
      low: {
        title: '良好な状態',
        message: '評価結果は正常範囲内です。健康的な習慣を維持し続けてください。'
      }
    },
    disclaimer: {
      title: '重要なお知らせ',
      message: 'これらの評価結果は参考のためのものであり、専門的なメンタルヘルス診断に代わるものではありません。苦痛を感じたり助けが必要な場合は、専門のメンタルヘルス専門家にご相談ください。'
    }
  },

  history: {
    title: '評価履歴',
    subtitle: '過去の評価記録とトレンド分析を表示',
    statistics: {
      total: '総評価数',
      completed: '完了済み',
      averageTime: '平均時間',
      lastAssessment: '最後の評価'
    },
    filters: {
      assessmentType: '評価タイプ',
      timeRange: '時間範囲',
      riskLevel: 'リスクレベル',
      allTypes: 'すべてのタイプ',
      allTimes: 'すべての時間',
      allLevels: 'すべてのレベル',
      last7Days: '過去7日間',
      last30Days: '過去30日間',
      last3Months: '過去3ヶ月',
      lastYear: '過去1年',
      clearFilters: 'フィルターをクリア'
    },
    list: {
      title: '評価記録',
      viewDetails: '詳細を表示',
      share: '共有',
      delete: '削除',
      dimensions: '次元',
      today: '今日',
      daysAgo: '日前'
    },
    empty: {
      title: '評価記録がありません',
      message: 'まだ評価を完了していません',
      startFirst: '最初の評価を開始'
    },
    pagination: {
      showing: '表示中',
      to: 'から',
      of: 'の',
      records: '記録',
      previous: '前へ',
      next: '次へ'
    },
    actions: {
      export: 'データをエクスポート',
      newAssessment: '新しい評価'
    }
  },

  continue: {
    title: '評価を続行',
    subtitle: '未完了のメンタルヘルス評価を完了',
    loading: '未完了の評価を読み込み中...',
    noSessions: {
      title: '未完了の評価がありません',
      message: '現在続行する評価がありません',
      startNew: '新しい評価を開始'
    },
    session: {
      startedAt: '開始時刻',
      timeSpent: '経過時間',
      progress: '進捗',
      answered: '回答済み',
      estimatedRemaining: '推定残り時間',
      continueButton: '評価を続行',
      status: {
        active: '進行中',
        paused: '一時停止中'
      }
    },
    actions: {
      startNew: '新しい評価を開始',
      clearAll: 'すべての未完了評価をクリア'
    },
    confirmations: {
      deleteSession: 'この未完了の評価を削除してもよろしいですか？すべての進捗が失われます。',
      clearAll: 'すべての未完了の評価をクリアしてもよろしいですか？すべての進捗が失われます。'
    }
  },

  trends: {
    title: 'トレンド分析',
    subtitle: 'メンタルヘルストレンドと発達パターンを分析',
    loading: 'トレンドデータを読み込み中...',
    timeRange: {
      title: '時間範囲',
      last30Days: '過去30日間',
      last3Months: '過去3ヶ月',
      lastYear: '過去1年',
      allTime: 'すべての時間'
    },
    charts: {
      overallTrend: '全体的なトレンド',
      frequency: '評価頻度',
      riskTrend: 'リスクレベルの変化',
      categoryPerformance: 'カテゴリー別パフォーマンス'
    },
    insights: {
      title: 'トレンドインサイト',
      positive: 'ポジティブなトレンド',
      warning: '注意が必要',
      info: '安定'
    },
    statistics: {
      improvementTrend: '改善トレンド',
      stableDimensions: '安定した次元',
      attentionNeeded: '注意が必要'
    },
    noData: {
      title: 'トレンドデータがありません',
      message: 'トレンド分析を表示するには、少なくとも2つの評価を完了する必要があります',
      startAssessment: '評価を開始'
    },
    actions: {
      exportReport: 'トレンドレポートをエクスポート',
      newAssessment: '新しい評価'
    }
  },

  common: {
    title: 'タイトル',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    refresh: '更新',
    cancel: 'キャンセル',
    confirm: '確認',
    delete: '削除',
    save: '保存',
    share: '共有',
    export: 'エクスポート',
    riskLevels: {
      low: '低リスク',
      medium: '中リスク',
      high: '高リスク'
    },
    timeUnits: {
      seconds: '秒',
      minutes: '分',
      hours: '時間',
      days: '日'
    }
  }
};

export default assessmentJa;
