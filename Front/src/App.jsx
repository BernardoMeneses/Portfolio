import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import AnimatedBackground from './components/AnimatedBackground'
import ToastProvider from './components/ToastProvider'
import IntroCover from './components/IntroCover'
import BinderTabs from './components/BinderTabs'
import Footer from './components/Footer'
import KonamiCode from './components/KonamiCode'
import { PreferencesProvider } from './context/Preferences'
import { AchievementsProvider } from './context/Achievements'
import Home from './pages/Home'
import AboutPage from './pages/AboutPage'
import SkillsPage from './pages/SkillsPage'
import PortfolioPage from './pages/PortfolioPage'
// Recommendations page removed
import ContactPage from './pages/ContactPage'

function App() {
  return (
    <Router>
      <PreferencesProvider>
      <ToastProvider>
      <AchievementsProvider>
        <IntroCover />
        <KonamiCode />
        <div className="App">
          <AnimatedBackground />
          <Navbar />
          <BinderTabs />
          <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AchievementsProvider>
      </ToastProvider>
      </PreferencesProvider>
    </Router>
  )
}

export default App
