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
  },
};

export default assessmentJa;
