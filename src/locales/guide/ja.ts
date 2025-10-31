/**
 * 指南页面日文翻译内容
 */
import type { IGuideTranslations } from './types';

export const guideJa: IGuideTranslations = {
  page: {
    title: 'メンタルヘルス セルフヘルプガイド',
    subtitle: '不安、睡眠、感情管理のための実用的なリソース',
    description: '不安、うつ病、睡眠問題、感情調節をカバーする包括的なメンタルヘルスガイドのコレクションをご覧ください。',
  },
  list: {
    viewAll: 'すべてのガイドを見る',
    noGuides: '現在利用可能なガイドはありません。',
    loading: 'ガイドを読み込み中...',
    featured: '注目のガイド',
    allGuides: 'すべてのガイド',
    featuredTag: '注目',
  },
  detail: {
    publishedOn: '公開日',
    updatedOn: '更新日',
    author: '著者',
    tags: 'タグ',
    tableOfContents: '目次',
    shareGuide: 'このガイドを共有',
  },
  navigation: {
    previous: '前へ',
    next: '次へ',
    backToGuides: 'ガイド一覧に戻る',
  },
  actions: {
    readMore: 'もっと読む',
    backTo: '戻る',
    print: '印刷',
    share: '共有',
  },
  help: {
    needMoreHelp: 'さらなるサポートが必要ですか？',
    helpDescription: 'メンタルヘルスの危機に対処している場合や即座のサポートが必要な場合は、躊躇せずに専門的な助けを求めてください。',
    exploreResources: 'リソースを探索',
    getEmergencyHelp: '緊急サポートを受ける',
  },
  empty: {
    noGuidesAvailable: '利用可能なガイドがありません',
    emptyDescription: '新しいメンタルヘルスガイドとリソースについては、後でもう一度確認してください。',
  },
};

export default guideJa;