import React from 'react'
import './Styles/About.scss'

const About = () => {
  return (
    <section id="about" className="about section">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        
        <div className="about-content">
          <div className="about-text">
            <p>
              Hello! I'm Bernardo Meneses, 23 years old, and I'm a full-stack developer
              passionate about creating unique digital experiences. I graduated in
              Computer Engineering from UTAD and have a strong influence from the
              gaming universe in my projects.
            </p>
            
            <p>
              I have experience in modern development and interface design, and I'm always looking for
              new technologies to enhance my skills. I believe that code should be not only functional,
              but also elegant and well-structured.
            </p>
            
            <p>
              When I'm not programming, you can find me playing games, exploring
              new frameworks, or contributing to open source projects. I'm
              always open to new challenges and collaborations!
            </p>
          </div>
          
          <div className="about-stats">
            <div className="stat-item">
              <span className="stat-number">1</span>
              <span className="stat-label">Years of Experience</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Completed Projects</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-number">5+</span>
              <span className="stat-label">Technologies</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
