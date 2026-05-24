import { useEffect, useState, useRef } from 'react'
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion'
import { experienceService, type Experience } from '../services/experience.service'
import { soundService } from '../services/sound.service'
import { Calendar, Briefcase, Zap } from 'lucide-react'
import { use3DTilt } from '../hooks/use3DTilt'

const DEFAULT_EXPERIENCES: Experience[] = [
  {
    id: 1,
    roleTitle: 'Open Source Architect',
    organization: 'Independent',
    duration: '2024 – Present',
    description: 'Deep-diving into AI/ML systems, building full-stack applications, and contributing to open-source Java DSA repositories. Developing premium futuristic web experiences with Three.js.',
    technologies: JSON.stringify(['Java', 'Python', 'React', 'Three.js']),
    order: 0
  },
  {
    id: 2,
    roleTitle: 'DSA & Systems Engineer',
    organization: 'Competitive Programming',
    duration: '2023 – 2024',
    description: 'Solved 300+ data structures and algorithms problems. Mastered arrays, linked lists, trees, graphs, dynamic programming and system design fundamentals for high-performance computing.',
    technologies: JSON.stringify(['Java', 'Algorithms', 'System Design', 'Spring Boot']),
    order: 1
  },
  {
    id: 3,
    roleTitle: 'Full-Stack Developer',
    organization: 'Self-Taught Projects',
    duration: '2022 – 2023',
    description: 'Built responsive web applications using React, Node.js, and MySQL. Learned modern UI/UX principles, RESTful API design, and database normalisation.',
    technologies: JSON.stringify(['React', 'Node.js', 'MySQL', 'CSS']),
    order: 2
  }
]

const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#10b981']

