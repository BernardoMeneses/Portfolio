import React, { useEffect, useState } from 'react'
import './Styles/Skills.scss'
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

const SkillGrid = ({ title, items, modifier = '' }) => {
  if (!items || items.length === 0) return null

  return (
    <>
      <h2 className={`section-title${modifier ? ` ${modifier}` : ''}`}>{title}</h2>
      <div className="skills-grid">
        {items.map((skill, index) => (
          <div key={`${title}-${skill.name || index}`} className="skill-card">
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
  )
}

const Skills = () => {
  const [skills, setSkills] = useState([])
  const [dbStack, setDbStack] = useState([])
  const [tools, setTools] = useState([])
  const [aiStack, setAiStack] = useState([])
  const { showToast } = useToast()

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(`${API_URL}/api/skills`)

        if (!res.ok) {
          throw new Error(await getApiErrorMessage(res, 'Failed to fetch skills'))
        }

        const data = await res.json()
        setSkills((data && data.stack) || [])
        setDbStack((data && data.dbStack) || [])
        setTools((data && data.tools) || [])
        setAiStack((data && data.aiStack) || [])
      } catch (err) {
        console.error('Error fetching skills from backend:', err)
        showToast('Error fetching skills: ' + (err.message || ''), { type: 'error' })
      }
    }

    fetchSkills()
  }, [showToast])

  return (
    <section id="skills" className="skills section">
      <div className="container">
        <SkillGrid title="Tech Stack" items={skills} />
        <SkillGrid title="Databases" items={dbStack} modifier="section-title--center" />
        <SkillGrid title="Tools" items={tools} modifier="section-title--center" />
        <SkillGrid title="AI Stack" items={aiStack} modifier="section-title--ai" />
      </div>
    </section>
  )
}

export default Skills
