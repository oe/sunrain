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

};

export default assessmentEs;
