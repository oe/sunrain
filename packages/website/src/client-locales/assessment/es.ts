/**
 * Assessment 系统西班牙语翻译内容 (CSR)
 * 包含实际使用的翻译键，匹配组件中的client前缀结构
 */
import type { IAssessmentTranslations } from './types';

export const assessmentEs: IAssessmentTranslations = {
  assessment: {
    title: 'Evaluación de Salud Mental',
  },

  loading: {
    default: 'Cargando...',
    assessment: 'Cargando evaluación...',
  },

  errors: {
    title: 'Error',
    initializationFailed: 'Error de inicialización',
    sessionStartFailed: 'No se pudo iniciar la sesión de evaluación',
    noData: 'Error al cargar datos de evaluación',
    validationFailed: 'Error de validación',
    unsupportedQuestionType: 'Tipo de pregunta no soportado: {type}',
    cannotContinue: 'Cannot continue session', // TODO: Translate to Spanish
    continueFailed: 'Failed to continue session', // TODO: Translate to Spanish
    deleteFailed: 'Failed to delete session', // TODO: Translate to Spanish
    clearFailed: 'Failed to clear sessions', // TODO: Translate to Spanish
    loadFailed: 'Loading Failed', // TODO: Translate to Spanish
    loadFailedMessage: 'Unable to load assessment data. Please try again.', // TODO: Translate to Spanish
    boundary: {
      title: 'Error de Aplicación',
      message: 'Lo sentimos, la aplicación encontró un error.',
      details: 'Detalles del Error',
      retry: 'Reintentar',
      goHome: 'Ir al Inicio',
    },
  },

  question: {
    number: 'Pregunta {number}',
    required: 'Requerido',
    selectedCount: '{count} seleccionados',
    selectedValue: 'Seleccionado: {value}',
    textPlaceholder: 'Por favor ingrese su respuesta...',
    characterCount: '{count} caracteres',
    textEntered: 'Texto ingresado',
    answered: 'Respondido',
  },

  questionList: {
    title: 'Lista de Preguntas',
    progress: 'Progreso: {current}/{total}',
    questionNumber: 'Pregunta {number}',
    completed: 'Completado',
    remaining: 'Restante',
  },

  continue: {
    loading: 'Cargando evaluaciones incompletas...',
  },

  list: {
    activeSessions: {
      title: 'Tienes {count} evaluaciones incompletas',
      continueLink: 'Continuar evaluaciones',
      lastActivity: 'Última actividad',
      progress: 'Progreso',
    },
  },

  progress: {
    text: '{current} de {total}',
  },

  validation: {
    checking: 'Validando...',
    withWarnings: 'with warnings', // TODO: Translate to Spanish
  },

  execution: {
    errors: {
      submitFailed: 'Error al enviar',
      required: 'Este campo es obligatorio',
    },
    completion: {
      title: 'Evaluación Completa',
      message: 'Generando resultados...',
    },
    pauseModal: {
      title: 'Pausar Evaluación',
      message: '¿Estás seguro de que quieres pausar la evaluación?',
      continue: 'Continuar',
      exit: 'Salir',
    },
    navigation: {
      previous: 'Anterior',
      next: 'Siguiente',
      submit: 'Enviar',
      save: 'Guardar',
      submitting: 'Enviando...',
    },
    pause: 'Pausar',
    questionNumber: 'Pregunta {number}',
    timeSpent: 'Tiempo transcurrido',
    complete: 'completo',
  },

  results: {
    loading: 'Cargando resultados de evaluación...',
    completedAt: 'Completado en',
    timeSpent: 'Tiempo transcurrido',
    overallAssessment: 'Evaluación General',
    detailedInterpretation: 'Interpretación Detallada',
    scoreDistribution: 'Distribución de Puntuación',
    riskAssessment: 'Evaluación de Riesgo',
    personalizedRecommendations: 'Recomendaciones Personalizadas',
    recommendedResources: 'Recursos Recomendados',
    nextSteps: {
      title: 'Próximos Pasos',
      moreAssessments: {
        title: 'Más Evaluaciones',
        description: 'Explorar otras herramientas de evaluación'
      },
      startPractice: {
        title: 'Comenzar Práctica',
        description: 'Probar prácticas relacionadas de salud mental'
      },
      browseResources: {
        title: 'Explorar Recursos',
        description: 'Ver biblioteca de recursos de sanación'
      }
    },
    actions: {
      share: 'Compartir Resultados',
      savePdf: 'Guardar como PDF',
      viewHistory: 'Ver Historial',
      backToAssessments: 'Volver a Evaluaciones'
    },
    riskLevels: {
      high: {
        title: 'Necesita Atención',
        message: 'Sus resultados de evaluación indican que puede necesitar ayuda profesional. Considere consultar a un experto en salud mental.'
      },
      medium: {
        title: 'Atención Recomendada',
        message: 'Sus resultados de evaluación muestran algunas áreas que necesitan atención. Considere implementar medidas de autocuidado.'
      },
      low: {
        title: 'Buen Estado',
        message: 'Sus resultados de evaluación están dentro del rango normal. Continúe manteniendo hábitos saludables.'
      }
    },
    disclaimer: {
      title: 'Aviso Importante',
      message: 'Estos resultados de evaluación son solo para referencia y no pueden reemplazar el diagnóstico profesional de salud mental.'
    },
    quickActions: 'Acciones Rápidas',
    noResultFound: 'Resultado de evaluación no encontrado',
    noResultData: 'No se encontraron datos de evaluación'
  },

  history: {
    stats: {
      total: "Evaluaciones Totales",
      averageTime: "Tiempo Promedio",
      lastAssessment: "Última Evaluación",
    },
    list: {
      dimensions: "dimensiones",
      viewDetails: "Ver Detalles",
      share: "Compartir",
      delete: "Eliminar",
    },
    filters: {
      type: "Tipo de Evaluación",
      timeRange: "Rango de Tiempo",
      riskLevel: "Nivel de Riesgo",
    },
  },

  status: {
    active: "Activo",
    paused: "Pausado",
  },

  labels: {
    unknownAssessment: "Evaluación Desconocida",
    startTime: "Iniciado",
    timeSpent: "Tiempo Empleado",
    answered: "Respondido",
    questions: "preguntas",
    estimatedRemaining: "Tiempo Estimado Restante",
  },

  time: {
    minutes: "minutos",
    varies: "varía",
    minutesSeconds: "minutos y segundos",
  },

  messages: {
    deleted: "Sesión eliminada exitosamente",
    clearedCount: "Se eliminaron {count} sesiones",
    noActiveSessions: "¡Todo al día!",
    noActiveSessionsMessage: "No tienes evaluaciones incompletas. Comienza una nueva para continuar tu viaje de salud mental.",
  },

  actions: {
    retry: 'Reintentar',
    goBack: 'Volver',
    refresh: "Actualizar",
    startNew: "Comenzar Nueva Evaluación",
    continue: "Continuar",
    viewDetails: "Ver Detalles",
  },

  questionnaireInfo: {
    description: 'Descripción',
    purpose: 'Propósito',
    whatToExpect: 'Qué Esperar',
    professionalBackground: 'Antecedentes Profesionales',
    tags: 'Etiquetas',
    questions: 'Preguntas',
    minutes: 'Minutos',
    timeEstimate: {
      lessThanMinute: 'Menos de 1 minuto',
      oneMinute: '1 minuto',
      minutes: '{minutes} minutos',
    },
    difficulty: {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
    },
    steps: {
      step1: 'Responde {count} preguntas honestamente (toma aproximadamente {time} minutos)',
      step2: 'Tus respuestas serán analizadas usando métodos de puntuación validados',
      step3: 'Recibe resultados y recomendaciones personalizadas',
    },
    validated: 'Evaluación Clínicamente Validada',
    mentalHealthAssessment: 'Evaluación de Salud Mental',
    purposeDescription: 'Esta evaluación ayuda a identificar síntomas y proporciona información que puede guiar tu comprensión de tu salud mental.',
    validatedDescription: 'Esta evaluación utiliza métodos y sistemas de puntuación científicamente validados.',
    privacy: {
      title: 'Privacidad y Seguridad de Datos',
      message: 'Tus respuestas se almacenan localmente en tu dispositivo y no se comparten con terceros.',
    },
    startAssessment: 'Comenzar Evaluación',
    starting: 'Iniciando...',
  },

  questionnaireCard: {
    featured: 'Destacado',
    minutes: 'min',
    questions: 'preguntas',
    difficulty: {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
    },
    validated: 'Validado',
    viewHistory: 'Ver Historial',
    startAssessment: 'Comenzar Evaluación',
  },

  existingSession: {
    title: 'Evaluación Incompleta',
    progress: 'Progreso',
    lastActivity: 'Última actividad',
    questionsAnswered: 'Respondidas',
    message: 'Tienes una evaluación incompleta. Puedes continuar desde donde lo dejaste, o empezar de nuevo.',
    continue: 'Continuar Evaluación',
    restart: 'Empezar de Nuevo',
    restartWarning: 'Empezar de nuevo eliminará todas tus respuestas anteriores.',
  },

  common: {
    loading: 'Cargando...',
    cancel: 'Cancelar',
    close: 'Cerrar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    yes: 'Sí',
    no: 'No',
    error: "Error",
    showing: "Mostrando",
    to: "a",
    of: "de",
    results: "resultados",
    riskLevels: {
      high: "Alto Riesgo",
      medium: "Riesgo Medio",
      low: "Bajo Riesgo",
    },
    timeUnits: {
      minutes: "min",
      seconds: "s",
    },
  },

  /** 优先级 */
  priority: {
    high: "Alto",
    medium: "Medio",
    low: "Bajo",
  },

  /** 建议内容 */
  recommendations: {
    riskBased: {
      high: [
        "📞 Contacta a un profesional de salud mental o línea de crisis",
        "🏥 Considera programar una evaluación detallada con un experto en salud mental",
        "👥 Informa a familiares o amigos sobre tu situación y busca apoyo"
      ],
      medium: [
        "👨‍⚕️ Considera programar una consulta con un profesional de salud mental",
        "🧘‍♀️ Aprende y practica técnicas de manejo del estrés",
        "📚 Lee libros y recursos sobre salud mental",
        "🏃‍♂️ Mantén ejercicio físico regular"
      ],
      low: [
        "📊 Continúa monitoreando tu estado de salud mental",
        "🌱 Mantén hábitos de estilo de vida saludables",
        "💪 Desarrolla estrategias de afrontamiento positivas",
        "🎯 Establece metas y expectativas alcanzables"
      ]
    },
    general: [
      "💤 Asegura un sueño adecuado (7-9 horas)",
      "🥗 Mantén una dieta equilibrada",
      "🚫 Evita el uso excesivo de alcohol y drogas",
      "🤝 Mantente conectado con amigos y familia"
    ],
    patterns: {
      stable: "📈 Tus puntuaciones son relativamente estables, continúa manteniendo tu estado actual",
      variable: "📊 Tus puntuaciones varían significativamente, considera una reevaluación regular",
      extreme: "⚠️ Algunos aspectos necesitan atención especial, considera buscar ayuda profesional",
      highAverage: "🔍 Considera una evaluación más detallada de salud mental",
      mediumAverage: "👀 Considera el monitoreo regular del estado de salud mental"
    }
  },

  /** 趋势分析 */
  trends: {
    title: "Análisis de Tendencias",
    subtitle: "Analiza tus tendencias de salud mental y patrones de desarrollo",
    loading: "Cargando datos de tendencias...",
    timeRange: {
      title: "Rango de Tiempo",
      last30Days: "Últimos 30 días",
      last3Months: "Últimos 3 meses",
      lastYear: "Último año",
      allTime: "Todo el tiempo"
    },
    charts: {
      overallTrend: "Tendencia General",
      frequency: "Frecuencia de Evaluaciones",
      riskTrend: "Cambios en Nivel de Riesgo",
      categoryPerformance: "Rendimiento por Categoría"
    },
    insights: {
      title: "Insights de Tendencias",
      positive: "Tendencia Positiva",
      warning: "Necesita Atención",
      info: "Estable"
    },
    statistics: {
      improvementTrend: "Tendencia de Mejora",
      stableDimensions: "Dimensiones Estables",
      attentionNeeded: "Atención Necesaria"
    },
    noData: {
      title: "Sin Datos de Tendencias",
      message: "Necesitas completar al menos 2 evaluaciones para ver el análisis de tendencias",
      startAssessment: "Iniciar Evaluación"
    },
    actions: {
      exportReport: "Exportar Reporte de Tendencias",
      newAssessment: "Nueva Evaluación"
    }
  },

  /** 分数名称 */
  scores: {
    total_score: "Puntuación Total",
    depression: "Puntuación de Depresión",
    anxiety: "Puntuación de Ansiedad",
    stress: "Puntuación de Estrés",
    phq9_total: "Puntuación Total PHQ-9",
    gad7_total: "Puntuación Total GAD-7",
    stress_total: "Puntuación Total Escala de Estrés"
  },

};

export default assessmentEs;
