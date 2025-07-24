/**
 * 指南页面西班牙文翻译内容
 *
 * @format
 */

import type { IGuideTranslations } from './types';

export const guideEs: IGuideTranslations = {
  page: {
    title: 'Guía de Autoayuda para la Salud Mental',
    subtitle: 'Recursos prácticos para ansiedad, sueño y manejo emocional',
    description:
      'Explora nuestra colección completa de guías de salud mental que cubren ansiedad, depresión, problemas de sueño y regulación emocional.'
  },
  list: {
    viewAll: 'Ver Todas las Guías',
    noGuides: 'No hay guías disponibles en este momento.',
    loading: 'Cargando guías...',
    featured: 'Guías Destacadas',
    allGuides: 'Todas las Guías',
    featuredTag: 'Destacado'
  },
  detail: {
    publishedOn: 'Publicado el',
    updatedOn: 'Actualizado el',
    author: 'Autor',
    tags: 'Etiquetas',
    tableOfContents: 'Tabla de Contenidos',
    shareGuide: 'Compartir esta guía'
  },
  navigation: {
    previous: 'Anterior',
    next: 'Siguiente',
    backToGuides: 'Volver a las Guías'
  },
  actions: {
    readMore: 'Leer Más',
    backTo: 'Volver a',
    print: 'Imprimir',
    share: 'Compartir'
  },
  help: {
    needMoreHelp: '¿Necesitas Más Ayuda?',
    helpDescription:
      'Si estás lidiando con una crisis de salud mental o necesitas apoyo inmediato, por favor no dudes en buscar ayuda profesional.',
    exploreResources: 'Explorar Recursos',
    getEmergencyHelp: 'Obtener Ayuda de Emergencia'
  },
  empty: {
    noGuidesAvailable: 'No hay guías disponibles',
    emptyDescription:
      'Vuelve pronto para nuevas guías y recursos de salud mental.'
  }
};

export default guideEs;
