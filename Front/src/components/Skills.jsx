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

  return (
    <section id="skills" className="skills section">
      <div className="container">
        <h2 className="section-title">Tech Stack</h2>

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
