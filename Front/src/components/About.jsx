import React from 'react'
import { useI18n } from '../context/Preferences'
import './Styles/About.scss'

const About = () => {
  const { t } = useI18n()

  return (
    <section id="about" className="about section">
      <div className="container">
        <h2 className="section-title">{t('about.title')}</h2>

        <div className="about-content">
          <div className="about-text">
            {t('about.paragraphs').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="about-stats">
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">{t('about.stats.years')}</span>
            </div>

            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">{t('about.stats.projects')}</span>
            </div>

            <div className="stat-item">
              <span className="stat-number">5+</span>
              <span className="stat-label">{t('about.stats.tech')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
