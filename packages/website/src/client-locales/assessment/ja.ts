/**
 * Assessment 系统日语翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { IAssessmentTranslations } from './types';

export const assessmentJa: IAssessmentTranslations = {
  /** 評価リストページ */
  list: {
    title: 'メンタルヘルス評価',
    subtitle: '科学的な評価ツールを通じてメンタルヘルスの状態を理解し、個人に合わせた推奨事項とリソースを取得します',
    categories: {
      mental_health: 'メンタルヘルス評価',
      personality: '性格評価',
      stress: 'ストレス評価',
      mood: '気分評価',
    },
    categoryDescriptions: {
      mental_health: '潜在的なメンタルヘルスの問題を特定するのに役立つ専門的なメンタルヘルススクリーニングツール',
      personality: 'あなたの性格特性と行動パターンを理解する',
      stress: 'ストレスレベルと対処能力を評価する',
      mood: '感情状態と傾向を監視する',
    },
    startButton: '評価を開始',
    minutes: '分',
    questions: '問',
    activeSessions: {
      title: '{count}つの未完了の評価があります',
      message: 'クリックして評価を続行してください',
      continueLink: '評価を続行',
      lastActivity: '最後のアクティビティ',
      progress: '進捗',
    },
    quickActions: {
      title: 'クイックアクション',
      history: {
        title: '評価履歴',
        description: '過去の評価結果を表示',
      },
      trends: {
        title: 'トレンド分析',
        description: 'メンタルヘルストレンドを表示',
      },
      continue: {
        title: '評価を続行',
        description: '未完了の評価を完了',
      },
    },
    disclaimer: {
      title: '重要なお知らせ',
      message: 'これらの評価ツールはスクリーニングと自己理解のためのものであり、専門的なメンタルヘルス診断に代わるものではありません。苦痛を感じたり助けが必要な場合は、専門のメンタルヘルス専門家にご相談ください。',
    },
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
        description: '他の評価ツールを探索',
      },
      startPractice: {
        title: '練習を開始',
        description: '関連するメンタルヘルス練習を試す',
      },
      browseResources: {
        title: 'リソースを閲覧',
        description: 'ヒーリングリソースライブラリを表示',
      },
    },
    actions: {
      share: '結果を共有',
      savePdf: 'PDFとして保存',
      viewHistory: '履歴を表示',
    },
    riskLevels: {
      high: {
        title: '注意が必要',
        message: '評価結果は専門的な助けが必要である可能性を示しています。メンタルヘルス専門家への相談やメンタルヘルスヘルプラインへの連絡を検討してください。',
      },
      medium: {
        title: '注意を推奨',
        message: '評価結果は注意が必要な分野があることを示しています。セルフケア対策の実施やサポートの求めることを検討してください。',
      },
      low: {
        title: '良好な状態',
        message: '評価結果は正常範囲内です。健康的な習慣を維持し続けてください。',
      },
    },
    disclaimer: {
      title: '重要なお知らせ',
      message: 'これらの評価結果は参考のためのものであり、専門的なメンタルヘルス診断に代わるものではありません。苦痛を感じたり助けが必要な場合は、専門のメンタルヘルス専門家にご相談ください。',
    },
  },

  history: {
    title: '評価履歴',
    subtitle: '過去の評価記録とトレンド分析を表示',
    statistics: {
      total: '総評価数',
      completed: '完了済み',
      averageTime: '平均時間',
      lastAssessment: '最後の評価',
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
      clearFilters: 'フィルターをクリア',
    },
    list: {
      title: '評価記録',
      viewDetails: '詳細を表示',
      share: '共有',
      delete: '削除',
      dimensions: '次元',
      today: '今日',
      daysAgo: '日前',
    },
    empty: {
      title: '評価記録がありません',
      message: 'まだ評価を完了していません',
      startFirst: '最初の評価を開始',
    },
    pagination: {
      showing: '表示中',
      to: 'から',
      of: 'の',
      records: '記録',
      previous: '前へ',
      next: '次へ',
    },
    actions: {
      export: 'データをエクスポート',
      newAssessment: '新しい評価',
    },
  },

  continue: {
    title: '評価を続行',
    subtitle: '未完了のメンタルヘルス評価を完了',
    loading: '未完了の評価を読み込み中...',
    noSessions: {
      title: '未完了の評価がありません',
      message: '現在続行する評価がありません',
      startNew: '新しい評価を開始',
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
        paused: '一時停止中',
      },
    },
    actions: {
      startNew: '新しい評価を開始',
      clearAll: 'すべての未完了評価をクリア',
    },
    confirmations: {
      deleteSession: 'この未完了の評価を削除してもよろしいですか？すべての進捗が失われます。',
      clearAll: 'すべての未完了の評価をクリアしてもよろしいですか？すべての進捗が失われます。',
    },
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
      allTime: 'すべての時間',
    },
    charts: {
      overallTrend: '全体的なトレンド',
      frequency: '評価頻度',
      riskTrend: 'リスクレベルの変化',
      categoryPerformance: 'カテゴリー別パフォーマンス',
    },
    insights: {
      title: 'トレンドインサイト',
      positive: 'ポジティブなトレンド',
      warning: '注意が必要',
      info: '安定',
    },
    statistics: {
      improvementTrend: '改善トレンド',
      stableDimensions: '安定した次元',
      attentionNeeded: '注意が必要',
    },
    noData: {
      title: 'トレンドデータがありません',
      message: 'トレンド分析を表示するには、少なくとも2つの評価を完了する必要があります',
      startAssessment: '評価を開始',
    },
    actions: {
      exportReport: 'トレンドレポートをエクスポート',
      newAssessment: '新しい評価',
    },
  },

  common: {
    title: 'メンタルヘルス評価',
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
      high: '高リスク',
    },
    timeUnits: {
      seconds: '秒',
      minutes: '分',
      hours: '時間',
      days: '日',
    },
  },
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 评测加载 */
      assessment: '評価を読み込み中...',
      /** 翻译加载 */
      translations: '翻訳を読み込み中...',
      /** 问题加载 */
      question: '質問を読み込み中...',
      /** 结果分析 */
      analysis: '結果を分析中...',
      /** 历史记录 */
      history: '履歴を読み込み中...',
    },
    /** 错误信息 */
    errors: {
      /** 错误标题 */
      title: 'エラーが発生しました',
      /** 会话启动失败 */
      sessionStartFailed: '評価セッションを開始できません',
      /** 初始化失败 */
      initializationFailed: '初期化エラー',
      /** 提交失败 */
      submitFailed: '回答の送信に失敗しました、再試行してください',
      /** 分析失败 */
      analysisFailed: '結果の分析に失敗しました',
      /** 无数据 */
      noData: '評価データの読み込みに失敗しました',
      /** 无效量表 */
      invalidScale: '{min}から{max}の間の値を選択してください',
      /** 文本过长 */
      textTooLong: 'テキストは1000文字を超えることはできません',
      /** 不支持的问题类型 */
      unsupportedQuestionType: 'サポートされていない質問タイプ: {type}',
      /** 网络错误 */
      networkError: 'ネットワーク接続エラー、インターネット接続を確認してください',
      /** 超时错误 */
      timeoutError: 'リクエストタイムアウト、再試行してください',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: '再試行',
      /** 上一题 */
      previous: '前へ',
      /** 下一题 */
      next: '次へ',
      /** 完成 */
      complete: '評価を完了',
      /** 保存 */
      save: '進捗を保存',
      /** 已保存 */
      saved: '保存済み',
      /** 暂停 */
      pause: '一時停止',
      /** 继续 */
      continue: '続行',
      /** 退出 */
      exit: '終了',
      /** 开始新评测 */
      startNew: '新しい評価を開始',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: 'アクティブ',
        /** 暂停 */
        paused: '一時停止中',
        /** 已完成 */
        completed: '完了',
        /** 已过期 */
        expired: '期限切れ',
      },
      /** 自动保存状态 */
      autoSave: {
        /** 保存中 */
        saving: '保存中...',
        /** 已保存 */
        saved: '自動保存',
        /** 保存失败 */
        failed: '保存に失敗',
        /** 最后保存时间 */
        lastSaved: '最後の保存: {time}',
      },
      /** 会话警告 */
      warnings: {
        /** 会话即将过期 */
        expiring: 'セッションは{minutes}分後に期限切れになります',
        /** 网络连接不稳定 */
        unstableConnection: '不安定なネットワーク接続が検出されました',
        /** 数据同步失败 */
        syncFailed: 'サーバーとのデータ同期に失敗しました',
      },
    },
    /** 问题验证 */
    validation: {
      /** 必填字段 */
      required: 'この項目は必須です',
      /** 选择数量不足 */
      minSelections: '少なくとも{min}個のオプションを選択してください',
      /** 选择数量过多 */
      maxSelections: '{max}個以下のオプションを選択してください',
      /** 文本长度不足 */
      minLength: '少なくとも{min}文字入力してください',
      /** 文本长度过长 */
      maxLength: 'テキストは{max}文字を超えることはできません',
      /** 数值范围错误 */
      outOfRange: '値は{min}から{max}の間である必要があります',
    },
    /** 键盘快捷键 */
    shortcuts: {
      /** 下一题 */
      next: 'Enterキーで次の質問へ',
      /** 上一题 */
      previous: 'Shift+Enterキーで前の質問へ',
      /** 保存 */
      save: 'Ctrl+Sキーで保存',
      /** 暂停 */
      pause: 'Escキーで一時停止',
      /** 帮助 */
      help: 'F1キーでヘルプ',
    },
  },
  /** 評価実行関連の翻訳 */
  execution: {
    /** 読み込み状態 */
    loading: '評価を読み込み中...',
    /** 一時停止 */
    pause: '一時停止',
    /** 進捗を保存 */
    save: '進捗を保存',
    /** 次の質問 */
    next: '次へ',
    /** 前の質問 */
    previous: '前へ',
    /** 評価を完了 */
    complete: '評価を完了',
    /** 経過時間 */
    timeSpent: '経過時間',
    /** 必須 */
    required: '* 必須',
    /** 質問番号 */
    questionNumber: '質問',
    /** 総質問数 */
    totalQuestions: '問',
    /** 完了状態 */
    completion: {
      /** タイトル */
      title: '評価完了！',
      /** メッセージ */
      message: '結果を分析中...',
    },
    /** 一時停止モーダル */
    pauseModal: {
      /** タイトル */
      title: '評価を一時停止',
      /** メッセージ */
      message: '進捗は自動的に保存されました。後で評価を続けることができます。',
      /** 続行 */
      continue: '評価を続行',
      /** 終了 */
      exit: '終了',
    },
    /** エラーメッセージ */
    errors: {
      /** 必須フィールド */
      required: '続行する前にこの質問に答えてください。',
      /** 送信失敗 */
      submitFailed: '回答の送信に失敗しました。もう一度お試しください。',
      /** 読み込み失敗 */
      loadFailed: '評価の読み込みに失敗しました。ページを更新してもう一度お試しください。',
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 进度显示 */
    progress: {
      /** 进度文本 */
      text: '{current} / {total}',
      /** 完成百分比 */
      percentage: '{percentage}%完了',
      /** 剩余时间 */
      timeRemaining: '推定残り時間: {time}',
    },
    /** 问题显示 */
    question: {
      /** 问题编号 */
      number: '質問 {current} / {total}',
      /** 必答标记 */
      required: '* 必須',
      /** 已选择数量 */
      selectedCount: '{count}項目が選択されました',
      /** 已选择值 */
      selectedValue: '現在の選択: {value}',
      /** 文本输入占位符 */
      textPlaceholder: 'こちらに回答を入力してください...',
      /** 字符计数 */
      characterCount: '{count}文字入力されました',
      /** 已输入文本 */
      textEntered: '回答が入力されました',
      /** 已回答 */
      answered: '回答済み',
      /** 跳过 */
      skip: 'この質問をスキップ',
    },
    /** 导航控制 */
    navigation: {
      /** 上一题 */
      previous: '前の質問',
      /** 下一题 */
      next: '次の質問',
      /** 跳转到 */
      goTo: '質問{number}へ移動',
      /** 问题列表 */
      questionList: '質問リスト',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: '進行中',
        /** 暂停 */
        paused: '一時停止中',
        /** 已完成 */
        completed: '完了',
      },
      /** 自动保存 */
      autoSave: {
        /** 保存中 */
        saving: '保存中...',
        /** 已保存 */
        saved: '保存済み',
        /** 保存失败 */
        failed: '保存に失敗',
      },
    },
    /** 结果显示 */
    results: {
      /** 分享选项 */
      share: {
        /** 分享结果 */
        title: '結果を共有',
        /** 复制链接 */
        copyLink: 'リンクをコピー',
        /** 已复制 */
        copied: 'クリップボードにコピーしました',
        /** 下载PDF */
        downloadPdf: 'PDFをダウンロード',
      },
      /** 图表交互 */
      charts: {
        /** 显示详情 */
        showDetails: '詳細を表示',
        /** 隐藏详情 */
        hideDetails: '詳細を非表示',
        /** 切换视图 */
        toggleView: 'ビューを切り替え',
      },
    },
    /** 历史记录 */
    history: {
      /** 筛选器 */
      filters: {
        /** 应用筛选 */
        apply: 'フィルターを適用',
        /** 清除筛选 */
        clear: 'フィルターをクリア',
        /** 筛选选项 */
        options: 'フィルターオプション',
      },
      /** 排序 */
      sorting: {
        /** 按日期排序 */
        byDate: '日付で並び替え',
        /** 按类型排序 */
        byType: 'タイプで並び替え',
        /** 按分数排序 */
        byScore: 'スコアで並び替え',
        /** 升序 */
        ascending: '昇順',
        /** 降序 */
        descending: '降順',
      },
    },
    /** 问题类型特定交互 */
    questionTypes: {
      /** 单选题 */
      singleChoice: {
        /** 选择提示 */
        selectHint: '1つのオプションを選択',
        /** 已选择 */
        selected: '選択済み',
      },
      /** 多选题 */
      multipleChoice: {
        /** 选择提示 */
        selectHint: '1つ以上のオプションを選択',
        /** 最少选择 */
        minSelect: '少なくとも{min}個のオプションを選択',
        /** 最多选择 */
        maxSelect: '最大{max}個のオプションを選択',
      },
      /** 量表题 */
      scale: {
        /** 拖拽提示 */
        dragHint: 'ドラッグして値を選択',
        /** 点击提示 */
        clickHint: 'クリックして値を選択',
        /** 当前值 */
        currentValue: '現在の値: {value}',
      },
      /** 文本题 */
      text: {
        /** 输入提示 */
        inputHint: '回答を入力してください',
        /** 字数统计 */
        wordCount: '{count}語',
        /** 建议长度 */
        suggestedLength: '推奨長さ: {min}-{max}語',
      },
    },
    /** 辅助功能 */
    accessibility: {
      /** 屏幕阅读器提示 */
      screenReader: {
        /** 问题导航 */
        questionNavigation: '矢印キーで質問間を移動',
        /** 进度信息 */
        progressInfo: '質問{current}/{total}、{percentage}パーセント完了',
        /** 选项描述 */
        optionDescription: 'オプション{index}: {text}',
        /** 错误信息 */
        errorAnnouncement: 'エラー: {message}',
      },
      /** 键盘导航 */
      keyboard: {
        /** 导航提示 */
        navigationHint: 'Tabキーで移動、Enterキーで選択',
        /** 选择提示 */
        selectionHint: 'スペースキーでオプションを選択/選択解除',
        /** 提交提示 */
        submitHint: 'Enterキーで回答を送信',
      },
    },
  },
};

export default assessmentJa;
