import React, { useEffect, useMemo, useRef, useState } from 'react'
import './Styles/Skills.scss'
import { useToast } from './ToastProvider'
import { useI18n } from '../context/Preferences'
import { useAchievements } from '../context/Achievements'
import { getProjects, getSkills } from '../services/portfolioData'
import { getSkillMeta } from '../data/skillMeta'

const CATEGORIES = ['stack', 'dbStack', 'tools', 'aiStack']
const COLUMNS = 6

const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9+#]/g, '')

// "Sass/SCSS" matches a project tagged "SCSS" or "Sass"
const projectsUsing = (skillName, projects) => {
  const aliases = skillName.split('/').map(normalize).filter(Boolean)
  return projects.filter((project) =>
    (project.tech || []).some((tag) => aliases.includes(normalize(tag)))
  )
}

const Skills = () => {
  const { t, lang } = useI18n()
  const { showToast } = useToast()
  const { unlock } = useAchievements()
  const [skills, setSkills] = useState({})
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const inspected = useRef(new Set())

  useEffect(() => {
    let alive = true

    getSkills()
      .then((data) => alive && setSkills(data))
      .catch((err) => {
        console.error('Error fetching skills from backend:', err)
        showToast(t('skills.fetchError', { msg: err.message || '' }), { type: 'error' })
      })

    // Only used to enrich the inspector; failures are reported by the projects section
    getProjects()
      .then((data) => alive && setProjects(data))
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [showToast, t])

  const groups = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        items: (skills[category] || []).map((skill, index) => ({
          ...skill,
          ...getSkillMeta(skill.name),
          id: `${category}-${index}`,
          category,
        })),
      })).filter((group) => group.items.length > 0),
    [skills]
  )

  const allItems = groups.flatMap((group) => group.items)
  const selected = allItems.find((item) => item.id === selectedId) || allItems[0]
  const totalSlots = groups.reduce((sum, g) => sum + Math.ceil(g.items.length / COLUMNS) * COLUMNS, 0)

  const inspect = (item) => {
    setSelectedId(item.id)
    inspected.current.add(item.id)
    if (allItems.length > 0 && inspected.current.size >= allItems.length) unlock('collector')
  }

  const usedIn = selected ? projectsUsing(selected.name, projects) : []

  return (
    <section id="skills" className="skills section">
      <div className="container">
        <h2 className="section-title">{t('skills.title')}</h2>
        <p className="section-subtitle">{t('skills.subtitle')}</p>

        <div className="inventory">
          <div className="inventory__panel">
            <header className="inventory__bar">
              <span>🎒 bernardo.inv</span>
              <span>{t('skills.slots', { used: allItems.length, total: totalSlots })}</span>
            </header>

            {groups.map((group) => {
              const empty = Math.ceil(group.items.length / COLUMNS) * COLUMNS - group.items.length
              return (
                <div key={group.category} className="inventory__group">
                  <h3 className="inventory__group-title">{t(`skills.categories.${group.category}`)}</h3>
                  <div className="inventory__grid">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`slot slot--${item.rarity}${selected?.id === item.id ? ' is-selected' : ''}`}
                        aria-label={`${item.name} · ${t(`skills.rarity.${item.rarity}`)}`}
                        aria-pressed={selected?.id === item.id}
                        onPointerEnter={(e) => e.pointerType === 'mouse' && inspect(item)}
                        onFocus={() => inspect(item)}
                        onClick={() => inspect(item)}
                      >
                        <img src={item.image} alt="" loading="lazy" />
                        <span className="slot__gem" aria-hidden="true" />
                      </button>
                    ))}
                    {Array.from({ length: empty }, (_, i) => (
                      <span key={`empty-${i}`} className="slot slot--empty" aria-hidden="true" />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <aside className={`inspector${selected ? ` inspector--${selected.rarity}` : ''}`} aria-live="polite">
            {selected ? (
              <>
                <div className="inspector__head">
                  <span className="inspector__icon">
                    <img src={selected.image} alt="" />
                  </span>
                  <div>
                    <h3 className="inspector__name">{selected.name}</h3>
                    <p className="inspector__type">
                      {t(`skills.rarity.${selected.rarity}`)} · {t(`skills.types.${selected.category}`)}
                    </p>
                  </div>
                </div>

                {typeof selected.level === 'number' && (
                  <div className="inspector__level">
                    <span>{t('skills.level')}</span>
                    <span className="inspector__bar">
                      <span style={{ width: `${selected.level}%` }} />
                    </span>
                    <b>{selected.level}</b>
                  </div>
                )}

                <div className="inspector__used">
                  <span>{t('skills.usedIn')}</span>
                  {usedIn.length > 0 ? (
                    <ul>
                      {usedIn.map((project) => (
                        <li key={project.title}>▸ {project.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{t('skills.notUsed')}</p>
                  )}
                </div>

                {selected.flavor && <p className="inspector__flavor">“{selected.flavor[lang] || selected.flavor.en}”</p>}
              </>
            ) : (
              <p className="inspector__empty">{t('skills.pick')}</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Skills
