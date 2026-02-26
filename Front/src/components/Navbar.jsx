import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Styles/Navbar.scss'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
