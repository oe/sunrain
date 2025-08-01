/**
 * Assessment 系统西班牙语翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { IAssessmentTranslations } from './types';

export const assessmentEs: IAssessmentTranslations = {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 评测加载 */
      assessment: 'Cargando evaluación...',
      /** 翻译加载 */
      translations: 'Cargando traducciones...',
      /** 问题加载 */
      question: 'Cargando pregunta...',
      /** 结果分析 */
      analysis: 'Analizando resultados...',
      /** 历史记录 */
      history: 'Cargando historial...',
    },
    /** 错误信息 */
    errors: {
      /** 错误标题 */
      title: 'Error Ocurrido',
      /** 会话启动失败 */
      sessionStartFailed: 'No se pudo iniciar la sesión de evaluación',
      /** 初始化失败 */
      initializationFailed: 'Error de inicialización',
      /** 提交失败 */
      submitFailed: 'Error al enviar respuesta, por favor intente de nuevo',
      /** 分析失败 */
      analysisFailed: 'Error en el análisis de resultados',
      /** 无数据 */
      noData: 'Error al cargar datos de evaluación',
      /** 无效量表 */
      invalidScale: 'Por favor selecciona un valor entre {min} y {max}',
      /** 文本过长 */
      textTooLong: 'El texto no puede exceder 1000 caracteres',
      /** 不支持的问题类型 */
      unsupportedQuestionType: 'Tipo de pregunta no soportado: {type}',
      /** 网络错误 */
      networkError: 'Error de conexión de red, por favor verifique su conexión a internet',
      /** 超时错误 */
      timeoutError: 'Tiempo de espera agotado, por favor intente de nuevo',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: 'Reintentar',
      /** 上一题 */
      previous: 'Anterior',
      /** 下一题 */
      next: 'Siguiente',
      /** 完成 */
      complete: 'Completar Evaluación',
      /** 保存 */
      save: 'Guardar Progreso',
      /** 已保存 */
      saved: 'Guardado',
      /** 暂停 */
      pause: 'Pausar',
      /** 继续 */
      continue: 'Continuar',
      /** 退出 */
      exit: 'Salir',
      /** 开始新评测 */
      startNew: 'Comenzar Nueva Evaluación',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: 'Activo',
        /** 暂停 */
        paused: 'Pausado',
        /** 已完成 */
        completed: 'Completado',
        /** 已过期 */
        expired: 'Expirado',
      },
      /** 自动保存状态 */
      autoSave: {
        /** 保存中 */
        saving: 'Guardando...',
        /** 已保存 */
        saved: 'Guardado automáticamente',
        /** 保存失败 */
        failed: 'Error al guardar',
        /** 最后保存时间 */
        lastSaved: 'Último guardado: {time}',
      },
      /** 会话警告 */
      warnings: {
        /** 会话即将过期 */
        expiring: 'La sesión expirará en {minutes} minutos',
        /** 网络连接不稳定 */
        unstableConnection: 'Conexión de red inestable detectada',
        /** 数据同步失败 */
        syncFailed: 'Error al sincronizar datos con el servidor',
      },
    },
    /** 问题验证 */
    validation: {
      /** 必填字段 */
      required: 'Este campo es obligatorio',
      /** 选择数量不足 */
      minSelections: 'Por favor seleccione al menos {min} opciones',
      /** 选择数量过多 */
      maxSelections: 'Por favor seleccione no más de {max} opciones',
      /** 文本长度不足 */
      minLength: 'Por favor ingrese al menos {min} caracteres',
      /** 文本长度过长 */
      maxLength: 'El texto no puede exceder {max} caracteres',
      /** 数值范围错误 */
      outOfRange: 'El valor debe estar entre {min} y {max}',
    },
    /** 键盘快捷键 */
    shortcuts: {
      /** 下一题 */
      next: 'Presione Enter para la siguiente pregunta',
      /** 上一题 */
      previous: 'Presione Shift+Enter para la pregunta anterior',
      /** 保存 */
      save: 'Presione Ctrl+S para guardar',
      /** 暂停 */
      pause: 'Presione Esc para pausar',
      /** 帮助 */
      help: 'Presione F1 para ayuda',
    },
  },
  /** Traducciones relacionadas con la ejecución de evaluaciones */
  execution: {
    /** Estados de carga */
    loading: 'Cargando evaluación...',
    /** Pausar */
    pause: 'Pausar',
    /** Guardar progreso */
    save: 'Guardar Progreso',
    /** Siguiente pregunta */
    next: 'Siguiente',
    /** Pregunta anterior */
    previous: 'Anterior',
    /** Completar evaluación */
    complete: 'Completar Evaluación',
    /** Tiempo transcurrido */
    timeSpent: 'Tiempo Transcurrido',
    /** Requerido */
    required: '* Requerido',
    /** Número de pregunta */
    questionNumber: 'Pregunta',
    /** Total de preguntas */
    totalQuestions: 'preguntas',
    /** Estado de finalización */
    completion: {
      /** Título */
      title: '¡Evaluación Completa!',
      /** Mensaje */
      message: 'Analizando sus resultados...',
    },
    /** Modal de pausa */
    pauseModal: {
      /** Título */
      title: 'Pausar Evaluación',
      /** Mensaje */
      message: 'Su progreso se ha guardado automáticamente. Puede continuar la evaluación más tarde.',
      /** Continuar */
      continue: 'Continuar Evaluación',
      /** Salir */
      exit: 'Salir',
    },
    /** Mensajes de error */
    errors: {
      /** Campo requerido */
      required: 'Por favor responda esta pregunta antes de continuar.',
      /** Envío fallido */
      submitFailed: 'Error al enviar respuesta, por favor intente de nuevo.',
      /** Carga fallida */
      loadFailed: 'Error al cargar evaluación, por favor actualice e intente de nuevo.',
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 进度显示 */
    progress: {
      /** 进度文本 */
      text: '{current} / {total}',
      /** 完成百分比 */
      percentage: '{percentage}% completado',
      /** 剩余时间 */
      timeRemaining: 'Tiempo estimado restante: {time}',
    },
    /** 问题显示 */
    question: {
      /** 问题编号 */
      number: 'Pregunta {current} de {total}',
      /** 必答标记 */
      required: '* Requerido',
      /** 已选择数量 */
      selectedCount: '{count} elementos seleccionados',
      /** 已选择值 */
      selectedValue: 'Selección actual: {value}',
      /** 文本输入占位符 */
      textPlaceholder: 'Por favor ingrese su respuesta aquí...',
      /** 字符计数 */
      characterCount: '{count} caracteres ingresados',
      /** 已输入文本 */
      textEntered: 'Respuesta ingresada',
      /** 已回答 */
      answered: 'Respondido',
      /** 跳过 */
      skip: 'Omitir esta pregunta',
    },
    /** 导航控制 */
    navigation: {
      /** 上一题 */
      previous: 'Pregunta Anterior',
      /** 下一题 */
      next: 'Siguiente Pregunta',
      /** 跳转到 */
      goTo: 'Ir a la Pregunta {number}',
      /** 问题列表 */
      questionList: 'Lista de Preguntas',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: 'En Progreso',
        /** 暂停 */
        paused: 'Pausado',
        /** 已完成 */
        completed: 'Completado',
      },
      /** 自动保存 */
      autoSave: {
        /** 保存中 */
        saving: 'Guardando...',
        /** 已保存 */
        saved: 'Guardado',
        /** 保存失败 */
        failed: 'Error al guardar',
      },
    },
    /** 结果显示 */
    results: {
      /** 分享选项 */
      share: {
        /** 分享结果 */
        title: 'Compartir Resultados',
        /** 复制链接 */
        copyLink: 'Copiar Enlace',
        /** 已复制 */
        copied: 'Copiado al portapapeles',
        /** 下载PDF */
        downloadPdf: 'Descargar PDF',
      },
      /** 图表交互 */
      charts: {
        /** 显示详情 */
        showDetails: 'Mostrar Detalles',
        /** 隐藏详情 */
        hideDetails: 'Ocultar Detalles',
        /** 切换视图 */
        toggleView: 'Cambiar Vista',
      },
    },
    /** 历史记录 */
    history: {
      /** 筛选器 */
      filters: {
        /** 应用筛选 */
        apply: 'Aplicar Filtros',
        /** 清除筛选 */
        clear: 'Limpiar Filtros',
        /** 筛选选项 */
        options: 'Opciones de Filtro',
      },
      /** 排序 */
      sorting: {
        /** 按日期排序 */
        byDate: 'Ordenar por Fecha',
        /** 按类型排序 */
        byType: 'Ordenar por Tipo',
        /** 按分数排序 */
        byScore: 'Ordenar por Puntuación',
        /** 升序 */
        ascending: 'Ascendente',
        /** 降序 */
        descending: 'Descendente',
      },
    },
    /** 问题类型特定交互 */
    questionTypes: {
      /** 单选题 */
      singleChoice: {
        /** 选择提示 */
        selectHint: 'Seleccione una opción',
        /** 已选择 */
        selected: 'Seleccionado',
      },
      /** 多选题 */
      multipleChoice: {
        /** 选择提示 */
        selectHint: 'Seleccione una o más opciones',
        /** 最少选择 */
        minSelect: 'Seleccione al menos {min} opciones',
        /** 最多选择 */
        maxSelect: 'Seleccione hasta {max} opciones',
      },
      /** 量表题 */
      scale: {
        /** 拖拽提示 */
        dragHint: 'Arrastre para seleccionar valor',
        /** 点击提示 */
        clickHint: 'Haga clic para seleccionar valor',
        /** 当前值 */
        currentValue: 'Valor actual: {value}',
      },
      /** 文本题 */
      text: {
        /** 输入提示 */
        inputHint: 'Ingrese su respuesta',
        /** 字数统计 */
        wordCount: '{count} palabras',
        /** 建议长度 */
        suggestedLength: 'Longitud sugerida: {min}-{max} palabras',
      },
    },
    /** 辅助功能 */
    accessibility: {
      /** 屏幕阅读器提示 */
      screenReader: {
        /** 问题导航 */
        questionNavigation: 'Use las teclas de flecha para navegar entre preguntas',
        /** 进度信息 */
        progressInfo: 'Pregunta {current} de {total}, {percentage} por ciento completado',
        /** 选项描述 */
        optionDescription: 'Opción {index}: {text}',
        /** 错误信息 */
        errorAnnouncement: 'Error: {message}',
      },
      /** 键盘导航 */
      keyboard: {
        /** 导航提示 */
        navigationHint: 'Use Tab para navegar, Enter para seleccionar',
        /** 选择提示 */
        selectionHint: 'Use Espacio para seleccionar/deseleccionar opciones',
        /** 提交提示 */
        submitHint: 'Presione Enter para enviar respuesta',
      },
    },
  },
};

export default assessmentEs;
