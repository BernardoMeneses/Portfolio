import React, { useState, useEffect } from 'react'
import './Styles/Skills.scss'
import { API_URL } from '../config/api'

const Skills = () => {
  const [skills, setSkills] = useState([])
  const [dbStack, setDbStack] = useState([])
  const [tools, setTools] = useState([])
  const [aiStack, setAiStack] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/skills`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch skills')
        return res.json()
      })
      .then(data => {
        setSkills((data && data.stack) || [])
        setDbStack((data && data.dbStack) || [])
        setTools((data && data.tools) || [])
        setAiStack((data && data.aiStack) || [])
      })
      .catch(err => {
        console.error('Error fetching skills from backend:', err)
      })
  }, [])

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({ category: 'stack', name: '', image: '' })

  const submitNewSkill = (e) => {
    e.preventDefault()
    const payload = { category: newSkill.category, skill: { name: newSkill.name, image: newSkill.image } }
    fetch(`${API_URL}/api/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ADMIN-TOKEN': adminToken || ''
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add skill')
        return res.json()
      })
      .then(() => {
        setShowAddSkill(false)
        setNewSkill({ category: 'stack', name: '', image: '' })
        // reload skills
        fetch(`${API_URL}/api/skills`)
          .then(res => res.json())
          .then(data => {
            setSkills((data && data.stack) || [])
            setDbStack((data && data.dbStack) || [])
            setTools((data && data.tools) || [])
            setAiStack((data && data.aiStack) || [])
          })
      })
      .catch(err => alert('Error: ' + err.message))
  }

  return (
    <section id="skills" className="skills section">
      <div className="container">
        <h2 className="section-title">Tech Stack</h2>
        {adminToken && (
          <div className="admin-controls" style={{ marginBottom: 16 }}>
            <button className="btn-outline" onClick={() => setShowAddSkill(!showAddSkill)}>{showAddSkill ? 'Cancel' : 'Add Skill'}</button>
            {showAddSkill && (
              <form onSubmit={submitNewSkill} style={{ marginTop: 8 }} className="admin-form">
                <select className="input-field" value={newSkill.category} onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}>
                  <option value="stack">stack</option>
                  <option value="dbStack">dbStack</option>
                  <option value="tools">tools</option>
                  <option value="aiStack">aiStack</option>
                </select>
                <input className="input-field" placeholder="Name" value={newSkill.name} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })} required />
                <input className="input-field" placeholder="Image URL" value={newSkill.image} onChange={e => setNewSkill({ ...newSkill, image: e.target.value })} />
                <button className="btn-primary" type="submit">Save</button>
              </form>
            )}
          </div>
        )}

        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div key={index} className="skill-card">
              <div className="skill-icon">
                <img src={skill.image} alt={skill.name} />
              </div>

              <div className="skill-info">
                <h3 className="skill-name">{skill.name}</h3>
              </div>
            </div>
          ))}
        </div>

        {dbStack && dbStack.length > 0 && (
          <>
            <h2 className="section-title section-title--center">Databases</h2>
            <div className="skills-grid">
              {dbStack.map((skill, index) => (
                <div key={`db-${index}`} className="skill-card">
                  {adminToken && (
                    <>
                      <button className="skill-delete" onClick={async () => {
                        if (!confirm(`Remove skill ${skill.name} from dbStack?`)) return
                        try {
                          const res = await fetch(`${API_URL}/api/skills`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                            body: JSON.stringify({ category: 'dbStack', name: skill.name })
                          })
                          if (!res.ok) throw new Error('Failed to remove skill')
                          // reload skills
                          const data = await (await fetch(`${API_URL}/api/skills`)).json()
                          setSkills((data && data.stack) || [])
                          setDbStack((data && data.dbStack) || [])
                          setTools((data && data.tools) || [])
                          setAiStack((data && data.aiStack) || [])
                        } catch (err) { alert('Error: ' + err.message) }
                      }} title="Remove skill">✖</button>
                      <button className="skill-edit" onClick={async () => {
                        const newName = prompt('Novo nome da skill', skill.name)
                        if (newName === null) return
                        const newImage = prompt('Nova imagem URL (deixe em branco para manter)', skill.image || '')
                        try {
                          const res = await fetch(`${API_URL}/api/skills`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                            body: JSON.stringify({ category: 'dbStack', name: skill.name, skill: { name: newName, image: newImage } })
                          })
                          if (!res.ok) throw new Error('Failed to edit skill')
                          const data = await (await fetch(`${API_URL}/api/skills`)).json()
                          setSkills((data && data.stack) || [])
                          setDbStack((data && data.dbStack) || [])
                          setTools((data && data.tools) || [])
                          setAiStack((data && data.aiStack) || [])
                        } catch (err) { alert('Error: ' + err.message) }
                      }} title="Edit skill">✎</button>
                    </>
                  )}
                  <div className="skill-icon">
                    <img src={skill.image} alt={skill.name} />
                  </div>

                  <div className="skill-info">
                    <h3 className="skill-name">{skill.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tools && tools.length > 0 && (
          <>
            <h2 className="section-title section-title--center">Tools</h2>
            <div className="skills-grid">
              {tools.map((skill, index) => (
                <div key={`tool-${index}`} className="skill-card">
                  {adminToken && (
                        <>
                          <button className="skill-delete" onClick={async () => {
                            if (!confirm(`Remove skill ${skill.name} from tools?`)) return
                            try {
                              const res = await fetch(`${API_URL}/api/skills`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                                body: JSON.stringify({ category: 'tools', name: skill.name })
                              })
                              if (!res.ok) throw new Error('Failed to remove skill')
                              const data = await (await fetch(`${API_URL}/api/skills`)).json()
                              setSkills((data && data.stack) || [])
                              setDbStack((data && data.dbStack) || [])
                              setTools((data && data.tools) || [])
                              setAiStack((data && data.aiStack) || [])
                            } catch (err) { alert('Error: ' + err.message) }
                          }} title="Remove skill">✖</button>
                          <button className="skill-edit" onClick={async () => {
                            const newName = prompt('Novo nome da skill', skill.name)
                            if (newName === null) return
                            const newImage = prompt('Nova imagem URL (deixe em branco para manter)', skill.image || '')
                            try {
                              const res = await fetch(`${API_URL}/api/skills`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                                body: JSON.stringify({ category: 'tools', name: skill.name, skill: { name: newName, image: newImage } })
                              })
                              if (!res.ok) throw new Error('Failed to edit skill')
                              const data = await (await fetch(`${API_URL}/api/skills`)).json()
                              setSkills((data && data.stack) || [])
                              setDbStack((data && data.dbStack) || [])
                              setTools((data && data.tools) || [])
                              setAiStack((data && data.aiStack) || [])
                            } catch (err) { alert('Error: ' + err.message) }
                          }} title="Edit skill">✎</button>
                        </>
                      )}
                  <div className="skill-icon">
                    <img src={skill.image} alt={skill.name} />
                  </div>

                  <div className="skill-info">
                    <h3 className="skill-name">{skill.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {aiStack && aiStack.length > 0 && (
          <>
            <h2 className="section-title section-title--ai">AI Stack</h2>
            <div className="skills-grid">
              {aiStack.map((skill, index) => (
                <div key={`ai-${index}`} className="skill-card">
                  {adminToken && (
                    <>
                      <button className="skill-delete" onClick={async () => {
                        if (!confirm(`Remove skill ${skill.name} from aiStack?`)) return
                        try {
                          const res = await fetch(`${API_URL}/api/skills`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                            body: JSON.stringify({ category: 'aiStack', name: skill.name })
                          })
                          if (!res.ok) throw new Error('Failed to remove skill')
                          const data = await (await fetch(`${API_URL}/api/skills`)).json()
                          setSkills((data && data.stack) || [])
                          setDbStack((data && data.dbStack) || [])
                          setTools((data && data.tools) || [])
                          setAiStack((data && data.aiStack) || [])
                        } catch (err) { alert('Error: ' + err.message) }
                      }} title="Remove skill">✖</button>
                      <button className="skill-edit" onClick={async () => {
                        const newName = prompt('Novo nome da skill', skill.name)
                        if (newName === null) return
                        const newImage = prompt('Nova imagem URL (deixe em branco para manter)', skill.image || '')
                        try {
                          const res = await fetch(`${API_URL}/api/skills`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                            body: JSON.stringify({ category: 'aiStack', name: skill.name, skill: { name: newName, image: newImage } })
                          })
                          if (!res.ok) throw new Error('Failed to edit skill')
                          const data = await (await fetch(`${API_URL}/api/skills`)).json()
                          setSkills((data && data.stack) || [])
                          setDbStack((data && data.dbStack) || [])
                          setTools((data && data.tools) || [])
                          setAiStack((data && data.aiStack) || [])
                        } catch (err) { alert('Error: ' + err.message) }
                      }} title="Edit skill">✎</button>
                    </>
                  )}
                  <div className="skill-icon">
                    <img src={skill.image} alt={skill.name} />
                  </div>

                  <div className="skill-info">
                    <h3 className="skill-name">{skill.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Skills
