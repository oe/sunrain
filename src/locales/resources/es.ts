/**
 * 资源页面西班牙文翻译内容
 */
import type { IResourcesTranslations } from './types';

export const resourcesEs: IResourcesTranslations = {
  page: {
    title: 'Recursos de Sanación',
    subtitle: 'Música, películas y libros curados para el bienestar mental',
    description: 'Descubre música, películas y libros cuidadosamente seleccionados que pueden apoyar tu viaje de salud mental y brindar consuelo durante tiempos difíciles.',
  },
  categories: {
    music: 'Música',
    movies: 'Películas',
    books: 'Libros',
    all: 'Todos',
  },
  sections: {
    music: {
      title: 'Música Sanadora',
      description: 'Melodías y sonidos relajantes diseñados para calmar la mente y reducir el estrés.',
    },
    movies: {
      title: 'Películas Inspiradoras',
      description: 'Películas que inspiran esperanza, resistencia y pensamiento positivo.',
    },
    books: {
      title: 'Libros de Bienestar',
      description: 'Libros que ofrecen perspectivas, estrategias y consuelo para la salud mental.',
    },
  },
  filters: {
    title: 'Filtrar Recursos',
    searchPlaceholder: 'Buscar recursos...',
    filterByCategory: 'Filtrar por Categoría',
    clearFilters: 'Limpiar Filtros',
  },
  details: {
    author: 'Autor',
    director: 'Director',
    artist: 'Artista',
    year: 'Año',
    viewDetails: 'Ver Detalles',
    close: 'Cerrar',
  },
  cta: {
    title: '¿Listo para Comenzar tu Viaje de Sanación?',
    description: 'Explora nuestras guías completas de autoayuda para estrategias prácticas de salud mental.',
    button: 'Explorar Guías',
  },
  links: {
    spotify: 'Spotify',
    youtube: 'YouTube',
    watch: 'Ver',
    trailer: 'Tráiler',
    amazon: 'Amazon',
    goodreads: 'Goodreads',
  },
  crisis: {
    title: 'Líneas de Crisis',
    subtitle: 'Apoyo de Salud Mental 24/7',
    description: 'Encuentra líneas de crisis profesionales de apoyo en salud mental y recursos por país/región. Estos servicios brindan apoyo gratuito y confidencial para personas en dificultades.',
    emergency: {
      title: '🚨 ¿En Peligro Inmediato?',
      description: 'Si estás en peligro inmediato o experimentando una emergencia que amenaza tu vida, llama inmediatamente a los servicios de emergencia locales (por ejemplo, 911 en EE. UU., 112 en España).',
    },
    filters: {
      searchPlaceholder: 'Buscar por país o nombre de línea...',
      selectRegion: 'Seleccionar País/Región',
      allRegions: 'Todos los Países/Regiones',
    },
    hotline: {
      phone: 'Teléfono',
      website: 'Sitio Web',
      available: 'Disponible',
      languages: 'Idiomas',
      call: 'Llamar',
      visitWebsite: 'Visitar Sitio Web',
      available247: '24/7',
    },
    noResults: {
      title: 'No se encontraron líneas',
      description: 'Intenta ajustar tu búsqueda o criterios de filtro.',
    },
    disclaimer: 'Esta información se proporciona únicamente con fines informativos. No respaldamos ni garantizamos los servicios listados. Por favor, verifica la información de contacto actual antes de usar.',
    encouragement: {
      title: 'No Estás Solo',
      message: 'Donde el sol se encuentra con la lluvia, la esperanza y la sanación siempre están al alcance. Buscar ayuda es una señal de fortaleza, no de debilidad.',
    },
  },
};

export default resourcesEs;