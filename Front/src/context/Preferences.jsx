import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import translations from '../i18n/translations'

const PreferencesContext = createContext(null)

const LANG_KEY = 'bm:lang'
const THEME_KEY = 'bm:theme'

const readStored = (key) => {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    return null
  }
}

const store = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    // Blocked storage: the preference just lasts for this visit.
  }
}

const initialLang = () => {
  const stored = readStored(LANG_KEY)
  if (stored === 'en' || stored === 'pt') return stored
  return (navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

const initialTheme = () => {
  const stored = readStored(THEME_KEY)
  if (stored === 'dark' || stored === 'paper') return stored
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'paper' : 'dark'
}

const lookup = (dict, key) => key.split('.').reduce((node, part) => (node == null ? node : node[part]), dict)

export const PreferencesProvider = ({ children }) => {
  const [lang, setLangState] = useState(initialLang)
  const [theme, setThemeState] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en'
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setLang = useCallback((value) => {
    setLangState(value)
    store(LANG_KEY, value)
  }, [])

  const setTheme = useCallback((value) => {
    setThemeState(value)
    store(THEME_KEY, value)
  }, [])

  // t('hero.title') or t('bugs.result', { score: 3 }); falls back to English, then to the key.
  const t = useCallback((key, vars) => {
    let value = lookup(translations[lang], key)
    if (value == null) value = lookup(translations.en, key)
    if (value == null) return key
    if (typeof value === 'string' && vars) {
      return value.replace(/\{(\w+)\}/g, (match, name) => (vars[name] ?? match))
    }
    return value
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, theme, setTheme, t }), [lang, setLang, theme, setTheme, t])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export const usePreferences = () => useContext(PreferencesContext)
export const useI18n = () => {
  const { t, lang } = useContext(PreferencesContext)
  return { t, lang }
}
