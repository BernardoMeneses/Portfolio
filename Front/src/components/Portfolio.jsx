import React, { useCallback, useEffect, useRef, useState } from 'react'
import './Styles/Portfolio.scss'
import './Styles/ProjectCard.scss'
import ProjectCard from './ProjectCard'
import ProjectDossier from './ProjectDossier'
import { useToast } from './ToastProvider'
import { useI18n } from '../context/Preferences'
import { useAchievements } from '../context/Achievements'
import { getProjects } from '../services/portfolioData'

const Portfolio = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openFile, setOpenFile] = useState(null)
  const { showToast } = useToast()
  const { t } = useI18n()
  const { unlock } = useAchievements()
  const opened = useRef(new Set())
  const trigger = useRef(null)

  useEffect(() => {
    let alive = true

    getProjects()
      .then((data) => {
        if (!alive) return
        setProjects(data)
        setError(null)
      })
      .catch((err) => {
        if (!alive) return
        console.error('Error fetching projects from backend:', err)
        setError(err.message)
        showToast(t('projects.fetchError', { msg: err.message || '' }), { type: 'error' })
      })
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
    }
  }, [showToast, t])

  const handleOpen = (project, index, button) => {
    trigger.current = button
    setOpenFile({ project, index })
    opened.current.add(index)
    if (opened.current.size >= projects.length) unlock('archivist')
  }

  const handleClose = useCallback(() => {
    setOpenFile(null)
    trigger.current?.focus()
  }, [])

  let body
  if (loading) {
    body = <div className="loading">{t('projects.loading')}</div>
  } else if (error) {
    body = <div className="error">{t('projects.error', { msg: error })}</div>
  } else if (projects.length === 0) {
    body = <div className="loading">{t('projects.empty')}</div>
  } else {
    body = (
      <div className="ProjectsGrid">
        {projects.map((project, index) => (
          <ProjectCard key={project.id || index} project={project} index={index} onOpen={handleOpen} />
        ))}
      </div>
    )
  }

  return (
    <section id="portfolio" className="portfolio section">
      <div className="container">
        <h2 className="section-title">{t('projects.title')}</h2>
        <p className="section-subtitle">{t('projects.subtitle')}</p>
        {body}
      </div>

      {openFile && <ProjectDossier project={openFile.project} index={openFile.index} onClose={handleClose} />}
    </section>
  )
}

export default Portfolio
