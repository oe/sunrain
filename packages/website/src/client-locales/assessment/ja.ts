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
};

export default assessmentJa;
