import React, { useState } from 'react'
import { useI18n } from '../context/Preferences'
import { isStatusTag } from '../services/portfolioData'

const TAB_POSITIONS = ['6%', '34%', '62%']
const TAB_COLORS = ['#6c63ff', '#ff8fd1', '#7cf4d6', '#ffb86b', '#a259ff']

export const fileNumber = (index) => `#${String(index + 1).padStart(2, '0')}`

export const projectDescription = (project, lang) => project[`description_${lang}`] || project.description

// A manila archive folder: hover slides the sheet out, click opens the full file.
const ProjectCard = ({ project, index, onOpen }) => {
  const { t, lang } = useI18n()
  const [imageOk, setImageOk] = useState(true)
  const tech = (project.tech || []).filter((tag) => !isStatusTag(tag))
  const inProgress = (project.tech || []).some(isStatusTag)

  return (
    <article
      className="folder"
      style={{
        '--tab-x': TAB_POSITIONS[index % TAB_POSITIONS.length],
        '--tab-color': TAB_COLORS[index % TAB_COLORS.length],
      }}
    >
      <button type="button" className="folder__button" onClick={(e) => onOpen(project, index, e.currentTarget)}>
        <span className="folder__tab">
          {fileNumber(index)} · {project.title}
        </span>
        <span className="folder__back" aria-hidden="true" />

        <span className="folder__sheet" aria-hidden="true">
          <span className="folder__clip" />
          {project.image && imageOk ? (
            <img src={project.image} alt="" loading="lazy" onError={() => setImageOk(false)} />
          ) : (
            <span className="folder__noimg">{project.title}</span>
          )}
          <span className="folder__caption">{t('projects.file')} {fileNumber(index)}</span>
        </span>

        <span className="folder__front">
          <span className="folder__title">{project.title}</span>
          <span className="folder__desc">{projectDescription(project, lang)}</span>
          <span className="folder__tech">
            {tech.slice(0, 4).map((tag) => (
              <span key={tag} className="folder__tag">{tag}</span>
            ))}
          </span>
          <span className="folder__open">{t('projects.open')} →</span>
          {inProgress && <span className="folder__stamp">{t('projects.inProgress')}</span>}
        </span>
      </button>
    </article>
  )
}

export default ProjectCard
