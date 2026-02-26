import React from 'react'
import './Styles/Skills.scss'
import skillsData from '../data/skills.json'

const Skills = () => {
  const skills = (skillsData && skillsData.stack) || []
  const dbStack = (skillsData && skillsData.dbStack) || []
  const tools = (skillsData && skillsData.tools) || []
  const aiStack = (skillsData && skillsData.aiStack) || []

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
