/**
 * Assessment 系统日语翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { IAssessmentTranslations } from './types';

export const assessmentJa: IAssessmentTranslations = {
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
