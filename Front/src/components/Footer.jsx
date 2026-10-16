import React from 'react'
import { REPLAY_INTRO_EVENT } from './IntroCover'
import { useI18n } from '../context/Preferences'
import './Styles/Footer.scss'

const KONAMI_KEYS = ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A']

const Footer = () => {
  const { t } = useI18n()

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <span>© {new Date().getFullYear()} Bernardo Meneses · {t('footer.built')}</span>

        <span className="site-footer__hint">
          {t('footer.hint')} {KONAMI_KEYS.map((key, i) => <kbd key={i}>{key}</kbd>)}
        </span>

        <div className="site-footer__actions">
          <button
            type="button"
            className="site-footer__close"
            onClick={() => window.dispatchEvent(new Event(REPLAY_INTRO_EVENT))}
          >
            <i className="fas fa-folder-closed"></i> {t('footer.close')}
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
