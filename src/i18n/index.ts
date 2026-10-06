import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { es } from './es';

/**
 * Preparado para ca / gl / eu / en: añade el archivo del idioma y regístralo en `resources`.
 * El idioma activo vive en prefsStore.language.
 */
i18n.use(initReactI18next).init({
  resources: { es: { translation: es } },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
