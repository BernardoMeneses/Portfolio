import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../context/Preferences'
import { isStatusTag } from '../services/portfolioData'
import { fileNumber, projectDescription } from './ProjectCard'

// The opened folder: screenshot clipped on the left flap, the case file on the right.
const ProjectDossier = ({ project, index, onClose }) => {
  const { t, lang } = useI18n()
  const closeRef = useRef(null)
  const [imageOk, setImageOk] = useState(true)
  const tech = (project.tech || []).filter((tag) => !isStatusTag(tag))
  const inProgress = (project.tech || []).some(isStatusTag)

  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Portalled so filters/transforms on <main> never trap the fixed overlay
  return createPortal(
    <div className="dossier-overlay" onClick={onClose}>
      <div
        className="dossier"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dossier__flap">
          <div className="dossier__photo">
            <span className="dossier__clip" aria-hidden="true" />
            {project.image && imageOk ? (
              <img src={project.image} alt={project.title} onError={() => setImageOk(false)} />
            ) : (
              <span className="dossier__noimg">{project.title}</span>
            )}
          </div>

          <div className="dossier__stack">
            <span>{t('projects.stack')}</span>
            <ul>
              {tech.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="dossier__page">
          <button ref={closeRef} type="button" className="dossier__close" onClick={onClose} aria-label={t('projects.close')}>
            ✕
          </button>

          <span className="dossier__kicker">{t('projects.file')} {fileNumber(index)}</span>
          <h3 id="dossier-title" className="dossier__title">{project.title}</h3>

          <dl className="dossier__meta">
            <div>
              <dt>{t('projects.status')}</dt>
              <dd>{inProgress ? t('projects.inProgress') : t('projects.shipped')}</dd>
            </div>
          </dl>

          <p className="dossier__desc">{projectDescription(project, lang)}</p>

          <div className="dossier__links">
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noopener noreferrer" className="dossier__link">
                <i className="fab fa-github"></i> {t('projects.repo')}
              </a>
            )}
            {project.link && (
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="dossier__link dossier__link--primary">
                <i className="fas fa-arrow-up-right-from-square"></i> {t('projects.live')}
              </a>
            )}
          </div>

          <span className={`dossier__stamp${inProgress ? ' dossier__stamp--wip' : ''}`} aria-hidden="true">
            {inProgress ? t('projects.inProgress') : t('projects.shipped')}
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ProjectDossier
