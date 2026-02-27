import React, { useState, useEffect } from 'react'
import { API_URL } from '../config/api'
import { Link, useLocation } from 'react-router-dom'
import './Styles/Navbar.scss'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const [adminToken, setAdminToken] = useState(null)
  const [uploading, setUploading] = useState(false)

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
                  <button className="btn-outline navbar-logout" onClick={() => { localStorage.removeItem('admin_token'); setAdminToken(null); }}>Logout</button>
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
                            e.target.value = ''
                            alert('Admin authenticated')
                          } catch (err) {
                            alert('Admin login failed')
                          }
                        }
                      }}
                    />
                  </form>
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
