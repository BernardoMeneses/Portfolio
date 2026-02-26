import React from 'react'
import { Link } from 'react-router-dom'
import './Styles/Hero.scss'
import profileImage from '../assets/eu.jpg'

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span>👋 Hello, devs!!</span>
            </div>
            
            <h1 className="hero-title">
              Bernardo Meneses
            </h1>
            
            <p className="hero-subtitle">
              Full Stack Developer
            </p>
            
            <p className="hero-description">
              Passionate about creating engaging and user-friendly web applications.
            </p>
            
            <div className="hero-buttons">
              <Link to="/portfolio" className="btn-primary">
                View Projects
              </Link>
              <Link to="/contact" className="btn-outline">
                Let's Talk
              </Link>
            </div>
            
            <div className="hero-socials">
              <a href="https://github.com/BernardoMeneses" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/bernardojvmeneses/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="avatar-container">
              <div className="avatar">
                <div className="avatar-inner">
                  <img 
                    src={profileImage} 
                    alt="Bernardo Meneses"
                    className="profile-image"
                  />
                </div>
              </div>
              <div className="floating-elements">
                <div className="element element-1">⚛️</div>
                <div className="element element-2">🎮</div>
                <div className="element element-3">💻</div>
                <div className="element element-4">🚀</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
