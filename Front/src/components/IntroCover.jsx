import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../context/Preferences'
import { useAchievements } from '../context/Achievements'
import profileImage from '../assets/eu.jpg'
import './Styles/IntroCover.scss'

const STORAGE_KEY = 'bm:cover-opened'
export const REPLAY_INTRO_EVENT = 'bm:replay-intro'
// Fired whenever the cover appears / disappears, so animations behind it can wait
export const INTRO_OPENED_EVENT = 'bm:intro-opened'
export const INTRO_CLOSED_EVENT = 'bm:intro-closed'
export const isIntroOnScreen = () => document.documentElement.hasAttribute('data-intro-open')

// Stage timings (ms) – keep in sync with the transitions in IntroCover.scss
const UNSTRAP_MS = 380
const OPEN_MS = 1250
const LEAVE_MS = 750
const CALM_LEAVE_MS = 450 // reduced motion: the cover just fades away

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const alreadyOpened = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch (error) {
    return false
  }
}

const rememberOpened = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch (error) {
    // Private mode / blocked storage: the intro simply shows again next time.
  }
}

const IntroCover = () => {
  const { t } = useI18n()
  const { unlock } = useAchievements()
  // Reduced-motion visitors still get the cover, just without the 3D swing (see IntroCover.scss)
  const [visible, setVisible] = useState(() => !alreadyOpened())
  // idle -> unstrap -> opening -> leaving
  const [stage, setStage] = useState('idle')
  const timers = useRef([])
  const sceneRef = useRef(null)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const finish = useCallback(() => {
    clearTimers()
    rememberOpened()
    setVisible(false)
    setStage('idle')
  }, [])

  const open = useCallback(() => {
    if (stage !== 'idle') return
    unlock('opened')
    if (prefersReducedMotion()) {
      setStage('leaving')
      timers.current.push(setTimeout(finish, CALM_LEAVE_MS))
      return
    }
    setStage('unstrap')
    timers.current.push(
      setTimeout(() => setStage('opening'), UNSTRAP_MS),
      setTimeout(() => setStage('leaving'), UNSTRAP_MS + OPEN_MS),
      setTimeout(finish, UNSTRAP_MS + OPEN_MS + LEAVE_MS)
    )
  }, [stage, finish, unlock])

  // Let the rest of the page know the cover is up (e.g. the Duel Card holds its summon)
  useEffect(() => {
    if (!visible) return undefined
    const root = document.documentElement
    root.setAttribute('data-intro-open', '')
    window.dispatchEvent(new Event(INTRO_OPENED_EVENT))
    return () => {
      root.removeAttribute('data-intro-open')
      window.dispatchEvent(new Event(INTRO_CLOSED_EVENT))
    }
  }, [visible])

  // Lock page scroll while the cover is on screen
  useEffect(() => {
    if (!visible) return undefined
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') finish()
      // Enter / Space open the cover even before it has focus
      if ((e.key === 'Enter' || e.key === ' ') && e.target === document.body) {
        e.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, finish, open])

  // "Close the portfolio" from anywhere in the app
  useEffect(() => {
    const replay = () => {
      clearTimers()
      window.scrollTo({ top: 0 })
      setStage('idle')
      setVisible(true)
    }
    window.addEventListener(REPLAY_INTRO_EVENT, replay)
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, replay)
  }, [])

  useEffect(() => clearTimers, [])

  // Subtle "holding it in your hands" tilt that follows the pointer
  const handlePointerMove = (e) => {
    if (stage !== 'idle' || e.pointerType === 'touch') return
    const el = sceneRef.current
    if (!el) return
    const x = e.clientX / window.innerWidth - 0.5
    const y = e.clientY / window.innerHeight - 0.5
    el.style.setProperty('--tilt-x', `${(-y * 8).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${(x * 10).toFixed(2)}deg`)
  }

  if (!visible) return null

  const year = new Date().getFullYear()

  return (
    <div
      className={`intro intro--${stage}`}
      onPointerMove={handlePointerMove}
      role="dialog"
      aria-modal="true"
      aria-label={t('intro.dialog')}
    >
      <div className="intro__desk" aria-hidden="true" />

      <div className="intro__scene" ref={sceneRef}>
        <div className="intro__drop">
          <div
            className="intro__folder"
            role="button"
            tabIndex={0}
            aria-label={t('intro.open')}
            onClick={open}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                open()
              }
            }}
          >
            {/* First page, revealed once the cover swings open */}
            <div className="intro__page" aria-hidden="true">
              <span className="intro__page-kicker">{t('intro.index')}</span>
              <ol className="intro__toc">
                {t('intro.toc').map((item, i) => (
                  <li key={item}><span>{String(i + 1).padStart(2, '0')}</span> {item} <i /></li>
                ))}
              </ol>
              <p className="intro__handwritten">{t('intro.note')}</p>
              <span className="intro__page-number">{t('intro.page')}</span>
            </div>

            <div className="intro__cover">
              <div className="intro__cover-front" aria-hidden="true">
                <span className="intro__corner intro__corner--tr" />
                <span className="intro__corner intro__corner--br" />

                <span className="intro__monogram">BM</span>

                <figure className="intro__polaroid">
                  <span className="intro__tape" />
                  <img src={profileImage} alt="" draggable="false" />
                  <figcaption>{t('intro.photoCaption')}</figcaption>
                </figure>

                <div className="intro__label">
                  <span className="intro__label-name">Bernardo Meneses</span>
                  <span className="intro__label-role">{t('intro.role')}</span>
                  <span className="intro__label-meta">{t('intro.volume', { year })}</span>
                </div>

                <span className="intro__stamp">{t('intro.stamp')}<br />{t('intro.stampSub')}</span>
              </div>

              <div className="intro__cover-back" aria-hidden="true">
                <div className="intro__pocket">
                  <div className="intro__card">
                    <strong>Bernardo Meneses</strong>
                    <span>{t('intro.role')}</span>
                    <em>github.com/BernardoMeneses</em>
                  </div>
                </div>
                <div className="intro__sticky">
                  {t('intro.sticky').map((line) => <span key={line}>{line}</span>)}
                </div>
              </div>
            </div>

            <span className="intro__strap" aria-hidden="true" />
          </div>
        </div>
      </div>

      <p className="intro__hint" aria-hidden="true">
        <span className="intro__hint-dot" />
        <span className="intro__hint-pointer">{t('intro.hintPointer')}</span>
        <span className="intro__hint-touch">{t('intro.hintTouch')}</span>
      </p>

      <button type="button" className="intro__skip" onClick={finish}>
        {t('intro.skip')} <kbd>Esc</kbd>
      </button>
    </div>
  )
}

export default IntroCover
