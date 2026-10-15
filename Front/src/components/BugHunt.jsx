import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../context/Preferences'
import { useAchievements } from '../context/Achievements'
import './Styles/BugHunt.scss'

const DURATION = 30 // seconds
const MAX_BUGS = 14
const BEST_KEY = 'bm:bug-best'
const COMBO_WINDOW = 1200 // ms between squashes to keep a combo going
const EDGE = 40

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch (error) {
    return 0
  }
}

let nextId = 1

// Spawn just outside a random edge, heading roughly towards the middle of the screen
const spawnBug = (elapsed) => {
  const w = window.innerWidth
  const h = window.innerHeight
  const edge = Math.floor(Math.random() * 4)
  const x = edge === 0 ? -EDGE : edge === 1 ? w + EDGE : Math.random() * w
  const y = edge === 2 ? -EDGE : edge === 3 ? h + EDGE : Math.random() * h
  const target = { x: w * (0.25 + Math.random() * 0.5), y: h * (0.25 + Math.random() * 0.5) }
  const critical = Math.random() < 0.18 + elapsed / DURATION * 0.12
  const base = critical ? 170 : 75
  return {
    id: nextId++,
    x,
    y,
    angle: Math.atan2(target.y - y, target.x - x),
    speed: base + Math.random() * 45 + elapsed * 2,
    critical,
    phase: Math.random() * Math.PI * 2,
    entered: false,
  }
}

const BugSprite = ({ critical }) => (
  <svg className="bug-sprite" viewBox="0 0 40 40" aria-hidden="true">
    <g className="bug-sprite__legs">
      <path d="M14 15 L5 10 M13 21 L3 21 M14 27 L6 33 M26 15 L35 10 M27 21 L37 21 M26 27 L34 33" />
    </g>
    <path className="bug-sprite__antennae" d="M18 8 L14 2 M22 8 L26 2" />
    <ellipse cx="20" cy="23" rx="8.5" ry="10.5" className={critical ? 'bug-sprite__body bug-sprite__body--critical' : 'bug-sprite__body'} />
    <circle cx="20" cy="11" r="5" className="bug-sprite__head" />
    <path d="M20 13.5 V33" className="bug-sprite__split" />
    <circle cx="16" cy="20" r="1.8" className="bug-sprite__spot" />
    <circle cx="24" cy="26" r="1.8" className="bug-sprite__spot" />
  </svg>
)

