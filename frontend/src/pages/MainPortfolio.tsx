import { useState, useEffect, Suspense, lazy, useRef } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import HeroSection from '../sections/HeroSection'
import { useLenis } from '../hooks/useLenis'
import { settingsService } from '../services/settings.service'
import { CyberpunkGrid, AuroraGradient, GlobalParticles } from '../components/CinematicBackground'
import { useCanvasInView } from '../hooks/usePerformanceTier'
import CursorSparkle from '../components/CursorSparkle'

// ── Lazy-load every below-fold section ────────────────────────────────────
// These are code-split into separate JS chunks. The browser only downloads
// and parses them when the user is about to scroll into view.
const AboutSection      = lazy(() => import('../sections/AboutSection'))
const SkillsSection     = lazy(() => import('../sections/SkillsSection'))
const ProjectsSection   = lazy(() => import('../sections/ProjectsSection'))
const ExperienceSection = lazy(() => import('../sections/ExperienceSection'))
const ContactSection    = lazy(() => import('../sections/ContactSection'))
const Footer            = lazy(() => import('../sections/Footer'))

// ── Thin section placeholder shown while chunk is loading ─────────────────
function SectionSkeleton({ height = 'min-h-[600px]' }: { height?: string }) {
  return (
    <div className={`${height} w-full flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-3 opacity-20">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">Loading</span>
      </div>
    </div>
  )
}

// ── Section wrapper: mounts children only once near viewport ──────────────
function LazySection({
  children,
  rootMargin = '300px',
  skeleton,
  id,
}: {
  children: React.ReactNode
  rootMargin?: string
  skeleton?: React.ReactNode
  id?: string
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isNear = useCanvasInView(sentinelRef as React.RefObject<Element>, rootMargin)

  // Force-mount when the section is targeted by a hash link or scroll-to
  const [forceMount, setForceMount] = useState(false)
  useEffect(() => {
    if (!id) return
    // Check initial hash
    if (window.location.hash === `#${id}`) {
      setForceMount(true)
    }
    // Listen for hash changes (when user clicks a nav link)
    const onHash = () => {
      if (window.location.hash === `#${id}`) {
        setForceMount(true)
        // After mounting, scroll to it
        requestAnimationFrame(() => {
          setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        })
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [id])

  const shouldMount = isNear || forceMount

  return (
    <div ref={sentinelRef}>
      {shouldMount ? (
        <Suspense fallback={skeleton ?? <SectionSkeleton />}>
          {children}
        </Suspense>
      ) : (
        skeleton ?? <SectionSkeleton />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
export default function MainPortfolio() {
  useLenis()

  useEffect(() => {
    settingsService.get()
      .then(res => {
        if (res.data.success && res.data.data) {
          const settings = res.data.data
          if (settings.seoTitle) document.title = settings.seoTitle

          let metaDesc = document.querySelector('meta[name="description"]')
          if (!metaDesc) {
            metaDesc = document.createElement('meta')
            metaDesc.setAttribute('name', 'description')
            document.head.appendChild(metaDesc)
          }
          if (settings.seoDescription) metaDesc.setAttribute('content', settings.seoDescription)

          let metaKeywords = document.querySelector('meta[name="keywords"]')
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta')
            metaKeywords.setAttribute('name', 'keywords')
            document.head.appendChild(metaKeywords)
          }
          if (settings.seoKeywords) metaKeywords.setAttribute('content', settings.seoKeywords)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative min-h-screen overflow-hidden"
        style={{ backgroundColor: '#020208' }}
      >
        <Navbar />

        {/* Global CSS backgrounds — always present, CSS-only, zero JS cost */}
        <CyberpunkGrid />
        <AuroraGradient />
        <GlobalParticles />

        <main className="relative z-10">
          {/* Hero is always eagerly loaded — it's the first thing visible */}
          <HeroSection />

          {/* All sections below are lazy: downloaded + mounted only near viewport */}
          <LazySection rootMargin="400px" id="about">
            <AboutSection />
          </LazySection>

          <LazySection rootMargin="300px" id="skills">
            <SkillsSection />
          </LazySection>

          <LazySection rootMargin="300px" id="projects">
            <ProjectsSection />
          </LazySection>

          <LazySection rootMargin="300px" id="experience">
            <ExperienceSection />
          </LazySection>

          <LazySection rootMargin="200px" id="contact">
            <ContactSection />
          </LazySection>
        </main>

        <LazySection rootMargin="100px" skeleton={<div className="h-40" />}>
          <Footer />
        </LazySection>

        {/* Global film grain overlay */}
        <div className="noise" />

        {/* Lightning cursor sparkle — always on top */}
        <CursorSparkle />
      </motion.div>
    </>
  )
}
