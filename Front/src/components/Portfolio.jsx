import React, { useState, useEffect } from 'react'
import './Styles/Portfolio.scss'
import './Styles/ProjectCard.scss'
import ProjectCard from './ProjectCard'
import { API_URL } from '../config/api'
import { useCallback } from 'react'

const Portfolio = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProjects = useCallback(() => {
    setLoading(true)
    fetch(`${API_URL}/api/projects`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch projects')
        return response.json()
      })
      .then(data => {
        if (Array.isArray(data)) setProjects(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching projects from backend:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

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
