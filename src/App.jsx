import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Resume from './components/Resume.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import ThemeEngine from './components/ThemeEngine.jsx'
import ResumeEngine from './components/ResumeEngine.jsx'

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    try {
      const stored = window.localStorage.getItem('rp-theme')
      if (stored === 'light' || stored === 'dark') return stored
    } catch (e) {}
    return 'dark'
  })
  const [resumeOpen, setResumeOpen] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      window.localStorage.setItem('rp-theme', theme)
    } catch (e) {}
  }, [theme])

  useEffect(() => {
    document.body.style.overflow = resumeOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [resumeOpen])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  const openResume = () => setResumeOpen(true)
  const closeResume = () => setResumeOpen(false)

  return (
    <div className="min-h-screen selection:bg-mint-500/30 overflow-x-hidden">
      <Navbar theme={theme} toggleTheme={toggleTheme} onOpenResume={openResume} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Resume onOpen={openResume} />
        <Contact />
      </main>
      <Footer />
      <ThemeEngine theme={theme} />
      <ResumeEngine open={resumeOpen} onClose={closeResume} />
    </div>
  )
}
