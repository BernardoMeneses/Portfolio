import { useEffect } from 'react'
import { useToast } from './ToastProvider'
import { useI18n } from '../context/Preferences'
import { useAchievements } from '../context/Achievements'

const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

// ↑ ↑ ↓ ↓ ← → ← → B A toggles "cheat mode" on the whole page.
const KonamiCode = () => {
  const { showToast } = useToast()
  const { t } = useI18n()
  const { unlock } = useAchievements()

  useEffect(() => {
    let position = 0

    const onKey = (e) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      position = key === SEQUENCE[position] ? position + 1 : (key === SEQUENCE[0] ? 1 : 0)

      if (position === SEQUENCE.length) {
        position = 0
        const on = document.documentElement.classList.toggle('cheat-mode')
        showToast(on ? t('konami.on') : t('konami.off'), { type: 'success' })
        if (on) unlock('cheater')
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showToast, t, unlock])

  return null
}

export default KonamiCode
