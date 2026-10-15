import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../context/Preferences'
import './Styles/BinderTabs.scss'

const TABS = ['home', 'about', 'skills', 'portfolio', 'breakroom', 'contact', 'guestbook']

// Index tabs on the right edge, like the dividers of a physical binder.
const BinderTabs = () => {
  const { pathname } = useLocation()
  const { t } = useI18n()
  const [active, setActive] = useState('home')

  useEffect(() => {
    if (pathname !== '/') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )

    TABS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [pathname])

  if (pathname !== '/') return null

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="binder-tabs" aria-label={t('tabs.label')}>
      {TABS.map((id, i) => (
        <button
          key={id}
          type="button"
          className={`binder-tab binder-tab--${i}${active === id ? ' is-active' : ''}`}
          aria-current={active === id ? 'true' : undefined}
          onClick={() => goTo(id)}
        >
          <span className="binder-tab__num">{String(i + 1).padStart(2, '0')}</span>
          <span className="binder-tab__label">{t(`tabs.${id}`)}</span>
        </button>
      ))}
    </nav>
  )
}

export default BinderTabs
