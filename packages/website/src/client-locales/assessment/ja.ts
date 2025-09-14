/**
 * Assessment 系统日语翻译内容 (CSR)
 * 包含实际使用的翻译键，匹配组件中的client前缀结构
 */
import type { IAssessmentTranslations } from './types';

export const assessmentJa: IAssessmentTranslations = {
  assessment: {
    title: 'メンタルヘルス評価',
  },

  loading: {
    default: '読み込み中...',
    assessment: '評価を読み込み中...',
  },

  errors: {
    title: 'エラー',
    initializationFailed: '初期化エラー',
    sessionStartFailed: '評価セッションを開始できません',
    noData: '評価データの読み込みに失敗しました',
    validationFailed: '検証に失敗しました',
    unsupportedQuestionType: 'サポートされていない質問タイプ: {type}',
    cannotContinue: '続行できません',
    continueFailed: '続行に失敗しました',
    deleteFailed: '削除に失敗しました',
    clearFailed: 'クリアに失敗しました',
    loadFailed: '読み込みに失敗しました',
    loadFailedMessage: 'データの読み込みで問題が発生しました',
    boundary: {
      title: 'アプリケーションエラー',
      message: '申し訳ございませんが、アプリケーションでエラーが発生しました。',
      details: 'エラー詳細',
      retry: '再試行',
      goHome: 'ホームに戻る',
    },
  },

  question: {
    number: '質問 {number}',
    required: '必須',
    selectedCount: '{count}個選択済み',
    selectedValue: '選択済み: {value}',
    textPlaceholder: '回答を入力してください...',
    characterCount: '{count}文字',
    textEntered: 'テキスト入力済み',
    answered: '回答済み',
  },

  questionList: {
    title: '質問リスト',
    progress: '進捗: {current}/{total}',
    questionNumber: '質問 {number}',
    completed: '完了',
    remaining: '残り',
  },

  continue: {
    loading: '未完了の評価を読み込み中...',
  },

  list: {
    activeSessions: {
      title: '{count}つの未完了の評価があります',
      continueLink: '評価を続行',
      lastActivity: '最後のアクティビティ',
      progress: '進捗',
    },
  },

  progress: {
    text: '{current} / {total}',
  },

  validation: {
    checking: '検証中...',
    withWarnings: '警告ありで検証中...',
  },

  execution: {
    errors: {
      submitFailed: '送信に失敗しました',
      required: 'この項目は必須です',
    },
    completion: {
      title: '評価完了',
      message: '結果を生成中...',
    },
    pauseModal: {
      title: '評価を一時停止',
      message: '評価を一時停止してもよろしいですか？',
      continue: '続行',
      exit: '終了',
    },
    navigation: {
      previous: '前へ',
      next: '次へ',
      submit: '送信',
      save: '保存',
      submitting: '送信中...',
    },
    pause: '一時停止',
    questionNumber: '質問 {number}',
    timeSpent: '経過時間',
    complete: '完了',
  },

  results: {
    loading: '評価結果を読み込み中...',
    completedAt: '完了時刻',
    timeSpent: '経過時間',
    overallAssessment: '総合評価',
    detailedInterpretation: '詳細な解釈',
    scoreDistribution: 'スコア分布',
    riskAssessment: 'リスク評価',
    personalizedRecommendations: '個別推奨事項',
    recommendedResources: '推奨リソース',
    nextSteps: {
      title: '次のステップ',
      moreAssessments: {
        title: 'その他の評価',
        description: '他の評価ツールを探索'
      },
      startPractice: {
        title: '練習を開始',
        description: '関連するメンタルヘルス実践を試す'
      },
      browseResources: {
        title: 'リソースを閲覧',
        description: 'ヒーリングリソースライブラリを表示'
      }
    },
    actions: {
      share: '結果を共有',
      savePdf: 'PDFとして保存',
      viewHistory: '履歴を表示',
      backToAssessments: '評価に戻る'
    },
    riskLevels: {
      high: {
        title: '注意が必要',
        message: '評価結果は専門的な支援が必要である可能性を示しています。メンタルヘルス専門家への相談をご検討ください。'
      },
      medium: {
        title: '注意推奨',
        message: '評価結果は注意が必要な領域があることを示しています。セルフケア対策の実施をご検討ください。'
      },
      low: {
        title: '良好な状態',
        message: '評価結果は正常範囲内です。健康的な習慣を継続してください。'
      }
    },
    disclaimer: {
      title: '重要なお知らせ',
      message: 'この評価結果は参考のためのものであり、専門的なメンタルヘルス診断に代わるものではありません。'
    },
    quickActions: 'クイックアクション',
    noResultFound: '評価結果が見つかりません',
    noResultData: '評価データが見つかりません'
  },

  actions: {
    retry: '再試行',
    goBack: '戻る',
    refresh: '更新',
    startNew: '新しい評価を開始',
    continue: '続行',
  },

  questionnaireInfo: {
    description: '説明',
    purpose: '目的',
    whatToExpect: '期待できること',
    professionalBackground: '専門的背景',
    tags: 'タグ',
    questions: '質問',
    minutes: '分',
    timeEstimate: {
      lessThanMinute: '1分未満',
      oneMinute: '1分',
      minutes: '{minutes}分',
    },
    difficulty: {
      beginner: '初級',
      intermediate: '中級',
      advanced: '上級',
    },
    steps: {
      step1: '{count}の質問に正直に答えてください（約{time}分かかります）',
      step2: 'あなたの回答は検証済みの採点方法を使用して分析されます',
      step3: '個人化された結果と推奨事項を受け取ります',
    },
    validated: '臨床的に検証された評価',
    mentalHealthAssessment: 'メンタルヘルス評価',
    purposeDescription: 'この評価は症状を特定し、あなたのメンタルヘルス状態の理解を導く洞察を提供するのに役立ちます。',
    validatedDescription: 'この評価は科学的に検証された方法と採点システムを使用しています。',
    privacy: {
      title: 'プライバシーとデータセキュリティ',
      message: 'あなたの回答はデバイスにローカルに保存され、第三者と共有されることはありません。',
    },
    startAssessment: '評価を開始',
    starting: '開始中...',
  },

  questionnaireCard: {
    featured: '注目',
    minutes: '分',
    questions: '質問',
    difficulty: {
      beginner: '初級',
      intermediate: '中級',
      advanced: '上級',
    },
    validated: '検証済み',
    viewHistory: '履歴を表示',
    startAssessment: '評価を開始',
  },

  existingSession: {
    title: '未完了の評価',
    progress: '進捗',
    lastActivity: '最後のアクティビティ',
    questionsAnswered: '回答済み',
    message: '未完了の評価があります。中断したところから続けるか、最初からやり直すことができます。',
    continue: '評価を続ける',
    restart: '最初からやり直す',
    restartWarning: '最初からやり直すと、以前の回答がすべて削除されます。',
  },

  common: {
    loading: '読み込み中...',
    cancel: 'キャンセル',
    close: '閉じる',
    save: '保存',
    delete: '削除',
    edit: '編集',
    confirm: '確認',
    yes: 'はい',
    no: 'いいえ',
    error: 'エラー',
    showing: '表示中',
    to: 'から',
    of: 'の',
    results: '結果',
    riskLevels: {
      low: '低リスク',
      medium: '中リスク',
      high: '高リスク',
    },
    timeUnits: {
      seconds: '秒',
      minutes: '分',
    },
  },

  history: {
    stats: {
      total: '合計',
      averageTime: '平均時間',
      lastAssessment: '最後の評価',
    },
    list: {
      dimensions: '次元',
      viewDetails: '詳細を見る',
      share: '共有',
      delete: '削除',
    },
    filters: {
      type: 'タイプ',
      timeRange: '時間範囲',
      riskLevel: 'リスクレベル',
    },
  },

  status: {
    active: 'アクティブ',
    paused: '一時停止',
  },

  labels: {
    unknownAssessment: '不明な評価',
    startTime: '開始時間',
    timeSpent: '経過時間',
    answered: '回答済み',
    questions: '質問',
    estimatedRemaining: '推定残り時間',
  },

  time: {
    minutes: '分',
  },

  messages: {
    deleted: '削除されました',
    clearedCount: '{count}件クリアされました',
    noActiveSessions: 'アクティブなセッションがありません',
    noActiveSessionsMessage: 'アクティブな評価セッションがありません',
  },
};

export default assessmentJa;
