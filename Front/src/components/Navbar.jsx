import React, { useState, useEffect } from 'react'
import { API_URL } from '../config/api'
import { Link, useLocation } from 'react-router-dom'
import './Styles/Navbar.scss'
import { useToast } from './ToastProvider'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const [adminToken, setAdminToken] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAdminToken(localStorage.getItem('admin_token'))
    }
  }, [])

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-logo">
            <Link to="/" className="logo-link">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">BM</span>
            </Link>
          </div>
          
          <ul className="navbar-links">
            <li>
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive('/about') ? 'active' : ''}>
                About
              </Link>
            </li>
            <li>
              <Link to="/skills" className={isActive('/skills') ? 'active' : ''}>
                Skills
              </Link>
            </li>
            <li>
              <Link to="/portfolio" className={isActive('/portfolio') ? 'active' : ''}>
                Portfolio
              </Link>
            </li>
            {/* Recommendations link removed */}
            <li>
              <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>
                Contact
              </Link>
            </li>
            <li className="navbar-admin">
              {adminToken ? (
                <div className="welcome">
                  <span className="crown-icon" role="img" aria-label="crown">👑</span>
                  <span className="welcome-text">Welcome, Bernardo</span>
                  <button className="btn-outline navbar-logout" onClick={() => { localStorage.removeItem('admin_token'); setAdminToken(null); try { window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: { token: null } })) } catch(e){} }}>Logout</button>
                </div>
              ) : (
                <>
                  <label className="admin-label">Admin:</label>
                  <form className="admin-form" onSubmit={(e)=>{e.preventDefault();}}>
                    <input
                      className="input-field admin-input"
                      type="password"
                      placeholder="Admin password"
                      aria-label="admin-password"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const value = e.target.value
                          try {
                            const res = await fetch(`${API_URL}/api/admin/login`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ password: value })
                            })
                            if (!res.ok) throw new Error('Login failed')
                            const data = await res.json()
                            localStorage.setItem('admin_token', data.token)
                            setAdminToken(data.token)
                            try { window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: { token: data.token } })) } catch(e){}
                            e.target.value = ''
                            showToast('Admin authenticated', { type: 'success' })
                          } catch (err) {
                            showToast('Admin login failed', { type: 'error' })
                          }
                        }
                      }}
                    />
                  </form>
                </>
              )}
            </li>
          </ul>
          <button className={`navbar-toggle ${mobileOpen ? 'open' : ''}`} aria-label="Toggle menu" onClick={() => setMobileOpen(!mobileOpen)}>
            <span />
            <span />
            <span />
          </button>
          {mobileOpen && (
            <div className="navbar-mobile">
              <ul>
                <li><Link to="/" onClick={()=>setMobileOpen(false)}>Home</Link></li>
                <li><Link to="/about" onClick={()=>setMobileOpen(false)}>About</Link></li>
                <li><Link to="/skills" onClick={()=>setMobileOpen(false)}>Skills</Link></li>
                <li><Link to="/portfolio" onClick={()=>setMobileOpen(false)}>Portfolio</Link></li>
                <li><Link to="/contact" onClick={()=>setMobileOpen(false)}>Contact</Link></li>
              </ul>
              <div className="navbar-mobile-admin">
                {adminToken ? (
                  <div className="welcome">
                    <span className="crown-icon" role="img" aria-label="crown">👑</span>
                    <span className="welcome-text">Welcome, Bernardo</span>
                    <button className="btn-outline navbar-logout" onClick={() => { localStorage.removeItem('admin_token'); setAdminToken(null); try { window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: { token: null } })) } catch(e){}; setMobileOpen(false) }}>Logout</button>
                  </div>
                ) : (
                  <div className="mobile-admin-form">
                    <label className="admin-label">Admin</label>
                    <input className="input-field admin-input" type="password" placeholder="Admin password" onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.target.value
                        try {
                          const res = await fetch(`${API_URL}/api/admin/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ password: value })
                          })
                          if (!res.ok) throw new Error('Login failed')
                          const data = await res.json()
                          localStorage.setItem('admin_token', data.token)
                          setAdminToken(data.token)
                          try { window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: { token: data.token } })) } catch(e){}
                          e.target.value = ''
                          showToast('Admin authenticated', { type: 'success' })
                          setMobileOpen(false)
                        } catch (err) {
                          showToast('Admin login failed', { type: 'error' })
                        }
                      }
                    }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
