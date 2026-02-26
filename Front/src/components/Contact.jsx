import React, { useState } from 'react'
import './Styles/Contact.scss'
import { API_URL } from '../config/api'

const Contact = () => {
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
        const result = await response.json()
        setSubmitStatus({ type: 'success', message: 'Mensagem enviada com sucesso! Obrigado pelo contato.' })
        setFormData({ name: '', email: '', message: '' })
      } else {
        const error = await response.json()
        setSubmitStatus({ type: 'error', message: error.detail || 'Erro ao enviar mensagem. Tente novamente.' })
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setSubmitStatus({ type: 'error', message: 'Erro ao enviar mensagem. Verifique sua conexão e tente novamente.' })
    }
    
    setIsSubmitting(false)
  }

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <h2 className="section-title">Let's Talk!</h2>
        
        <div className="contact-content">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <p>
              I'm always open to new opportunities and interesting projects.
              If you have an amazing idea or want to discuss a collaboration,
              don't hesitate to contact me!
            </p>
            
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
              
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
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
                placeholder="Seu nome"
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
                placeholder="Seu e-mail"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <textarea
                name="message"
                placeholder="Sua mensagem"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
              <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact
