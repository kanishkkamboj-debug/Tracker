import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Quick inline translations for demo
const resources = {
  en: {
    translation: {
      "settings": {
        "title": "Personal Settings",
        "timezone": "Timezone",
        "language": "Language",
        "theme": "Theme",
        "notifications": "Notifications",
        "taskAssignments": "Task Assignments",
        "mentions": "Mentions",
        "projectUpdates": "Project Updates",
        "marketingEmails": "Marketing Emails"
      }
    }
  },
  es: {
    translation: {
      "settings": {
        "title": "Configuración Personal",
        "timezone": "Zona Horaria",
        "language": "Idioma",
        "theme": "Tema",
        "notifications": "Notificaciones",
        "taskAssignments": "Asignaciones de Tareas",
        "mentions": "Menciones",
        "projectUpdates": "Actualizaciones de Proyectos",
        "marketingEmails": "Correos de Marketing"
      }
    }
  },
  fr: {
    translation: {
      "settings": {
        "title": "Paramètres Personnels",
        "timezone": "Fuseau Horaire",
        "language": "Langue",
        "theme": "Thème",
        "notifications": "Notifications",
        "taskAssignments": "Affectations de Tâches",
        "mentions": "Mentions",
        "projectUpdates": "Mises à jour de Projet",
        "marketingEmails": "E-mails Marketing"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already escapes
    },
  });

export default i18n;
