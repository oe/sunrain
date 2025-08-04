/**
 * 评测系统西班牙语翻译内容
 */
import type { IAssessmentTranslations } from './types';

export const assessmentEs: IAssessmentTranslations = {
  pageTitle: 'Evaluación de Salud Mental',

  list: {
    title: 'Evaluación de Salud Mental',
    subtitle: 'Comprenda su estado de salud mental a través de herramientas de evaluación científicas y obtenga recomendaciones y recursos personalizados',
    categories: {
      mental_health: 'Evaluación de Salud Mental',
      personality: 'Evaluación de Personalidad',
      stress: 'Evaluación de Estrés',
      mood: 'Evaluación del Estado de Ánimo'
    },
    categoryDescriptions: {
      mental_health: 'Herramientas profesionales de detección de salud mental para ayudar a identificar posibles problemas de salud mental',
      personality: 'Comprenda sus rasgos de personalidad y patrones de comportamiento',
      stress: 'Evalúe sus niveles de estrés y capacidades de afrontamiento',
      mood: 'Monitoree sus estados emocionales y tendencias'
    },
    startButton: 'Comenzar Evaluación',
    minutes: 'minutos',
    questions: 'preguntas',
    activeSessions: {
      title: 'Tienes {count} evaluaciones incompletas',
      message: 'Haz clic para continuar tus evaluaciones',
      continueLink: 'Continuar evaluaciones',
      lastActivity: 'Última actividad',
      progress: 'Progreso'
    },
    quickActions: {
      title: 'Acciones Rápidas',
      history: {
        title: 'Historial de Evaluaciones',
        description: 'Ver resultados históricos de evaluaciones'
      },
      trends: {
        title: 'Análisis de Tendencias',
        description: 'Ver tendencias de salud mental'
      },
      continue: {
        title: 'Continuar Evaluación',
        description: 'Completar evaluaciones sin terminar'
      }
    },
    existingSession: {
      title: "Evaluación Sin Terminar",
      message: "Tienes una evaluación sin terminar. Puedes continuar desde donde lo dejaste, o empezar de nuevo.",
      progress: "Progreso",
      lastActivity: "Última actividad",
      questionsAnswered: "Respondidas",
      continue: "Continuar Evaluación",
      restart: "Empezar de Nuevo",
      restartWarning: "Empezar de nuevo eliminará todas tus respuestas anteriores."
    },
    disclaimer: {
      title: 'Aviso Importante',
      message: 'Estas herramientas de evaluación son solo para detección y autocomprensión y no pueden reemplazar el diagnóstico profesional de salud mental. Si se siente angustiado o necesita ayuda, consulte a un experto profesional en salud mental.'
    }
  },

  execution: {
    loading: 'Cargando evaluación...',
    pause: 'Pausar',
    save: 'Guardar Progreso',
    next: 'Siguiente',
    previous: 'Anterior',
    complete: 'Completar Evaluación',
    timeSpent: 'Tiempo transcurrido',
    required: '* Requerido',
    questionNumber: 'Pregunta',
    totalQuestions: 'preguntas',
    completion: {
      title: '¡Evaluación Completa!',
      message: 'Analizando sus resultados...'
    },
    pauseModal: {
      title: 'Pausar Evaluación',
      message: 'Su progreso se ha guardado automáticamente. Puede continuar la evaluación más tarde.',
      continue: 'Continuar Evaluación',
      exit: 'Salir'
    },
    errors: {
      required: 'Por favor responda esta pregunta antes de continuar.',
      submitFailed: 'Error al enviar respuesta, por favor intente de nuevo.',
      loadFailed: 'Error al cargar evaluación, por favor actualice e intente de nuevo.'
    }
  },

  results: {
    loading: 'Cargando resultados de evaluación...',
    completedAt: 'Completado en',
    timeSpent: 'Tiempo transcurrido',
    overallAssessment: 'Evaluación General',
    detailedInterpretation: 'Interpretación Detallada',
    scoreDistribution: 'Distribución de Puntuaciones',
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
      viewHistory: 'Ver Historial'
    },
    riskLevels: {
      high: {
        title: 'Necesita Atención',
        message: 'Sus resultados de evaluación indican que puede necesitar ayuda profesional. Considere consultar a un experto en salud mental o llamar a una línea de ayuda de salud mental.'
      },
      medium: {
        title: 'Atención Recomendada',
        message: 'Sus resultados de evaluación muestran algunas áreas que necesitan atención. Considere implementar medidas de autocuidado o buscar apoyo.'
      },
      low: {
        title: 'Buen Estado',
        message: 'Sus resultados de evaluación están dentro del rango normal. Continúe manteniendo hábitos saludables.'
      }
    },
    disclaimer: {
      title: 'Aviso Importante',
      message: 'Estos resultados de evaluación son solo para referencia y no pueden reemplazar el diagnóstico profesional de salud mental. Si se siente angustiado o necesita ayuda, consulte a un experto profesional en salud mental.'
    }
  },

  history: {
    title: 'Historial de Evaluaciones',
    subtitle: 'Ver sus registros históricos de evaluaciones y análisis de tendencias',
    statistics: {
      total: 'Total de Evaluaciones',
      completed: 'Completadas',
      averageTime: 'Tiempo Promedio',
      lastAssessment: 'Última Evaluación'
    },
    filters: {
      assessmentType: 'Tipo de Evaluación',
      timeRange: 'Rango de Tiempo',
      riskLevel: 'Nivel de Riesgo',
      allTypes: 'Todos los Tipos',
      allTimes: 'Todos los Tiempos',
      allLevels: 'Todos los Niveles',
      last7Days: 'Últimos 7 días',
      last30Days: 'Últimos 30 días',
      last3Months: 'Últimos 3 meses',
      lastYear: 'Último año',
      clearFilters: 'Limpiar Filtros'
    },
    list: {
      title: 'Registros de Evaluación',
      viewDetails: 'Ver Detalles',
      share: 'Compartir',
      delete: 'Eliminar',
      dimensions: 'dimensiones',
      today: 'Hoy',
      daysAgo: 'días atrás'
    },
    empty: {
      title: 'Sin Registros de Evaluación',
      message: 'Aún no has completado ninguna evaluación',
      startFirst: 'Comenzar Primera Evaluación'
    },
    pagination: {
      showing: 'Mostrando',
      to: 'a',
      of: 'de',
      records: 'registros',
      previous: 'Anterior',
      next: 'Siguiente'
    },
    actions: {
      export: 'Exportar Datos',
      newAssessment: 'Nueva Evaluación'
    }
  },

  continue: {
    title: 'Continuar Evaluación',
    subtitle: 'Complete sus evaluaciones de salud mental sin terminar',
    loading: 'Cargando evaluaciones incompletas...',
    noSessions: {
      title: 'Sin Evaluaciones Incompletas',
      message: 'Actualmente no tienes evaluaciones para continuar',
      startNew: 'Comenzar Nueva Evaluación'
    },
    session: {
      startedAt: 'Iniciado en',
      timeSpent: 'Tiempo transcurrido',
      progress: 'Progreso',
      answered: 'Respondidas',
      estimatedRemaining: 'Tiempo estimado restante',
      continueButton: 'Continuar Evaluación',
      status: {
        active: 'En Progreso',
        paused: 'Pausado'
      }
    },
    actions: {
      startNew: 'Comenzar Nueva Evaluación',
      clearAll: 'Limpiar Todas las Evaluaciones Incompletas'
    },
    confirmations: {
      deleteSession: '¿Estás seguro de que quieres eliminar esta evaluación incompleta? Todo el progreso se perderá.',
      clearAll: '¿Estás seguro de que quieres limpiar todas las evaluaciones incompletas? Todo el progreso se perderá.'
    }
  },

  trends: {
    title: 'Análisis de Tendencias',
    subtitle: 'Analizar sus tendencias de salud mental y patrones de desarrollo',
    loading: 'Cargando datos de tendencias...',
    timeRange: {
      title: 'Rango de Tiempo',
      last30Days: 'Últimos 30 días',
      last3Months: 'Últimos 3 meses',
      lastYear: 'Último año',
      allTime: 'Todo el tiempo'
    },
    charts: {
      overallTrend: 'Tendencia General',
      frequency: 'Frecuencia de Evaluación',
      riskTrend: 'Cambios en Nivel de Riesgo',
      categoryPerformance: 'Rendimiento por Categoría'
    },
    insights: {
      title: 'Perspectivas de Tendencias',
      positive: 'Tendencia Positiva',
      warning: 'Necesita Atención',
      info: 'Estable'
    },
    statistics: {
      improvementTrend: 'Tendencia de Mejora',
      stableDimensions: 'Dimensiones Estables',
      attentionNeeded: 'Atención Necesaria'
    },
    noData: {
      title: 'Sin Datos de Tendencias',
      message: 'Necesitas completar al menos 2 evaluaciones para ver el análisis de tendencias',
      startAssessment: 'Comenzar Evaluación'
    },
    actions: {
      exportReport: 'Exportar Reporte de Tendencias',
      newAssessment: 'Nueva Evaluación'
    }
  },

  common: {
    title: 'Título',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    refresh: 'Actualizar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    save: 'Guardar',
    share: 'Compartir',
    export: 'Exportar',
    riskLevels: {
      low: 'Riesgo Bajo',
      medium: 'Riesgo Medio',
      high: 'Riesgo Alto'
    },
    timeUnits: {
      seconds: 'segundos',
      minutes: 'minutos',
      hours: 'horas',
      days: 'días'
    }
  }
};

export default assessmentEs;
