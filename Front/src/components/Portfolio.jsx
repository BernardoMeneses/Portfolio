import React, { useState, useEffect } from 'react'
import './Styles/Portfolio.scss'
import './Styles/ProjectCard.scss'
import ProjectCard from './ProjectCard'
import { API_URL } from '../config/api'
import { useCallback } from 'react'
import { useToast } from './ToastProvider'

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
        // show toast for visibility
        showToast('Error fetching projects: ' + (err.message || ''), { type: 'error' })
      })
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const { showToast, showConfirm } = useToast()
  const [showAdd, setShowAdd] = useState(false)
  const [newProject, setNewProject] = useState({ title: '', description: '', repo: '', link: '', image: '', tech: '' })
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingProject, setEditingProject] = useState({ title: '', description: '', repo: '', link: '', image: '', tech: '' })

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
      .catch(err => { showToast('Error: ' + (err.message || ''), { type: 'error' }) })
  }

  const startEditProject = (proj, idx) => {
    setEditingIndex(idx)
    setEditingProject({
      title: proj.title || '',
      description: proj.description || '',
      repo: proj.repo || '',
      link: proj.link || '',
      image: proj.image || '',
      tech: (proj.tech && proj.tech.join(', ')) || ''
    })
  }

  const submitEditProject = (e) => {
    e.preventDefault()
    const payload = {
      title: editingProject.title,
      description: editingProject.description,
      repo: editingProject.repo,
      link: editingProject.link,
      image: editingProject.image,
      tech: editingProject.tech.split(',').map(s => s.trim()).filter(Boolean)
    }
    fetch(`${API_URL}/api/projects/${editingIndex}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-ADMIN-TOKEN': adminToken || ''
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to edit project')
        return res.json()
      })
      .then(() => {
        setEditingIndex(null)
        setEditingProject({ title: '', description: '', repo: '', link: '', image: '', tech: '' })
        fetchProjects()
      })
      .catch(err => { showToast('Error: ' + (err.message || ''), { type: 'error' }) })
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
          <div className="admin-controls" style={{ marginBottom: 16 }}>
            <button className="btn-outline" onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancel' : 'Add Project'}</button>
            {showAdd && (
              <form onSubmit={submitNewProject} style={{ marginTop: 8 }} className="admin-form">
                <input className="input-field" placeholder="Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} required />
                <input className="input-field" placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
                <input className="input-field" placeholder="Repo" value={newProject.repo} onChange={e => setNewProject({ ...newProject, repo: e.target.value })} />
                <input className="input-field" placeholder="Link" value={newProject.link} onChange={e => setNewProject({ ...newProject, link: e.target.value })} />
                <input className="input-field" placeholder="Image URL" value={newProject.image} onChange={e => setNewProject({ ...newProject, image: e.target.value })} />
                <input className="input-field" placeholder="Tech (comma separated)" value={newProject.tech} onChange={e => setNewProject({ ...newProject, tech: e.target.value })} />
                <button className="btn-primary" type="submit">Save</button>
              </form>
            )}

            {/* Edit form shown when editingIndex is set */}
            {editingIndex !== null && (
              <div style={{ marginTop: 12 }}>
                <h4>Edit project</h4>
                <form onSubmit={submitEditProject} className="admin-form">
                  <input className="input-field" placeholder="Title" value={editingProject.title} onChange={e => setEditingProject({ ...editingProject, title: e.target.value })} required />
                  <input className="input-field" placeholder="Description" value={editingProject.description} onChange={e => setEditingProject({ ...editingProject, description: e.target.value })} />
                  <input className="input-field" placeholder="Repo" value={editingProject.repo} onChange={e => setEditingProject({ ...editingProject, repo: e.target.value })} />
                  <input className="input-field" placeholder="Link" value={editingProject.link} onChange={e => setEditingProject({ ...editingProject, link: e.target.value })} />
                  <input className="input-field" placeholder="Image URL" value={editingProject.image} onChange={e => setEditingProject({ ...editingProject, image: e.target.value })} />
                  <input className="input-field" placeholder="Tech (comma separated)" value={editingProject.tech} onChange={e => setEditingProject({ ...editingProject, tech: e.target.value })} />
                  <button className="btn-primary" type="submit">Save Changes</button>
                  <button className="btn-outline" type="button" onClick={() => setEditingIndex(null)}>Cancel</button>
                </form>
              </div>
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
              isAdmin={!!adminToken}
              onDelete={async () => {
                const ok = await showConfirm(`Remove project ${project.title}?`, 'Remove project')
                if (!ok) return
                try {
                  const res = await fetch(`${API_URL}/api/projects/${index}`, {
                    method: 'DELETE',
                    headers: { 'X-ADMIN-TOKEN': adminToken || '' }
                  })
                  if (!res.ok) {
                    let msg = 'Failed to remove project'
                    try { const j = await res.json(); msg = j.detail || j.message || JSON.stringify(j) } catch(e){ msg = await res.text().catch(()=>msg) }
                    throw new Error(msg)
                  }
                  fetchProjects()
                  showToast('Project removed', { type: 'success' })
                } catch (err) { showToast('Error: ' + (err.message || ''), { type: 'error' }) }
              }}
              onEdit={() => startEditProject(project, index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Portfolio
