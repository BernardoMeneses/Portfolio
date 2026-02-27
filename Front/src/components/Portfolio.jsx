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

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const [showAdd, setShowAdd] = useState(false)
  const [newProject, setNewProject] = useState({ title: '', description: '', repo: '', link: '', image: '', tech: '' })

  const submitNewProject = (e) => {
    e.preventDefault()
    const payload = {
      title: newProject.title,
      description: newProject.description,
      repo: newProject.repo,
      link: newProject.link,
      image: newProject.image,
      tech: newProject.tech.split(',').map(s => s.trim()).filter(Boolean)
    }
    fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ADMIN-TOKEN': adminToken || ''
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add project')
        return res.json()
      })
      .then(() => {
        setShowAdd(false)
        setNewProject({ title: '', description: '', repo: '', link: '', image: '', tech: '' })
        fetchProjects()
      })
      .catch(err => alert('Error: ' + err.message))
  }

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
        {adminToken && (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancel' : 'Add Project'}</button>
            {showAdd && (
              <form onSubmit={submitNewProject} style={{ marginTop: 8 }}>
                <input placeholder="Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} required />
                <input placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
                <input placeholder="Repo" value={newProject.repo} onChange={e => setNewProject({ ...newProject, repo: e.target.value })} />
                <input placeholder="Link" value={newProject.link} onChange={e => setNewProject({ ...newProject, link: e.target.value })} />
                <input placeholder="Image URL" value={newProject.image} onChange={e => setNewProject({ ...newProject, image: e.target.value })} />
                <input placeholder="Tech (comma separated)" value={newProject.tech} onChange={e => setNewProject({ ...newProject, tech: e.target.value })} />
                <button type="submit">Save</button>
              </form>
            )}
          </div>
        )}

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
