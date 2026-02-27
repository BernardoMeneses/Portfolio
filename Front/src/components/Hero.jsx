import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Styles/Hero.scss'
import profileImage from '../assets/eu.jpg'
import { API_URL } from '../config/api'
import { useToast } from './ToastProvider'

const Hero = () => {
  const [adminToken, setAdminToken] = useState(null)
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined') setAdminToken(localStorage.getItem('admin_token'))

    const handler = (e) => {
      const t = e && e.detail && e.detail.token ? e.detail.token : null
      setAdminToken(t)
    }
    window.addEventListener('admin-auth-changed', handler)
    return () => window.removeEventListener('admin-auth-changed', handler)
  }, [])

  const handleUpload = async (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) { showToast('Please select a PDF file', { type: 'error' }); return }
    try {
      setUploading(true)
      const form = new FormData()
      form.append('file', file)
      // Ensure we call an absolute backend URL — fall back to the Fly backend when API_URL is not absolute
      const backendFallback = 'https://portfolio-backend-shy-butterfly-71.fly.dev'
      const base = (API_URL && API_URL.startsWith('http')) ? API_URL.replace(/\/$/, '') : backendFallback
      const res = await fetch(`${base}/api/admin/upload-cv`, {
        method: 'POST',
        headers: { 'X-ADMIN-TOKEN': adminToken || '' },
        body: form
      })
      if (!res.ok) {
        // Try to parse JSON detail
        let msg = 'Upload failed'
        try {
          const j = await res.json()
          msg = j.detail || j.message || JSON.stringify(j)
        } catch (e) {
          msg = await res.text().catch(()=> 'Upload failed')
        }
        showToast('CV upload failed: ' + msg, { type: 'error' })
        return
      }
      showToast('CV uploaded successfully', { type: 'success' })
    } catch (err) {
      console.error('Upload error', err)
      showToast('CV upload failed: ' + (err.message || ''), { type: 'error' })
    } finally { setUploading(false) }
  }
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
              <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <a className="btn-outline download-cv" href="/cv/Bernardo_Meneses.pdf" download>Download CV</a>
                {adminToken && (
                  <>
                    <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      {uploading ? 'Uploading...' : 'Upload CV'}
                      <input
                        type="file"
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => handleUpload(e.target.files && e.target.files[0])}
                      />
                    </label>
                  </>
                )}
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
