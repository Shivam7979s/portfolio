// src/components/layouts/Navbar.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Volume2, VolumeX } from 'lucide-react';
import { useScrollY } from '../../hooks/useScrollY'
import { resumeService } from '../../services/resume.service'
import { soundService } from '../../services/sound.service'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [resumeUrl, setResumeUrl] = useState<string>('/resume.pdf')
  const [isMuted, setIsMuted] = useState(soundService.isMuted())
  const scrollY = useScrollY()

  const isScrolled = scrollY > 50

  const toggleMute = () => {
    const nextVal = !isMuted
    soundService.setMuted(nextVal)
    setIsMuted(nextVal)
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.href.substring(1))
      let current = 'home'
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = section
            break
          }
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    resumeService.getActive()
      .then(res => {
        if (res.data.success && res.data.data) {
          const fileUrl = res.data.data.fileUrl
          if (fileUrl.startsWith('/uploads/')) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
            const baseUrl = apiUrl.replace('/api', '')
            setResumeUrl(`${baseUrl}${fileUrl}`)
          } else {
            setResumeUrl(fileUrl)
          }
        }
      })
      .catch(() => { /* keep default */ })
  }, [])

  const handleNavClick = (href: string) => {
    soundService.playClick()
    setIsOpen(false)
    // slight delay so overlay closes first
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4 sm:pt-6 pointer-events-none"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.nav
          className="pointer-events-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full mx-auto"
          initial={{ maxWidth: '80rem', borderRadius: '1rem' }}
          animate={{
            maxWidth: isScrolled ? '60rem' : '80rem',
            borderRadius: isScrolled ? '2rem' : '1rem',
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
            backdropFilter: isScrolled ? 'blur(32px)' : 'blur(0px)',
            border: isScrolled ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
            boxShadow: isScrolled ? '0 10px 40px -10px rgba(0,0,0,0.5)' : 'none',
            paddingTop: isScrolled ? '0.6rem' : '0.75rem',
            paddingBottom: isScrolled ? '0.6rem' : '0.75rem',
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Logo */}
          <a
            href="#home"
            onMouseEnter={() => soundService.playHover()}
            onClick={() => handleNavClick('#home')}
            className="text-lg sm:text-xl font-black font-grotesk tracking-tight group flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all">
              <span className="text-white text-xs">S</span>
            </div>
            <span className="text-white group-hover:text-cyan-400 transition-colors">Shivam</span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 relative">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1)
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onMouseEnter={() => soundService.playHover()}
                  onClick={() => handleNavClick(link.href)}
                  className={`relative px-3 lg:px-4 py-2 text-sm font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-white/10 rounded-full"
                      style={{ boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </a>
              )
            })}
          </div>

          {/* Desktop Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleMute}
              onMouseEnter={() => soundService.playHover()}
              className="p-2.5 rounded-full border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-white/50 hover:text-white transition-all cursor-none min-w-[40px] min-h-[40px] flex items-center justify-center"
              title={isMuted ? "Unmute UI Sounds" : "Mute UI Sounds"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => soundService.playHover()}
              onClick={() => soundService.playClick()}
              className="text-sm font-semibold px-4 lg:px-5 py-2 lg:py-2.5 rounded-full border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0)] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] whitespace-nowrap"
            >
              Resume
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 z-50 relative text-white/80 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/5"
            onClick={() => {
              soundService.playClick()
              setIsOpen(!isOpen)
            }}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.nav>
      </motion.header>

      {/* ── Mobile Full-Screen Overlay Menu ─────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(32px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 md:hidden flex flex-col"
            style={{ background: 'rgba(2, 2, 8, 0.92)' }}
          >
            {/* Ambient glows inside menu */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600 opacity-5 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-cyan-500 opacity-5 blur-[80px] pointer-events-none" />

            {/* Nav Links */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-20">
              {navLinks.map((link, i) => {
                const isActive = activeSection === link.href.substring(1)
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.4, ease: 'easeOut' }}
                    onClick={() => handleNavClick(link.href)}
                    className={`w-full max-w-xs text-center py-4 px-6 rounded-2xl text-2xl font-bold font-grotesk tracking-tight transition-all duration-300 ${
                      isActive
                        ? 'text-white bg-white/8 border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.15)]'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                    style={isActive ? { textShadow: '0 0 20px rgba(139,92,246,0.5)' } : {}}
                  >
                    {isActive && (
                      <span className="text-xs font-mono text-purple-400 tracking-widest block mb-1 uppercase">
                        &gt; {link.label}
                      </span>
                    )}
                    {link.label}
                  </motion.a>
                )
              })}
            </div>

            {/* Bottom Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex flex-col gap-3 px-6 pb-10 w-full max-w-xs mx-auto"
            >
              <button
                onClick={() => { toggleMute(); soundService.playClick() }}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-sm"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                {isMuted ? 'Unmute Sounds' : 'Mute Sounds'}
              </button>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { soundService.playClick(); setIsOpen(false) }}
                className="w-full text-center py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
              >
                View Resume ↗
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
