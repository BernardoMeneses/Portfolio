import React, { useState, useEffect } from 'react'
import './Styles/Portfolio.scss'
import './Styles/ProjectCard.scss'
import ProjectCard from './ProjectCard'
import { API_URL } from '../config/api'
import projectsData from '../data/projects.json'

const Portfolio = () => {
  const [projects, setProjects] = useState(projectsData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // By default use the local `projects.json` (same logic as Skills).
    // Only attempt a remote fetch when explicitly forced via env var.
    const FORCE_REMOTE = import.meta.env.VITE_FORCE_REMOTE_PROJECTS === 'true'
    if (!FORCE_REMOTE) return

    // If API points to localhost, skip remote fetch and use local JSON
    if (API_URL.includes('localhost')) return

    setLoading(true)
    fetch(`${API_URL}/api/projects`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }
        return response.json()
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.warn('Could not fetch remote projects, using local data:', err)
        // Only surface an error UI when the user explicitly forced remote fetch
        if (FORCE_REMOTE) setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section id="portfolio" className="portfolio section">
        <div className="container">
          <h2 className="section-title">Projects</h2>
          <div className="loading">Carregando projetos...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="portfolio" className="portfolio section">
        <div className="container">
          <h2 className="section-title">Projects</h2>
          <div className="error">Erro ao carregar projetos: {error}</div>
        </div>
      </section>
    )
  }

  return (
    <section id="portfolio" className="portfolio section">
      <div className="container">
        <h2 className="section-title">Projects</h2>
        
        <div className="ProjectsGrid">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              repoLink={project.repo}
              projectLink={project.link}
              image={project.image}
              tech={project.tech}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Portfolio