const BugHunt = () => {
  const { t } = useI18n()
  const { unlock } = useAchievements()
  const [phase, setPhase] = useState('idle') // idle | playing | over
  const [, setFrame] = useState(0)
  const [hud, setHud] = useState({ score: 0, time: DURATION, combo: 0 })
  const [result, setResult] = useState(null)
  const [best, setBest] = useState(readBest)

  const game = useRef(null)
  const raf = useRef(0)

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current)
    game.current = null
  }, [])

  const finish = useCallback(() => {
    const g = game.current
    if (!g) return
    stop()
    const isBest = g.score > readBest()
    if (isBest) {
      try {
        localStorage.setItem(BEST_KEY, String(g.score))
      } catch (error) {
        // ignore
      }
      setBest(g.score)
    }
    if (g.score >= 25) unlock('exterminator')
    setResult({ score: g.score, squashed: g.squashed, shipped: g.shipped, isBest })
    setPhase('over')
  }, [stop, unlock])

  const loop = useCallback((now) => {
    const g = game.current
    if (!g) return
    const dt = Math.min((now - g.last) / 1000, 0.05)
    g.last = now
    const elapsed = (now - g.start) / 1000
    const w = window.innerWidth
    const h = window.innerHeight

    // Spawning speeds up as the sprint goes on
    g.spawnIn -= dt * 1000
    if (g.spawnIn <= 0 && g.bugs.length < MAX_BUGS) {
      g.bugs.push(spawnBug(elapsed))
      g.spawnIn = Math.max(320, 950 - elapsed * 25)
    }

    g.bugs = g.bugs.filter((bug) => {
      bug.phase += dt * 6
      bug.angle += Math.sin(bug.phase) * dt * 1.6
      bug.x += Math.cos(bug.angle) * bug.speed * dt
      bug.y += Math.sin(bug.angle) * bug.speed * dt

      const inside = bug.x > 0 && bug.x < w && bug.y > 0 && bug.y < h
      if (inside) bug.entered = true
      const gone = bug.x < -EDGE * 2 || bug.x > w + EDGE * 2 || bug.y < -EDGE * 2 || bug.y > h + EDGE * 2
      if (gone && bug.entered) {
        g.shipped += 1
        return false
      }
      return !gone || !bug.entered
    })

    g.splats = g.splats.filter((s) => now - s.at < 700)
    if (g.combo && now - g.lastHit > COMBO_WINDOW) g.combo = 0

    const time = Math.max(0, Math.ceil(DURATION - elapsed))
    setHud({ score: g.score, time, combo: g.combo })
    setFrame((f) => f + 1)

    if (elapsed >= DURATION) {
      finish()
      return
    }
    raf.current = requestAnimationFrame(loop)
  }, [finish])

  const start = () => {
    const now = performance.now()
    game.current = {
      bugs: [],
      splats: [],
      score: 0,
      squashed: 0,
      shipped: 0,
      combo: 0,
      lastHit: 0,
      start: now,
      last: now,
      spawnIn: 0,
    }
    setResult(null)
    setHud({ score: 0, time: DURATION, combo: 0 })
    setPhase('playing')
    raf.current = requestAnimationFrame(loop)
  }

  const quit = useCallback(() => {
    stop()
    setPhase('idle')
  }, [stop])

  useEffect(() => {
    if (phase === 'idle') return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') quit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, quit])

  useEffect(() => stop, [stop])

  const squash = (bug, e) => {
    e.stopPropagation()
    const g = game.current
    if (!g) return
    const now = performance.now()
    g.combo = now - g.lastHit <= COMBO_WINDOW ? g.combo + 1 : 1
    g.lastHit = now
    const points = (bug.critical ? 3 : 1) * (g.combo >= 5 ? 2 : 1)
    g.score += points
    g.squashed += 1
    g.bugs = g.bugs.filter((b) => b.id !== bug.id)
    g.splats.push({ id: bug.id, x: bug.x, y: bug.y, points, at: now, critical: bug.critical })
    unlock('firstBlood')
  }

  const missed = () => {
    if (game.current) game.current.combo = 0
  }

  const g = game.current

  return (
    <section id="breakroom" className="bughunt section">
      <div className="container">
        <h2 className="section-title">{t('bugs.title')}</h2>
        <p className="section-subtitle">{t('bugs.subtitle')}</p>

        <div className="bughunt__card">
          <div className="bughunt__preview" aria-hidden="true">
            <span className="bughunt__preview-bug bughunt__preview-bug--1"><BugSprite /></span>
            <span className="bughunt__preview-bug bughunt__preview-bug--2"><BugSprite critical /></span>
            <span className="bughunt__preview-bug bughunt__preview-bug--3"><BugSprite /></span>
          </div>
          <div className="bughunt__body">
            <p>{t('bugs.intro', { seconds: DURATION })}</p>
            <div className="bughunt__actions">
              <button type="button" className="btn-primary" onClick={start} disabled={phase === 'playing'}>
                🐞 {t('bugs.start')}
              </button>
              <span className="bughunt__best">
                {t('bugs.best')}: <b>{best}</b>
              </span>
            </div>
            <small className="bughunt__controls">{t('bugs.controls')}</small>
          </div>
        </div>
      </div>

      {phase !== 'idle' && createPortal(
        <div className="bughunt-layer" onPointerDown={missed}>
          {phase === 'playing' && g && (
            <>
              <div className="bughunt-hud" onPointerDown={(e) => e.stopPropagation()}>
                <span>{t('bugs.score')} <b>{hud.score}</b></span>
                <span>{t('bugs.time')} <b>{hud.time}s</b></span>
                <span className={hud.combo >= 5 ? 'is-hot' : ''}>
                  {t('bugs.combo')} <b>x{hud.combo}</b>
                </span>
                <button type="button" onClick={quit}>{t('bugs.quit')}</button>
              </div>

              {g.bugs.map((bug) => (
                <div
                  key={bug.id}
                  className={`bug${bug.critical ? ' bug--critical' : ''}`}
                  style={{ transform: `translate(${bug.x - 24}px, ${bug.y - 24}px) rotate(${bug.angle + Math.PI / 2}rad)` }}
                  onPointerDown={(e) => squash(bug, e)}
                >
                  <BugSprite critical={bug.critical} />
                </div>
              ))}

              {g.splats.map((s) => (
                <div key={`splat-${s.id}`} className={`splat${s.critical ? ' splat--critical' : ''}`} style={{ left: s.x, top: s.y }}>
                  <span>+{s.points}</span>
                </div>
              ))}
            </>
          )}

          {phase === 'over' && result && (
            <div className="bughunt-result" role="dialog" aria-modal="true" aria-labelledby="bughunt-result-title" onPointerDown={(e) => e.stopPropagation()}>
              <h3 id="bughunt-result-title">{t('bugs.over')}</h3>
              <p className="bughunt-result__score">{result.score}</p>
              <p>{t('bugs.result', { squashed: result.squashed, score: result.score })}</p>
              <p className="bughunt-result__shipped">{t('bugs.shipped', { shipped: result.shipped })}</p>
              {result.isBest && <p className="bughunt-result__best">{t('bugs.newBest')}</p>}
              <div className="bughunt-result__actions">
                <button type="button" className="btn-primary" onClick={start} autoFocus>{t('bugs.again')}</button>
                <button type="button" className="btn-outline" onClick={quit}>{t('bugs.quit')}</button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </section>
  )
}

export default BugHunt
