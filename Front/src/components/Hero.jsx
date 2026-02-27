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
  const [heroSrc, setHeroSrc] = useState(profileImage)

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

  const checkBackendHero = async () => {
    try {
      const backendFallback = 'https://portfolio-backend-shy-butterfly-71.fly.dev'
      const base = (API_URL && API_URL.startsWith('http')) ? API_URL.replace(/\/$/, '') : backendFallback
      const exts = ['.jpg', '.jpeg', '.png', '.webp']
      for (const ext of exts) {
        try {
          const res = await fetch(`${base}/hero/hero${ext}`, { method: 'HEAD' })
          if (res.ok) {
            setHeroSrc(`${base}/hero/hero${ext}`)
            return
          }
        } catch (e) {
          // ignore and try next
        }
      }
      // fallback: keep local imported image
      setHeroSrc(profileImage)
    } catch (e) { setHeroSrc(profileImage) }
  }

  useEffect(()=>{ checkBackendHero() }, [])

  const handleUploadHero = async (file) => {
    if (!file) return
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file.name)) { showToast('Please select an image (jpg/png/webp)', { type: 'error' }); return }
    try {
      setUploading(true)
      const form = new FormData()
      form.append('file', file)
      const backendFallback = 'https://portfolio-backend-shy-butterfly-71.fly.dev'
      const base = (API_URL && API_URL.startsWith('http')) ? API_URL.replace(/\/$/, '') : backendFallback
      const res = await fetch(`${base}/api/admin/upload-hero`, {
        method: 'POST',
        headers: { 'X-ADMIN-TOKEN': adminToken || '' },
        body: form
      })
      if (!res.ok) {
        let msg = 'Upload failed'
        try { const j = await res.json(); msg = j.detail || j.message || JSON.stringify(j) } catch(e){ msg = await res.text().catch(()=> 'Upload failed') }
        showToast('Hero upload failed: ' + msg, { type: 'error' })
        return
      }
      const j = await res.json()
      // try to update displayed hero (append timestamp to bypass cache)
      const path = j.path || '/hero/hero.jpg'
      const url = (path.startsWith('http') ? path : `${base}${path}`) + '?t=' + Date.now()
      setHeroSrc(url)
      showToast('Hero image uploaded successfully', { type: 'success' })
    } catch (err) {
      console.error('Hero upload error', err)
      showToast('Hero upload failed: ' + (err.message || ''), { type: 'error' })
    } finally { setUploading(false) }
  }

  const downloadCV = async () => {
    try {
      const backendFallback = 'https://portfolio-backend-shy-butterfly-71.fly.dev'
      const base = (API_URL && API_URL.startsWith('http')) ? API_URL.replace(/\/$/, '') : backendFallback
      const res = await fetch(`${base}/cv/Bernardo_Meneses.pdf`)
      if (!res.ok) {
        let msg = 'Download failed'
        try { const j = await res.json(); msg = j.detail || j.message || JSON.stringify(j) } catch (e) { msg = await res.text().catch(()=> 'Download failed') }
        showToast('CV download failed: ' + msg, { type: 'error' })
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Bernardo_Meneses.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error', err)
      showToast('CV download failed: ' + (err.message || ''), { type: 'error' })
    }
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
                    src={heroSrc} 
                    alt="Bernardo Meneses"
                    className="profile-image"
                  />
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn-outline download-cv" onClick={downloadCV}>Download CV</button>
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
                      <label className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {uploading ? 'Uploading...' : 'Upload Hero'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleUploadHero(e.target.files && e.target.files[0])}
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
