/**
 * 资源页面日文翻译内容
 */
import type { IResourcesTranslations } from './types';

export const resourcesJa: IResourcesTranslations = {
  page: {
    title: '癒しのリソース',
    subtitle: 'メンタルウェルネスのためのキュレーションされた音楽、映画、書籍',
    description: 'あなたのメンタルヘルスの旅をサポートし、困難な時期に慰めを提供する、慎重に選ばれた音楽、映画、書籍を発見してください。',
  },
  categories: {
    music: '音楽',
    movies: '映画',
    books: '書籍',
    all: 'すべて',
  },
  sections: {
    music: {
      title: '癒しの音楽',
      description: '心を落ち着かせ、ストレスを軽減するためにデザインされた癒しのメロディーと音。',
    },
    movies: {
      title: '励ましの映画',
      description: '希望、回復力、ポジティブな思考を刺激する映画。',
    },
    books: {
      title: 'ウェルネス書籍',
      description: 'メンタルヘルスのための洞察、戦略、慰めを提供する書籍。',
    },
  },
  filters: {
    title: 'リソースをフィルター',
    searchPlaceholder: 'リソースを検索...',
    filterByCategory: 'カテゴリーでフィルター',
    clearFilters: 'フィルターをクリア',
  },
  details: {
    author: '著者',
    director: '監督',
    artist: 'アーティスト',
    year: '年',
    viewDetails: '詳細を見る',
    close: '閉じる',
  },
  cta: {
    title: '癒しの旅を始める準備はできましたか？',
    description: '実用的なメンタルヘルス戦略のための包括的なセルフヘルプガイドを探索してください。',
    button: 'ガイドを閲覧',
  },
  links: {
    spotify: 'Spotify',
    youtube: 'YouTube',
    watch: '視聴',
    trailer: '予告編',
    amazon: 'Amazon',
    goodreads: 'Goodreads',
  },
  crisis: {
    title: '危機ホットライン',
    subtitle: '24時間365日 メンタルヘルスサポート',
    description: '国/地域別の専門的なメンタルヘルス危機サポートホットラインとリソースを見つけてください。これらのサービスは、困難な状況にある人々に無料で機密性の高いサポートを提供します。',
    emergency: {
      title: '🚨 緊急の危険がありますか？',
      description: '緊急の危険がある場合、または生命を脅かす緊急事態が発生している場合は、すぐに地元の緊急サービス（例：米国では911、日本では110）に電話してください。',
    },
    filters: {
      searchPlaceholder: '国またはホットライン名で検索...',
      selectRegion: '国/地域を選択',
      allRegions: 'すべての国/地域',
    },
    hotline: {
      phone: '電話',
      website: 'ウェブサイト',
      available: '利用可能',
      languages: '言語',
      call: '電話をかける',
      visitWebsite: 'ウェブサイトを訪問',
      available247: '24/7',
    },
    noResults: {
      title: 'ホットラインが見つかりません',
      description: '検索またはフィルター条件を調整してみてください。',
    },
    disclaimer: 'この情報は情報提供のみを目的としています。リストされたサービスを推奨または保証するものではありません。使用前に現在の連絡先情報を確認してください。',
    encouragement: {
      title: 'あなたは一人ではありません',
      message: '太陽が雨に出会う場所で、希望と癒しは常に手の届くところにあります。助けを求めることは、弱さではなく強さの表れです。',
    },
  },
};

export default resourcesJa;