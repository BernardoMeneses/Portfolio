import React, { useEffect, useRef, useState } from 'react'
import { API_URL } from '../config/api'
import { useI18n } from '../context/Preferences'
import { useAchievements } from '../context/Achievements'
import { getApiErrorMessage } from '../services/portfolioData'
import { useToast } from './ToastProvider'
import './Styles/Guestbook.scss'

const COLORS = ['yellow', 'pink', 'blue', 'green', 'purple']
const MAX_MESSAGE = 140

// Stable "hand-placed" tilt per note
const tiltFor = (id) => {
  const n = Math.abs(Number(id) || 0)
  return ((n % 9) - 4) * 0.9
}

const Guestbook = () => {
  const { t, lang } = useI18n()
  const { unlock } = useAchievements()
  const { showToast } = useToast()
  const [entries, setEntries] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [form, setForm] = useState({ name: '', message: '', color: 'yellow', website: '' })
  const [sending, setSending] = useState(false)
  const [newId, setNewId] = useState(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    let alive = true
    fetch(`${API_URL}/api/guestbook`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data) => {
        if (!alive) return
        setEntries(Array.isArray(data) ? data : [])
        setStatus('ready')
      })
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
  }, [])

  // Reaching the back cover means the visitor went through the whole portfolio
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          unlock('reader')
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [unlock])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    try {
      const res = await fetch(`${API_URL}/api/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const msg = res.status === 429 ? t('guestbook.slowDown') : await getApiErrorMessage(res, res.statusText)
        showToast(t('guestbook.error', { msg }), { type: 'error' })
        return
      }

      const { entry } = await res.json()
      if (entry) {
        setEntries((list) => [entry, ...list])
        setNewId(entry.id)
        setStatus('ready')
      }
      setForm((f) => ({ ...f, name: '', message: '' }))
      showToast(t('guestbook.success'), { type: 'success' })
      unlock('guest')
    } catch (error) {
      showToast(t('guestbook.error', { msg: error.message || '' }), { type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const dateFormat = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-PT' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <section id="guestbook" className="guestbook section" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">{t('guestbook.title')}</h2>
        <p className="section-subtitle">{t('guestbook.subtitle')}</p>

        <div className="backcover">
          <form className="notepad" onSubmit={submit}>
            <span className="notepad__binding" aria-hidden="true" />
            <label className="sr-only" htmlFor="gb-name">{t('guestbook.name')}</label>
            <input
              id="gb-name"
              className="notepad__name"
              value={form.name}
              onChange={update('name')}
              placeholder={t('guestbook.name')}
              maxLength={40}
              required
              disabled={sending}
            />

            <label className="sr-only" htmlFor="gb-message">{t('guestbook.message', { max: MAX_MESSAGE })}</label>
            <textarea
              id="gb-message"
              className="notepad__message"
              value={form.message}
              onChange={update('message')}
              placeholder={t('guestbook.message', { max: MAX_MESSAGE })}
              maxLength={MAX_MESSAGE}
              rows={4}
              required
              disabled={sending}
            />
            <span className="notepad__count">{form.message.length}/{MAX_MESSAGE}</span>

            {/* Honeypot for bots */}
            <input
              className="notepad__hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.website}
              onChange={update('website')}
              name="website"
            />

            <fieldset className="notepad__colors">
              <legend className="sr-only">{t('guestbook.color')}</legend>
              {COLORS.map((color) => (
                <label key={color} className={`swatch swatch--${color}`} title={t(`guestbook.colors.${color}`)}>
                  <input
                    type="radio"
                    name="gb-color"
                    value={color}
                    checked={form.color === color}
                    onChange={update('color')}
                  />
                  <span className="sr-only">{t(`guestbook.colors.${color}`)}</span>
                </label>
              ))}
            </fieldset>

            <button type="submit" className="btn-primary notepad__submit" disabled={sending}>
              📌 {sending ? t('guestbook.sending') : t('guestbook.submit')}
            </button>
          </form>

          <div className="board" aria-live="polite">
            {status === 'error' && <p className="board__empty">{t('guestbook.loadError')}</p>}
            {status === 'ready' && entries.length === 0 && <p className="board__empty">{t('guestbook.empty')}</p>}
            {entries.map((entry) => (
              <figure
                key={entry.id}
                className={`note note--${entry.color}${entry.id === newId ? ' is-new' : ''}`}
                style={{ '--tilt': `${tiltFor(entry.id)}deg` }}
              >
                <blockquote>{entry.message}</blockquote>
                <figcaption>
                  — {entry.name}
                  {entry.createdAt && <time dateTime={entry.createdAt}>{dateFormat.format(new Date(entry.createdAt))}</time>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Guestbook