// Spark particles that shoot off the draw head
function SparkHead({ progress, lineHeight }: { progress: number; lineHeight: number }) {
  const y = progress * lineHeight
  const particles = Array.from({ length: 6 }, (_, i) => i)

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-30"
      style={{ top: `${y}px` }}
    >
      {/* Core glowing orb */}
      <div
        className="w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(circle, #ffffff, #06b6d4)',
          boxShadow: '0 0 6px 2px #06b6d4, 0 0 20px 6px rgba(6,182,212,0.5), 0 0 40px 12px rgba(139,92,246,0.3)',
        }}
      />
      {/* Radiating spark particles */}
      {particles.map(i => {
        const angle = (i / particles.length) * 360
        const dist = 8 + Math.sin(Date.now() / 300 + i) * 3
        return (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-70"
            style={{
              background: i % 2 === 0 ? '#8b5cf6' : '#06b6d4',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${dist}px)`,
              boxShadow: `0 0 4px ${i % 2 === 0 ? '#8b5cf6' : '#06b6d4'}`,
            }}
          />
        )
      })}
    </div>
  )
}

// Individual timeline node with activate animation
function TimelineNode({ color, isActive, index }: { color: string; isActive: boolean; index: number }) {
  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      {/* Outer ring pulse — only when active */}
      {isActive && (
        <>
          <div
            className="absolute w-8 h-8 rounded-full animate-ping opacity-40"
            style={{ backgroundColor: color }}
          />
          <div
            className="absolute w-12 h-12 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: color, animationDelay: '0.3s' }}
          />
        </>
      )}
      {/* Static ring */}
      <div
        className="absolute inset-0 rounded-full border-2 transition-all duration-700"
        style={{
          borderColor: isActive ? color : 'rgba(255,255,255,0.1)',
          boxShadow: isActive ? `0 0 20px ${color}60, 0 0 40px ${color}30` : 'none',
        }}
      />
      {/* Index number or icon */}
      <div
        className="relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold transition-all duration-700"
        style={{
          backgroundColor: isActive ? color : 'rgba(255,255,255,0.05)',
          color: isActive ? '#000' : 'rgba(255,255,255,0.3)',
          boxShadow: isActive ? `0 0 10px ${color}` : 'none',
        }}
      >
        {isActive ? <Zap size={8} /> : String(index + 1).padStart(2, '0')}
      </div>
    </div>
  )
}

interface ExperienceCardProps {
  exp: Experience
  i: number
  color: string
  isNodeActive: boolean
  techArr: string[]
}

function ExperienceCard({ exp, i, color, isNodeActive, techArr }: ExperienceCardProps) {
  const { ref: tiltRef } = use3DTilt({ maxRotation: 10, scale: 1.02 })

  return (
    <motion.div
      onMouseEnter={() => soundService.playHover()}
      animate={{ y: [0, -6, 0] }}
      transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 } }}
      className="cursor-none h-full"
    >
      <div
        ref={tiltRef}
        className="glass-premium rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden border border-white/5 h-full group"
        style={{
          boxShadow: isNodeActive
            ? `0 0 40px ${color}10, 0 20px 60px rgba(0,0,0,0.5)`
            : '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Dynamic Glare Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
          style={{
            background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Ambient hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
             style={{ background: `radial-gradient(circle at 30% 50%, ${color}, transparent 70%)` }} />

        {/* Active border glow */}
        <motion.div
          animate={isNodeActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${color}08, transparent 50%, ${color}04)`,
            border: `1px solid ${color}20`,
          }}
        />

        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-bl-[100px] opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at top right, ${color}, transparent)` }}
        />

        {/* Header row */}
        <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
          <span
            className="text-[10px] font-mono px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5"
            style={{ color, borderColor: `${color}40`, background: `${color}15` }}
          >
            <Calendar size={11} /> {exp.duration}
          </span>
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase flex items-center gap-1.5">
            <Briefcase size={11} /> {exp.organization}
          </span>

          {/* Live indicator */}
          {i === 0 && (
            <span className="ml-auto flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 px-2 py-1 rounded-md bg-emerald-400/10 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ACTIVE
            </span>
          )}
        </div>

        {/* Role Title */}
        <h3
          className="font-black text-2xl md:text-3xl font-grotesk text-white mb-4 relative z-10"
          style={{ textShadow: `0 0 40px ${color}30` }}
        >
          {exp.roleTitle}
        </h3>

        {/* Description */}
        <p className="text-white/55 text-sm leading-[1.9] mb-8 font-light relative z-10">
          {exp.description}
        </p>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-2 relative z-10">
          {techArr.map((tag, ti) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isNodeActive ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4 + ti * 0.06, duration: 0.4 }}
              className="text-[9px] font-mono px-3 py-1.5 rounded-md uppercase tracking-widest border transition-all duration-300"
              style={{
                backgroundColor: `${color}08`,
                borderColor: `${color}20`,
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {tag.trim()}
            </motion.span>
          ))}
        </div>

        {/* Bottom line accent */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isNodeActive ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 h-px origin-left"
          style={{
            background: `linear-gradient(90deg, ${color}, transparent)`,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
    </motion.div>
  )
}

export default function ExperienceSection() {
  const [experiences, setExperiences] = useState<Experience[]>(DEFAULT_EXPERIENCES)
  const [lineHeight, setLineHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const lineTrackRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const inView = useInView(containerRef, { once: false, margin: '-80px' })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 90%', 'end 40%']
  })

  // Smooth spring-physics version of scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.8,
  })

  // SVG stroke-dashoffset path length
  const pathLength = useTransform(smoothProgress, [0, 1], [0, 1])

  useEffect(() => {
    const updateHeight = () => {
      if (lineTrackRef.current) {
        setLineHeight(lineTrackRef.current.offsetHeight)
      }
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [experiences])

  useEffect(() => {
    experienceService.getAll()
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          setExperiences(res.data.data)
        }
      })
      .catch(err => {
        console.warn('Experience section falling back to local defaults:', err.message)
      })
  }, [])

  // Derived progress value for spark head position + node activation
  const [progressVal, setProgressVal] = useState(0)
  useEffect(() => {
    return smoothProgress.on('change', v => setProgressVal(v))
  }, [smoothProgress])

  const getNodeThreshold = (index: number) => index / experiences.length

  return (
    <section id="experience" className="relative py-32 px-6 overflow-hidden bg-transparent">
      {/* Ambient background blobs */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[140px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[120px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

      <div className="max-w-6xl mx-auto" ref={containerRef}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-28"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong mb-6 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <p className="font-mono text-blue-400 text-xs tracking-[0.2em] uppercase">04. Career Log</p>
          </div>
          <h2 className="text-5xl md:text-7xl font-black font-grotesk tracking-tight">
            The <span className="text-gradient">Evolution</span>
          </h2>
          <p className="text-white/30 text-sm font-mono mt-4 tracking-widest">
            SCROLL TO DRAW TIMELINE
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative" ref={lineTrackRef}>

          {/* ── SVG Glowing Line Draw ── */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] hidden md:block pointer-events-none">
            {/* Ghost track */}
            <div className="absolute inset-0 bg-white/5 rounded-full" />

            {/* Animated SVG line */}
            {lineHeight > 0 && (
              <svg
                ref={svgRef}
                className="absolute top-0 left-1/2 -translate-x-1/2"
                width="2"
                height={lineHeight}
                viewBox={`0 0 2 ${lineHeight}`}
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="40%" stopColor="#06b6d4" />
                    <stop offset="80%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                  <filter id="lineGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="lineGlowStrong">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Soft outer glow layer */}
                <motion.line
                  x1="1" y1="0" x2="1" y2={lineHeight}
                  stroke="url(#lineGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity={0.2}
                  filter="url(#lineGlowStrong)"
                  style={{ pathLength, scaleY: pathLength, transformOrigin: 'top' }}
                />

                {/* Main crisp line */}
                <motion.line
                  x1="1" y1="0" x2="1" y2={lineHeight}
                  stroke="url(#lineGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#lineGlow)"
                  style={{ pathLength, scaleY: pathLength, transformOrigin: 'top' }}
                />
              </svg>
            )}

            {/* Spark head — moving dot at draw tip */}
            {lineHeight > 0 && progressVal > 0.01 && progressVal < 0.99 && (
              <SparkHead progress={progressVal} lineHeight={lineHeight} />
            )}
          </div>

          {/* Mobile: simple glowing bar */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px md:hidden" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <motion.div
            className="absolute left-6 sm:left-8 top-0 w-px origin-top md:hidden"
            style={{
              scaleY: pathLength,
              background: 'linear-gradient(180deg, #8b5cf6, #06b6d4, #ec4899)',
              boxShadow: '0 0 10px rgba(6,182,212,0.8)',
            }}
          />

          {/* Experience Cards */}
          <div className="space-y-20">
            {experiences.map((exp, i) => {
              const isEven = i % 2 === 0
              const color = COLORS[i % COLORS.length]!
              const isNodeActive = progressVal >= getNodeThreshold(i)

              let techArr: string[] = []
              try {
                techArr = JSON.parse(exp.technologies)
              } catch {
                techArr = exp.technologies.split(',')
              }

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: isEven ? -60 : 60, y: 20 }}
                  animate={
                    progressVal >= getNodeThreshold(i)
                      ? { opacity: 1, x: 0, y: 0 }
                      : {}
                  }
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''} group`}
                >
                  {/* Central Animated Node */}
                  <div className="absolute left-6 sm:left-8 md:left-1/2 top-4 z-20 -translate-x-1/2 -translate-y-1/2">
                    <TimelineNode color={color} isActive={isNodeActive} index={i} />
                  </div>

                  {/* Connector line from node to card (desktop) */}
                  <div className="hidden md:block md:w-1/2 relative">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={isNodeActive ? { scaleX: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                      className={`absolute top-4 h-px origin-${isEven ? 'right' : 'left'}`}
                      style={{
                        width: '60%',
                        right: isEven ? 0 : 'auto',
                        left: isEven ? 'auto' : 0,
                        background: `linear-gradient(${isEven ? '270deg' : '90deg'}, transparent, ${color}80)`,
                        boxShadow: `0 0 6px ${color}`,
                      }}
                    />
                  </div>

                  {/* Experience Card */}
                  <div className={`w-full md:w-1/2 pl-16 sm:pl-20 md:pl-0 ${isEven ? 'md:pr-16' : 'md:pl-16'}`}>
                    <ExperienceCard
                      exp={exp}
                      i={i}
                      color={color}
                      isNodeActive={isNodeActive}
                      techArr={techArr}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Timeline end cap */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={progressVal > 0.9 ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="relative flex justify-center mt-16"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: '#10b981',
                background: '#020208',
                boxShadow: '0 0 30px rgba(16,185,129,0.5), 0 0 60px rgba(16,185,129,0.2)',
              }}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 translate-x-8 font-mono text-[9px] text-emerald-400/70 tracking-widest whitespace-nowrap">
              TIMELINE_COMPLETE ✓
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
