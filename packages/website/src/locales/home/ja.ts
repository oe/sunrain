/**
 * 首页日语翻译内容
 */
import type { IHomeTranslations } from './types';

export const homeJa: IHomeTranslations = {
  hero: {
    title: 'あなたのメンタルヘルスの旅はここから始まります',
    subtitle: 'より良いメンタルウェルビーイングのためのツール、リソース、ガイダンスを発見',
    tagline: '太陽が雨と出会う場所',
    description: 'あなたの心のための温かく安全な空間。🤗',
    selfCheckButton: '🧠 セルフチェックを開始',
    quickRelaxButton: '🎧 クイックリラックス',
  },
  features: {
    title: 'あなたの心の旅の出発点',
    subtitle: '丁寧に設計された6つの穏やかな健康への道',
    selfCheck: {
      title: 'セルフチェック',
      description: 'メンタルヘルスの自己評価（ストレス、不安、うつ病、自尊心など）',
      button: 'チェックを開始 →',
    },
    dailyPractice: {
      title: '日常練習',
      description: 'マインドフルネストレーニング、呼吸法、精神的回復力の構築',
      button: '練習を始める →',
    },
    quickRelief: {
      title: 'クイックリリーフ',
      description: 'ホワイトノイズ、リラクゼーションゲーム、インタラクティブな呼吸エクササイズ',
      button: '緩和を見つける →',
    },
    healingLibrary: {
      title: 'ヒーリングライブラリー',
      description: '厳選された音楽、映画、ポッドキャスト、癒しのための書籍推薦',
      button: '探索する →',
    },
    psychologyWiki: {
      title: '心理学ウィキ',
      description: '心理学的知識の百科事典、一般的なメンタルヘルスの問題を説明',
      button: 'もっと学ぶ →',
    },
    supportHotline: {
      title: 'サポートホットライン',
      description: 'グローバルなメンタルヘルスヘルプラインとローカルな相談リソース',
      button: '助けを得る →',
    },
  },
  userVoices: {
    title: 'ユーザーの声',
    subtitle: '私たちのコミュニティからのストーリー',
    testimonials: [
      {
        text: 'この場所は家のように感じました。',
        author: '匿名ユーザー',
      },
      {
        text: 'セルフチェックで自分が一人じゃないと気づきました。',
        author: 'コミュニティメンバー',
      },
      {
        text: '本当に役立つリソースをついに見つけました。',
        author: '感謝する訪問者',
      },
      {
        text: 'マインドフルネスの練習が私の日常を変えました。',
        author: '定期ユーザー',
      },
    ],
    feelSameButton: '❤️ 同じ気持ちです',
  },
  cta: {
    title: '癒しの旅を始める準備はできていますか？',
    description: 'あなたは一人ではありません。健康への最初の一歩を踏み出しましょう。',
    submitStoryButton: '📝 あなたのストーリーを投稿',
    mindfulnessButton: '🧘 マインドフルネスセッションを試す',
  },
};

export default homeJa;