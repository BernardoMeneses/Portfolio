import React, { useState, useEffect } from 'react'
import './Styles/Skills.scss'
import { API_URL } from '../config/api'
import { useToast } from './ToastProvider'

const Skills = () => {
  const [skills, setSkills] = useState([])
  const [dbStack, setDbStack] = useState([])
  const [tools, setTools] = useState([])
  const [aiStack, setAiStack] = useState([])

  const { showToast, showConfirm } = useToast()

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
        showToast('Error fetching skills: ' + (err.message || ''), { type: 'error' })
      })
  }, [])

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({ category: 'stack', name: '', image: '' })
  const [editing, setEditing] = useState({ open: false, category: '', originalName: '', skill: { name: '', image: '' } })

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
      .catch(err => showToast('Error: ' + (err.message || ''), { type: 'error' }))
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
                              const ok = await showConfirm(`Remove skill ${skill.name} from dbStack?`, 'Remove skill')
                              if (!ok) return
                              try {
                                const res = await fetch(`${API_URL}/api/skills`, {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                                  body: JSON.stringify({ category: 'dbStack', name: skill.name })
                                })
                                if (!res.ok) {
                                  let msg = 'Failed to remove skill'
                                  try { const j = await res.json(); msg = j.detail || j.message || JSON.stringify(j) } catch(e){ msg = await res.text().catch(()=>msg) }
                                  throw new Error(msg)
                                }
                                // reload skills
                                const data = await (await fetch(`${API_URL}/api/skills`)).json()
                                setSkills((data && data.stack) || [])
                                setDbStack((data && data.dbStack) || [])
                                setTools((data && data.tools) || [])
                                setAiStack((data && data.aiStack) || [])
                                showToast('Skill removed', { type: 'success' })
                              } catch (err) { showToast('Error: ' + (err.message || ''), { type: 'error' }) }
                            }} title="Remove skill">✖</button>
                            <button className="skill-edit" onClick={() => {
                              // open inline edit form for this skill
                              setEditing({ open: true, category: 'dbStack', originalName: skill.name, skill: { name: skill.name, image: skill.image || '' } })
                            }} title="Edit skill">✎</button>
                          </>
                        )}
                  {editing.open && editing.category === 'dbStack' && editing.originalName === skill.name ? (
                    <div style={{ width: '100%' }}>
                      <form onSubmit={async (e) => {
                        e.preventDefault()
                        try {
                          const res = await fetch(`${API_URL}/api/skills`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                            body: JSON.stringify({ category: editing.category, name: editing.originalName, skill: editing.skill })
                          })
                          if (!res.ok) throw new Error('Failed to edit skill')
                          const data = await (await fetch(`${API_URL}/api/skills`)).json()
                          setSkills((data && data.stack) || [])
                          setDbStack((data && data.dbStack) || [])
                          setTools((data && data.tools) || [])
                          setAiStack((data && data.aiStack) || [])
                          setEditing({ open: false, category: '', originalName: '', skill: { name: '', image: '' } })
                        } catch (err) { showToast('Error: ' + (err.message || ''), { type: 'error' }) }
                      }} className="admin-form">
                        <input className="input-field" value={editing.skill.name} onChange={e => setEditing({ ...editing, skill: { ...editing.skill, name: e.target.value } })} required />
                        <input className="input-field" value={editing.skill.image} onChange={e => setEditing({ ...editing, skill: { ...editing.skill, image: e.target.value } })} placeholder="Image URL" />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-primary" type="submit">Save</button>
                          <button type="button" className="btn-outline" onClick={() => setEditing({ open: false, category: '', originalName: '', skill: { name: '', image: '' } })}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <div className="skill-icon">
                        <img src={skill.image} alt={skill.name} />
                      </div>

                      <div className="skill-info">
                        <h3 className="skill-name">{skill.name}</h3>
                      </div>
                    </>
                  )}
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
                            const ok = await showConfirm(`Remove skill ${skill.name} from tools?`, 'Remove skill')
                            if (!ok) return
                            try {
                              const res = await fetch(`${API_URL}/api/skills`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                                body: JSON.stringify({ category: 'tools', name: skill.name })
                              })
                              if (!res.ok) {
                                let msg = 'Failed to remove skill'
                                try { const j = await res.json(); msg = j.detail || j.message || JSON.stringify(j) } catch(e){ msg = await res.text().catch(()=>msg) }
                                throw new Error(msg)
                              }
                              const data = await (await fetch(`${API_URL}/api/skills`)).json()
                              setSkills((data && data.stack) || [])
                              setDbStack((data && data.dbStack) || [])
                              setTools((data && data.tools) || [])
                              setAiStack((data && data.aiStack) || [])
                              showToast('Skill removed', { type: 'success' })
                            } catch (err) { showToast('Error: ' + (err.message || ''), { type: 'error' }) }
                          }} title="Remove skill">✖</button>
                          <button className="skill-edit" onClick={() => setEditing({ open: true, category: 'tools', originalName: skill.name, skill: { name: skill.name, image: skill.image || '' } })} title="Edit skill">✎</button>
                        </>
                      )}
                  {editing.open && editing.category === 'tools' && editing.originalName === skill.name ? (
                    <div style={{ width: '100%' }}>
                      <form onSubmit={async (e) => {
                        e.preventDefault()
                        try {
                          const res = await fetch(`${API_URL}/api/skills`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                            body: JSON.stringify({ category: editing.category, name: editing.originalName, skill: editing.skill })
                          })
                          if (!res.ok) throw new Error('Failed to edit skill')
                          const data = await (await fetch(`${API_URL}/api/skills`)).json()
                          setSkills((data && data.stack) || [])
                          setDbStack((data && data.dbStack) || [])
                          setTools((data && data.tools) || [])
                          setAiStack((data && data.aiStack) || [])
                          setEditing({ open: false, category: '', originalName: '', skill: { name: '', image: '' } })
                        } catch (err) { showToast('Error: ' + (err.message || ''), { type: 'error' }) }
                      }} className="admin-form">
                        <input className="input-field" value={editing.skill.name} onChange={e => setEditing({ ...editing, skill: { ...editing.skill, name: e.target.value } })} required />
                        <input className="input-field" value={editing.skill.image} onChange={e => setEditing({ ...editing, skill: { ...editing.skill, image: e.target.value } })} placeholder="Image URL" />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-primary" type="submit">Save</button>
                          <button type="button" className="btn-outline" onClick={() => setEditing({ open: false, category: '', originalName: '', skill: { name: '', image: '' } })}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <div className="skill-icon">
                        <img src={skill.image} alt={skill.name} />
                      </div>

                      <div className="skill-info">
                        <h3 className="skill-name">{skill.name}</h3>
                      </div>
                    </>
                  )}
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
                        const ok = await showConfirm(`Remove skill ${skill.name} from aiStack?`, 'Remove skill')
                        if (!ok) return
                        try {
                          const res = await fetch(`${API_URL}/api/skills`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                            body: JSON.stringify({ category: 'aiStack', name: skill.name })
                          })
                          if (!res.ok) {
                            let msg = 'Failed to remove skill'
                            try { const j = await res.json(); msg = j.detail || j.message || JSON.stringify(j) } catch(e){ msg = await res.text().catch(()=>msg) }
                            throw new Error(msg)
                          }
                          const data = await (await fetch(`${API_URL}/api/skills`)).json()
                          setSkills((data && data.stack) || [])
                          setDbStack((data && data.dbStack) || [])
                          setTools((data && data.tools) || [])
                          setAiStack((data && data.aiStack) || [])
                          showToast('Skill removed', { type: 'success' })
                        } catch (err) { showToast('Error: ' + (err.message || ''), { type: 'error' }) }
                      }} title="Remove skill">✖</button>
                      <button className="skill-edit" onClick={() => setEditing({ open: true, category: 'aiStack', originalName: skill.name, skill: { name: skill.name, image: skill.image || '' } })} title="Edit skill">✎</button>
                    </>
                  )}
                  {editing.open && editing.category === 'aiStack' && editing.originalName === skill.name ? (
                    <div style={{ width: '100%' }}>
                      <form onSubmit={async (e) => {
                        e.preventDefault()
                        try {
                          const res = await fetch(`${API_URL}/api/skills`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': adminToken || '' },
                            body: JSON.stringify({ category: editing.category, name: editing.originalName, skill: editing.skill })
                          })
                          if (!res.ok) throw new Error('Failed to edit skill')
                          const data = await (await fetch(`${API_URL}/api/skills`)).json()
                          setSkills((data && data.stack) || [])
                          setDbStack((data && data.dbStack) || [])
                          setTools((data && data.tools) || [])
                          setAiStack((data && data.aiStack) || [])
                          setEditing({ open: false, category: '', originalName: '', skill: { name: '', image: '' } })
                        } catch (err) { showToast('Error: ' + (err.message || ''), { type: 'error' }) }
                      }} className="admin-form">
                        <input className="input-field" value={editing.skill.name} onChange={e => setEditing({ ...editing, skill: { ...editing.skill, name: e.target.value } })} required />
                        <input className="input-field" value={editing.skill.image} onChange={e => setEditing({ ...editing, skill: { ...editing.skill, image: e.target.value } })} placeholder="Image URL" />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-primary" type="submit">Save</button>
                          <button type="button" className="btn-outline" onClick={() => setEditing({ open: false, category: '', originalName: '', skill: { name: '', image: '' } })}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <div className="skill-icon">
                        <img src={skill.image} alt={skill.name} />
                      </div>

                      <div className="skill-info">
                        <h3 className="skill-name">{skill.name}</h3>
                      </div>
                    </>
                  )}
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
