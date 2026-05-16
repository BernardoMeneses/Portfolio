import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Styles/Navbar.scss'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => location.pathname === path

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
            <li>
              <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>
                Contact
              </Link>
            </li>
          </ul>

          <button
            className={`navbar-toggle ${mobileOpen ? 'open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span />
            <span />
            <span />
          </button>

          {mobileOpen && (
            <div className="navbar-mobile">
              <ul>
                <li><Link to="/" onClick={() => setMobileOpen(false)}>Home</Link></li>
                <li><Link to="/about" onClick={() => setMobileOpen(false)}>About</Link></li>
                <li><Link to="/skills" onClick={() => setMobileOpen(false)}>Skills</Link></li>
                <li><Link to="/portfolio" onClick={() => setMobileOpen(false)}>Portfolio</Link></li>
                <li><Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
