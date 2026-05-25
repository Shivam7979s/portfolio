import { useEffect, useState, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'
import { heroService, type HeroData } from '../services/hero.service'
import { soundService } from '../services/sound.service'

const ThreeScene = lazy(() => import('../components/ThreeScene'))

interface ParsedButton {
  label: string
  action: 'scroll' | 'link'
  target: string
  primary: boolean
}

interface ParsedSocial {
  platform: string
  url: string
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [hero, setHero] = useState<HeroData>({
    id: 1,
    name: 'Shivam',
    title: 'Engineering Intelligent Experiences.',
    subtitle: 'Available for Opportunities',
    description: "I'm Shivam, a full-stack architect specializing in AI integrations, high-performance computing, and cinematic web interfaces. Building the future, pixel by pixel.",
    buttons: JSON.stringify([
      { label: 'Explore My Work', action: 'scroll', target: '#projects', primary: true },
      { label: 'Initialize Contact', action: 'scroll', target: '#contact', primary: false },
    ]),
    socialLinks: JSON.stringify([
      { platform: 'github', url: 'https://github.com/ShivamSingh' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
    ])
  })

  useEffect(() => {
    setMounted(true)
    heroService.get()
      .then(res => {
        if (res.data.success && res.data.data) {
          setHero(res.data.data)
        }
      })
      .catch(err => {
        console.warn('Hero section falling back to local defaults:', err.message)
      })
  }, [])

  let parsedButtons: ParsedButton[] = []
  try {
    parsedButtons = JSON.parse(hero.buttons)
  } catch {
    parsedButtons = [
      { label: 'Explore My Work', action: 'scroll', target: '#projects', primary: true },
      { label: 'Initialize Contact', action: 'scroll', target: '#contact', primary: false }
    ]
  }

  let parsedSocials: ParsedSocial[] = []
  try {
    parsedSocials = JSON.parse(hero.socialLinks)
  } catch {
    parsedSocials = [
      { platform: 'github', url: 'https://github.com/ShivamSingh' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'twitter', url: 'https://twitter.com' }
    ]
  }

  const getSocialIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'github': return <FaGithub size={20} />
      case 'linkedin': return <FaLinkedin size={20} />
      case 'twitter':
      case 'x': return <FaTwitter size={20} />
      case 'instagram': return <FaInstagram size={20} />
      case 'youtube': return <FaYoutube size={20} />
      default: return <Sparkles size={20} />
    }
  }

  const handleAction = (btn: ParsedButton) => {
    if (btn.action === 'scroll') {
      document.querySelector(btn.target)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.open(btn.target, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20 overflow-hidden bg-transparent"
    >
      {/* 3D Background Container — hidden on very small screens to save resources */}
      <div className="absolute inset-0 z-0 pointer-events-auto opacity-60">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020208]/40 via-transparent to-[#020208]" />
        {mounted && (
          <Suspense fallback={null}>
            <ThreeScene />
          </Suspense>
        )}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none grid-bg opacity-30 sm:opacity-40 mix-blend-screen" />

      {/* Cinematic glows — smaller on mobile */}
      <div className="absolute top-1/4 left-1/4 w-[80vw] sm:w-[60vw] h-[80vw] sm:h-[60vw] rounded-full opacity-8 sm:opacity-10 blur-[100px] sm:blur-[150px] mix-blend-screen bg-purple-600 pointer-events-none animate-pulse-slow will-change-transform" />
      <div className="absolute bottom-1/4 right-1/4 w-[70vw] sm:w-[50vw] h-[70vw] sm:h-[50vw] rounded-full opacity-8 sm:opacity-10 blur-[100px] sm:blur-[150px] mix-blend-screen bg-cyan-500 pointer-events-none animate-pulse-slow will-change-transform" style={{ animationDelay: '2s' }} />

      {/* Social Links sidebar — desktop only */}
      <motion.div
        className="hidden lg:flex fixed left-8 bottom-0 flex-col items-center gap-6 z-40 pointer-events-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{ delay: 1.5, duration: 4, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
      >
        <div className="flex flex-col gap-5">
          {parsedSocials.map((s, idx) => (
            <a
              key={idx}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => soundService.playHover()}
              onClick={() => soundService.playClick()}
              className="text-white/30 hover:text-white transition-colors hover:-translate-y-1 transform"
            >
              {getSocialIcon(s.platform)}
            </a>
          ))}
        </div>
        <div className="w-px h-24 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center pointer-events-none">

        {/* Left Text Column — full width on mobile, 7 cols on desktop */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left pt-6 sm:pt-10 lg:pt-0 pointer-events-auto">

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-strong mb-6 sm:mb-8 border border-purple-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
          >
            <Sparkles size={12} className="text-purple-400" />
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/80">{hero.subtitle}</span>
          </motion.div>

          {/* Hero Heading — fluid clamped size */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="font-black font-grotesk leading-[1.05] tracking-[-0.04em] text-white mb-4 sm:mb-6 w-full"
            style={{ fontSize: 'clamp(2.4rem, 8vw, 6.5rem)' }}
          >
            {hero.name === 'Shivam' ? (
              <>
                Engineering{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500" style={{ backgroundSize: '200% 200%' }}>
                  Intelligent
                </span>{' '}
                Experiences.
              </>
            ) : (
              hero.title
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-white/50 text-base sm:text-lg md:text-xl max-w-xl lg:max-w-2xl mx-auto lg:mx-0 leading-[1.8] mb-8 sm:mb-10 font-light"
          >
            {hero.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto"
          >
            {parsedButtons.map((btn, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  soundService.playClick()
                  handleAction(btn)
                }}
                onMouseEnter={() => soundService.playHover()}
                className={btn.primary
                  ? "group relative w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black rounded-full font-bold text-sm tracking-wide overflow-hidden flex items-center justify-center gap-2 min-h-[48px]"
                  : "w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold text-sm tracking-wide text-white border border-white/20 hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center gap-2 min-h-[48px]"
                }
              >
                {btn.primary && <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />}
                <span className="relative z-10">{btn.label}</span>
                {btn.primary && <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
              </motion.button>
            ))}
          </motion.div>

          {/* Social Links — mobile only, horizontal row below buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex lg:hidden items-center justify-center gap-5 mt-8 flex-wrap"
          >
            {parsedSocials.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors p-2"
              >
                {getSocialIcon(s.platform)}
              </a>
            ))}
          </motion.div>
        </div>

        {/* Right 3D Visual Column — empty space for canvas on desktop */}
        <div className="lg:col-span-5 h-[250px] sm:h-[350px] lg:h-[600px] pointer-events-none hidden sm:block lg:block" />
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 pointer-events-auto cursor-pointer group"
        onMouseEnter={() => soundService.playHover()}
        onClick={() => {
          soundService.playClick()
          document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        <span className="text-[10px] font-mono tracking-[0.3em] text-white/30 group-hover:text-white/70 transition-colors">SCROLL</span>
        <div className="w-px h-12 sm:h-16 bg-white/10 relative overflow-hidden">
          <motion.div
            className="w-full h-1/2 bg-gradient-to-b from-transparent via-cyan-400 to-purple-500"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
