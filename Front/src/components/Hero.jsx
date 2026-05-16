import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Styles/Hero.scss'
import profileImage from '../assets/eu.jpg'
import { API_URL } from '../config/api'
import { useToast } from './ToastProvider'

const Hero = () => {
  const { showToast } = useToast()
  const [heroSrc, setHeroSrc] = useState(profileImage)

  const getBackendBase = () => {
    const backendFallback = 'https://portfolio-backend-shy-butterfly-71.fly.dev'
    return (API_URL && API_URL.startsWith('http'))
      ? API_URL.replace(/\/$/, '')
      : backendFallback
  }

  const checkBackendHero = async () => {
    try {
      const base = getBackendBase()
      const exts = ['.jpg', '.jpeg', '.png', '.webp']

      for (const ext of exts) {
        try {
          const res = await fetch(`${base}/hero/hero${ext}`, { method: 'HEAD' })
          if (res.ok) {
            setHeroSrc(`${base}/hero/hero${ext}`)
            return
          }
        } catch (error) {
          // Try the next extension.
        }
      }

      setHeroSrc(profileImage)
    } catch (error) {
      setHeroSrc(profileImage)
    }
  }

  useEffect(() => {
    checkBackendHero()
  }, [])

  const downloadCV = async () => {
    try {
      const base = getBackendBase()
      const res = await fetch(`${base}/cv/Bernardo_Meneses.pdf`)

      if (!res.ok) {
        let msg = 'Download failed'
        try {
          const data = await res.json()
          msg = data.error || data.detail || data.message || JSON.stringify(data)
        } catch (error) {
          msg = await res.text().catch(() => 'Download failed')
        }

        showToast('CV download failed: ' + msg, { type: 'error' })
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'Bernardo_Meneses.pdf'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error', error)
      showToast('CV download failed: ' + (error.message || ''), { type: 'error' })
    }
  }

  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span>Hello, devs!!</span>
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
                Let&apos;s Talk
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
                    src={heroSrc}
                    alt="Bernardo Meneses"
                    className="profile-image"
                  />
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn-outline download-cv" onClick={downloadCV}>Download CV</button>
              </div>
              <div className="floating-elements">
                <div className="element element-1">AI</div>
                <div className="element element-2">UI</div>
                <div className="element element-3">WEB</div>
                <div className="element element-4">DEV</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
