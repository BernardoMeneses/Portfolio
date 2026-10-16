import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePreferences } from '../context/Preferences'
import { useAchievements } from '../context/Achievements'
import TrophyCase from './TrophyCase'
import './Styles/Navbar.scss'

const LINKS = [
  { to: '/', key: 'home' },
  { to: '/about', key: 'about' },
  { to: '/skills', key: 'skills' },
  { to: '/portfolio', key: 'projects' },
  { to: '/contact', key: 'contact' },
]

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { lang, setLang, theme, setTheme, t } = usePreferences()
  const { unlock } = useAchievements()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  const toggleLang = () => {
    setLang(lang === 'en' ? 'pt' : 'en')
    unlock('polyglot')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'paper' : 'dark')
    unlock('paper')
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-logo">
            <Link to="/" className="logo-link">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">BM</span>
            </Link>
          </div>

          <ul className="navbar-links">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={isActive(link.to) ? 'active' : ''}>
                  {t(`nav.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-prefs">
            <TrophyCase />
            <button
              type="button"
              className="navbar-pref navbar-lang"
              onClick={toggleLang}
              aria-label={t('nav.language')}
              title={t('nav.language')}
            >
              <span className={lang === 'pt' ? 'is-on' : ''}>PT</span>
              <span className={lang === 'en' ? 'is-on' : ''}>EN</span>
            </button>

            <button
              type="button"
              className="navbar-pref navbar-theme"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('nav.themeToPaper') : t('nav.themeToDark')}
              title={theme === 'dark' ? t('nav.themeToPaper') : t('nav.themeToDark')}
            >
              <i className={theme === 'dark' ? 'far fa-file-lines' : 'fas fa-moon'}></i>
            </button>

            <button
              className={`navbar-toggle ${mobileOpen ? 'open' : ''}`}
              aria-label={t('nav.menu')}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          {mobileOpen && (
            <div className="navbar-mobile">
              <ul>
                {LINKS.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} onClick={() => setMobileOpen(false)}>
                      {t(`nav.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
