import React, { useState } from 'react'
import './Styles/Contact.scss'
import { API_URL } from '../config/api'
import { useI18n } from '../context/Preferences'

const Contact = () => {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSubmitStatus({ type: 'success', message: t('contact.success') })
        setFormData({ name: '', email: '', message: '' })
      } else {
        const error = await response.json()
        setSubmitStatus({ type: 'error', message: error.detail || error.error || t('contact.error') })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setSubmitStatus({ type: 'error', message: t('contact.network') })
    }
    
    setIsSubmitting(false)
  }

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <h2 className="section-title">{t('contact.title')}</h2>
        
        <div className="contact-content">
          <div className="contact-info">
            <h3>{t('contact.heading')}</h3>
            <p>{t('contact.text')}</p>
            
            <div className="contact-methods">
              <div className="contact-method">
                <i className="fas fa-envelope"></i>
                <span>bernardojvmeneses@email.com</span>
              </div>
              
              <div className="contact-method">
                <i className="fas fa-phone"></i>
                <span>+351 910357609</span>
              </div>
              
              <div className="contact-method">
                <i className="fas fa-map-marker-alt"></i>
                <span>Penafiel, Porto</span>
              </div>
            </div>
            
            <div className="social-links">
              <a href="https://github.com/BernardoMeneses" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/bernardojvmeneses/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          
          <form className="contact-form" onSubmit={handleSubmit}>
            {submitStatus && (
              <div className={`submit-status ${submitStatus.type}`}>
                {submitStatus.message}
              </div>
            )}
            
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder={t('contact.name')}
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder={t('contact.email')}
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <textarea
                name="message"
                placeholder={t('contact.message')}
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? t('contact.sending') : t('contact.send')}
              <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact
