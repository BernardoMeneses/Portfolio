import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from './Preferences'
import '../components/Styles/Achievements.scss'

// Titles / descriptions live in translations under achievements.list.<id>
export const ACHIEVEMENTS = [
  { id: 'opened', icon: '📂', points: 10 },
  { id: 'holo', icon: '✨', points: 10 },
  { id: 'polyglot', icon: '🌍', points: 10 },
  { id: 'paper', icon: '📄', points: 10 },
  { id: 'collector', icon: '🎒', points: 20 },
  { id: 'archivist', icon: '🗄️', points: 20 },
  { id: 'firstBlood', icon: '🐞', points: 10 },
  { id: 'exterminator', icon: '🔨', points: 30 },
  { id: 'guest', icon: '📝', points: 30 },
  { id: 'reader', icon: '📖', points: 20 },
  { id: 'cheater', icon: '🎮', points: 50 },
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
      <div className="achievement-live" role="status" aria-live="polite">
        {achievement && (
          <div className="achievement-popup" key={achievement.id}>
            <span className="achievement-popup__icon" aria-hidden="true">{achievement.icon}</span>
            <span className="achievement-popup__text">
              <small>{t('achievements.unlocked')}</small>
              <strong>{t(`achievements.list.${achievement.id}.title`)}</strong>
            </span>
            <span className="achievement-popup__points">G {achievement.points}</span>
          </div>
        )}
      </div>
    </AchievementsContext.Provider>
  )
}

export const useAchievements = () => useContext(AchievementsContext)
