import React, { useEffect, useState } from 'react'
import './Styles/Portfolio.scss'
import './Styles/ProjectCard.scss'
import ProjectCard from './ProjectCard'
import { API_URL } from '../config/api'
import { useToast } from './ToastProvider'

const getApiErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json()
    return data?.error || data?.message || fallbackMessage
  } catch (error) {
    try {
      const text = await response.text()
      return text || fallbackMessage
    } catch (readError) {
      return fallbackMessage
    }
  }
}

const Portfolio = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/api/projects`)

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Failed to fetch projects'))
        }

        const data = await response.json()
        setProjects(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        console.error('Error fetching projects from backend:', err)
        setError(err.message)
        showToast('Error fetching projects: ' + (err.message || ''), { type: 'error' })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [showToast])

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
              key={project.id || index}
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
