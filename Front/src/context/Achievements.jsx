import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from './Preferences'
import AchievementStamp, { InkFilter } from '../components/AchievementStamp'
import '../components/Styles/Achievements.scss'

// Titles / descriptions live in translations under achievements.list.<id>.
// `ink` is the colour the stamp is printed in.
export const ACHIEVEMENTS = [
  { id: 'opened', ink: '#5b3fc4' },
  { id: 'holo', ink: '#1f4f9a' },
  { id: 'polyglot', ink: '#13806b' },
  { id: 'paper', ink: '#8a5a12' },
  { id: 'collector', ink: '#5b3fc4' },
  { id: 'archivist', ink: '#1f4f9a' },
  { id: 'firstBlood', ink: '#b3261e' },
  { id: 'exterminator', ink: '#b3261e' },
  { id: 'guest', ink: '#13806b' },
  { id: 'reader', ink: '#8a5a12' },
  { id: 'cheater', ink: '#8e2f6f' },
]

const STORAGE_KEY = 'bm:achievements'
const POPUP_MS = 4200

const readUnlocked = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

const AchievementsContext = createContext(null)

export const AchievementsProvider = ({ children }) => {
  const { t } = useI18n()
  const [unlocked, setUnlocked] = useState(readUnlocked)
  const [queue, setQueue] = useState([])
  const unlockedRef = useRef(new Set(unlocked))

  const unlock = useCallback((id) => {
    if (unlockedRef.current.has(id) || !ACHIEVEMENTS.some((a) => a.id === id)) return
    unlockedRef.current.add(id)
    const next = [...unlockedRef.current]
    setUnlocked(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (error) {
      // Not persisted, still celebrated.
    }
    setQueue((q) => [...q, id])
  }, [])

  // Show one popup at a time
  const current = queue[0]
  useEffect(() => {
    if (!current) return undefined
    const timer = setTimeout(() => setQueue((q) => q.slice(1)), POPUP_MS)
    return () => clearTimeout(timer)
  }, [current])

  const value = useMemo(() => ({ unlocked, unlock }), [unlocked, unlock])
  const achievement = ACHIEVEMENTS.find((a) => a.id === current)

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      <InkFilter />
      <div className="achievement-live" role="status" aria-live="polite">
        {achievement && (
          <div className="achievement-slip" key={achievement.id} style={{ '--ink': achievement.ink }}>
            <AchievementStamp id={achievement.id} className="achievement-slip__stamp" />
            <div className="achievement-slip__text">
              <small>{t('achievements.unlocked')}</small>
              <strong>{t(`achievements.list.${achievement.id}.title`)}</strong>
              <span>{t(`achievements.list.${achievement.id}.desc`)}</span>
            </div>
          </div>
        )}
      </div>
    </AchievementsContext.Provider>
  )
}

export const useAchievements = () => useContext(AchievementsContext)
