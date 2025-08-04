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

  actions: {
    retry: 'Reintentar',
    goBack: 'Volver',
  },

};

export default assessmentEs;
