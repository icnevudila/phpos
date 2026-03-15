// ============================================
// i18n CONTEXT - React Context for translations
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, getLanguage, setLanguage, t as translate } from './translations.js';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [language, setLang] = useState(getLanguage);

  const changeLanguage = (lang) => {
    if (setLanguage(lang)) {
      setLang(lang);
    }
  };

  const t = (key) => translate(key, language);

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t, translations: translations[language] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

