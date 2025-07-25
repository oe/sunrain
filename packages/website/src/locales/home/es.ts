/**
 * 首页西班牙语翻译内容
 */
import type { IHomeTranslations } from './types';

export const homeEs: IHomeTranslations = {
  hero: {
    title: 'Tu Viaje de Salud Mental Comienza Aquí',
    subtitle: 'Descubre herramientas, recursos y orientación para un mejor bienestar mental',
    tagline: 'Donde el sol se encuentra con la lluvia',
    description: 'Un espacio cálido y seguro para tu mente. 🤗',
    selfCheckButton: '🧠 Iniciar Autoevaluación',
    quickRelaxButton: '🎧 Relajación Rápida',
  },
  features: {
    title: 'El punto de partida para tu viaje mental',
    subtitle: 'Seis caminos suaves hacia el bienestar, cada uno diseñado con cuidado',
    selfCheck: {
      title: 'Autoevaluación',
      description: 'Evaluación psicológica (estrés, ansiedad, depresión, autoestima)',
      button: 'Comenzar Evaluación →',
    },
    dailyPractice: {
      title: 'Práctica Diaria',
      description: 'Entrenamiento de atención plena, ejercicios de respiración, construcción de resiliencia',
      button: 'Comenzar Práctica →',
    },
    quickRelief: {
      title: 'Alivio Rápido',
      description: 'Ruido blanco, juegos de relajación, interacción de respiración relajante',
      button: 'Encontrar Alivio →',
    },
    healingLibrary: {
      title: 'Biblioteca Curativa',
      description: 'Recomendaciones de música, películas, podcasts y libros (curativos)',
      button: 'Explorar →',
    },
    psychologyWiki: {
      title: 'Wiki de Psicología',
      description: 'Enciclopedia de conocimientos psicológicos, explicación de problemas comunes',
      button: 'Aprender Más →',
    },
    supportHotline: {
      title: 'Línea de Apoyo',
      description: 'Líneas de ayuda psicológica global, guía de recursos de consulta local',
      button: 'Obtener Ayuda →',
    },
  },
  userVoices: {
    title: 'Voces de Usuarios',
    subtitle: 'Historias de nuestra comunidad',
    testimonials: [
      {
        text: 'Este espacio se sintió como un hogar.',
        author: 'Usuario Anónimo',
      },
      {
        text: 'La autoevaluación me ayudó a darme cuenta de que no estaba solo.',
        author: 'Miembro de la Comunidad',
      },
      {
        text: 'Finalmente encontré recursos que realmente ayudan.',
        author: 'Visitante Agradecido',
      },
      {
        text: 'Los ejercicios de atención plena cambiaron mi rutina diaria.',
        author: 'Usuario Regular',
      },
    ],
    feelSameButton: '❤️ Siento lo mismo',
  },
  cta: {
    title: '¿Listo para comenzar tu viaje de sanación?',
    description: 'No estás solo. Da el primer paso suave hacia el bienestar.',
    submitStoryButton: '📝 Enviar Tu Historia',
    mindfulnessButton: '🧘 Probar una Sesión de Atención Plena',
  },
};

export default homeEs;