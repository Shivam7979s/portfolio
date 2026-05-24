import { useEffect, useState, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { Code2, Brain, Cpu, Zap, ArrowRight, Activity, Award } from 'lucide-react'
import { aboutService, type AboutData } from '../services/about.service'
import { soundService } from '../services/sound.service'
import { use3DTilt } from '../hooks/use3DTilt'

interface ParsedStat {
  label: string
  value: string
  icon: string
  color?: string
}

// ─── Elite Animated Counter ────────────────────────────────────────────────
function AnimatedCounter({
  targetValue,
  inView,
  color = '#8b5cf6',
}: {
  targetValue: string
  inView: boolean
  color?: string
}) {
  const [display, setDisplay] = useState('0')
  const [isComplete, setIsComplete] = useState(false)
  const [isScrambling, setIsScrambling] = useState(false)
  const hasRun = useRef(false)

  // Extract numeric part and suffix (e.g. "1200+" → 1200, "+")
  const numeric = parseInt(targetValue.replace(/[^\d]/g, ''), 10) || 0
  const suffix = targetValue.replace(/[\d]/g, '')

  useEffect(() => {
    if (!inView || hasRun.current || numeric === 0) return
    hasRun.current = true

    // Phase 1: scramble for 300ms
    setIsScrambling(true)
    let scrambleTimer: ReturnType<typeof setInterval>
    let scrambleCount = 0
    const maxScrambles = 8

    scrambleTimer = setInterval(() => {
      const rnd = Math.floor(Math.random() * numeric)
      setDisplay(rnd.toLocaleString())
      scrambleCount++
      if (scrambleCount >= maxScrambles) {
        clearInterval(scrambleTimer)
        setIsScrambling(false)

        // Phase 2: smooth eased count-up via framer-motion animate
        const controls = animate(0, numeric, {
          duration: 1.8,
          delay: 0,
          ease: [0.16, 1, 0.3, 1], // expo ease-out
          onUpdate(v) {
            setDisplay(Math.round(v).toLocaleString())
          },
          onComplete() {
            setDisplay(numeric.toLocaleString())
            setIsComplete(true)
            soundService.playHover()
          },
        })
        return () => controls.stop()
      }
    }, 60)

    return () => clearInterval(scrambleTimer)
  }, [inView, numeric])

  return (
    <span className="relative inline-block tabular-nums">
      {/* Main number */}
      <span
        className="transition-all duration-100"
        style={{
          color: isComplete ? '#fff' : isScrambling ? `${color}aa` : '#fff',
          textShadow: isComplete ? `0 0 30px ${color}, 0 0 60px ${color}60` : 'none',
          filter: isScrambling ? 'blur(0.5px)' : 'none',
        }}
      >
        {display}
      </span>

      {/* Suffix */}
      <span
        style={{
          color,
          textShadow: isComplete ? `0 0 20px ${color}` : 'none',
        }}
      >
        {suffix}
      </span>

      {/* Completion flash burst */}
      {isComplete && (
        <motion.span
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}40, transparent 70%)` }}
        />
      )}
    </span>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  stat,
  index,
  inView,
  iconEl,
}: {
  stat: ParsedStat
  index: number
  inView: boolean
  iconEl: React.ReactNode
}) {
  const color = stat.color || '#8b5cf6'
  const numeric = parseInt(stat.value.replace(/[^\d]/g, ''), 10) || 0
  const [isActive, setIsActive] = useState(false)
  
  // High-performance 3D tilt hook
  const { ref: tiltRef } = use3DTilt({ maxRotation: 15, scale: 1.05 })

  // Mark card as active once it enters view
  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setIsActive(true), index * 120)
      return () => clearTimeout(t)
    }
  }, [inView, index])

  // SVG ring params
  const RADIUS = 38
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: [0, -8, 0], scale: 1 } : {}}
      transition={{ 
        opacity: { duration: 0.7, delay: 0.3 + index * 0.12, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.7, delay: 0.3 + index * 0.12, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }
      }}
      className="cursor-none"
    >
      <div
        ref={tiltRef}
        className="glass-premium rounded-[2rem] p-8 relative overflow-hidden group flex flex-col justify-between min-h-[180px] h-full"
        style={{
          boxShadow: isActive
            ? `0 0 40px ${color}18, 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`
            : '0 20px 60px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={() => soundService.playHover()}
      >
        {/* Dynamic Glare Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
          style={{
            background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Background ambient glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none"
          style={{ background: `radial-gradient(circle at 30% 70%, ${color}, transparent 65%)` }}
        />

        {/* Top-right decorative arc */}
        <div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-xl pointer-events-none"
          style={{ backgroundColor: color }}
        />

        {/* Animated corner glow on active */}
        <motion.div
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, ${color}30, transparent 70%)`,
          }}
        />

        {/* Top row: icon + ring */}
        <div className="flex items-start justify-between relative z-10">
          {/* Icon badge */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]"
            style={{ background: `${color}18`, boxShadow: `0 0 0 1px ${color}25` }}
          >
            {iconEl}
          </div>

          {/* SVG Progress Ring */}
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg width="44" height="44" className="-rotate-90">
              {/* Track */}
              <circle
                cx="22" cy="22" r={RADIUS * 0.58}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="2"
              />
              {/* Animated fill */}
              <motion.circle
                cx="22" cy="22" r={RADIUS * 0.58}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE * 0.58}
                initial={{ strokeDashoffset: CIRCUMFERENCE * 0.58 }}
                animate={isActive
                  ? { strokeDashoffset: CIRCUMFERENCE * 0.58 * (1 - Math.min(numeric / 100, 1)) }
                  : {}
                }
                transition={{ duration: 1.8, delay: 0.4 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              />
            </svg>
            {/* Center dot */}
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
            />
          </div>
        </div>

        {/* Number + Label */}
        <div className="relative z-10 mt-4">
          <div className="text-4xl font-black font-grotesk text-white mb-1 transition-transform origin-left group-hover:scale-105 leading-none">
            <AnimatedCounter
              targetValue={stat.value}
              inView={inView}
              color={color}
              delay={index * 0.12}
            />
          </div>
          <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mt-2">
            {stat.label}
          </div>
        </div>

        {/* Bottom animated accent bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.6 + index * 0.12, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 h-px origin-left pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}00)`,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />

        {/* Left-edge colored accent stripe */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isActive ? { scaleY: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.12, ease: 'easeOut' }}
          className="absolute left-0 top-0 bottom-0 w-px origin-top pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${color}, ${color}00)`,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>
    </motion.div>
  )
}

// ─── Main Section ──────────────────────────────────────────────────────────
export default function AboutSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  
  // Custom high-performance 3D tilt hooks
  const highlightCardTilt = use3DTilt({ maxRotation: 8, scale: 1.02 })
  const bonusCardTilt = use3DTilt({ maxRotation: 15, scale: 1.05 })

  const [about, setAbout] = useState<AboutData>({
    id: 1,
    title: '02. Background',
    description: 'A passionate systems builder and computer engineering enthusiast who builds robust full-stack infrastructures.',
    statsCards: JSON.stringify([
      { label: 'Completed Projects', value: '15+', icon: 'Code2', color: '#8b5cf6' },
      { label: 'DSA Problems', value: '1200+', icon: 'Brain', color: '#06b6d4' },
      { label: 'Tech Commits', value: '300+', icon: 'Activity', color: '#ec4899' },
    ]),
    highlights: JSON.stringify([
      'Experienced in scalable Node.js/Java backends',
      'Deep expertise in relational databases and ORMs',
      'Creates beautiful frontends with Framer Motion and Three.js',
    ]),
    personalBio: 'I focus on developing optimized systems that provide beautiful UX. I believe in clean code, robust architecture, and dynamic automation.'
  })

  useEffect(() => {
    aboutService.get()
      .then(res => {
        if (res.data.success && res.data.data) {
          setAbout(res.data.data)
        }
      })
      .catch(err => {
        console.warn('About section falling back to local defaults:', err.message)
      })
  }, [])

  const getIconElement = (iconName: string, color?: string) => {
    switch (iconName.toLowerCase()) {
      case 'code2':
      case 'project': return <Code2 size={20} style={{ color }} />
      case 'brain':
      case 'dsa': return <Brain size={20} style={{ color }} />
      case 'activity':
      case 'commits': return <Activity size={20} style={{ color }} />
      case 'award': return <Award size={20} style={{ color }} />
      case 'cpu': return <Cpu size={20} style={{ color }} />
      default: return <Zap size={20} style={{ color }} />
    }
  }

  let parsedStats: ParsedStat[] = []
  try {
    parsedStats = JSON.parse(about.statsCards)
  } catch {
    parsedStats = [
      { label: 'Completed Projects', value: '15+', icon: 'Code2', color: '#8b5cf6' },
      { label: 'DSA Problems', value: '1200+', icon: 'Brain', color: '#06b6d4' },
      { label: 'Tech Commits', value: '300+', icon: 'Activity', color: '#ec4899' },
    ]
  }

  let parsedHighlights: string[] = []
  try {
    parsedHighlights = JSON.parse(about.highlights)
  } catch {
    parsedHighlights = [
      'Experienced in scalable Node.js/Java backends',
      'Deep expertise in relational databases and ORMs',
      'Creates beautiful frontends with Framer Motion and Three.js',
    ]
  }

  return (
    <section id="about" className="relative py-32 px-6 overflow-hidden bg-transparent">
      <div
        className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-5 blur-[150px] -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
      />

      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Text ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong mb-8 border border-white/5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <p className="font-mono text-cyan-400 text-xs tracking-[0.2em] uppercase">01. Initialization</p>
            </div>

            <h2 className="text-5xl md:text-6xl font-black font-grotesk tracking-tight mb-8">
              Decoding the <br /> <span className="text-gradient">Architect</span>
            </h2>

            <div className="space-y-6 text-lg text-white/50 leading-[1.8] font-light max-w-xl">
              <p>{about.description}</p>
              <p>{about.personalBio}</p>
            </div>

            <motion.button
              onClick={() => {
                soundService.playClick()
                document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
              }}
              onMouseEnter={() => soundService.playHover()}
              className="mt-10 flex items-center gap-3 text-white/80 hover:text-cyan-400 font-mono text-sm tracking-widest uppercase transition-colors group cursor-none"
              whileHover={{ x: 10 }}
            >
              View Full History <ArrowRight size={16} className="group-hover:text-cyan-400" />
            </motion.button>
          </motion.div>

          {/* ── Right: Stats Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 -m-8 border border-white/5 rounded-[3rem] opacity-30 hidden md:block" />

            {/* Full-width highlight card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="sm:col-span-2 cursor-none"
            >
              <div
                ref={highlightCardTilt.ref}
                className="glass-premium rounded-[2rem] p-8 relative overflow-hidden group h-full"
                onMouseEnter={() => soundService.playHover()}
              >
                {/* Dynamic Glare Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
                  style={{
                    background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.12) 0%, transparent 60%)',
                    mixBlendMode: 'overlay',
                  }}
                />
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Cpu size={24} />
                  </div>
                  <h3 className="text-2xl font-bold font-grotesk text-white">Full Stack Focus</h3>
                </div>
                <ul className="text-white/50 leading-relaxed text-sm space-y-2 list-disc list-inside relative z-10">
                  {parsedHighlights.map((hl, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                    >
                      {hl}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Animated Stat Cards */}
            {parsedStats.map((stat, i) => (
              <StatCard
                key={i}
                stat={stat}
                index={i}
                inView={inView}
                iconEl={getIconElement(stat.icon, stat.color)}
              />
            ))}

            {/* "Fast & Scalable" bonus card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="cursor-none"
            >
              <div
                ref={bonusCardTilt.ref}
                className="glass-premium rounded-[2rem] p-8 flex flex-col justify-center items-center text-center group relative overflow-hidden h-full min-h-[180px]"
                onMouseEnter={() => soundService.playHover()}
              >
                {/* Dynamic Glare Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
                  style={{
                    background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
                    mixBlendMode: 'overlay',
                  }}
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                     style={{ background: 'radial-gradient(circle, #eab308, transparent 70%)' }} />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <Zap size={28} className="text-yellow-400 mb-3" style={{ filter: 'drop-shadow(0 0 8px #eab308)' }} />
                </motion.div>
                <div className="text-sm font-bold font-grotesk text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-500 transition-all relative z-10">
                  Fast & Scalable
                </div>
                <div className="text-[9px] font-mono text-white/30 tracking-widest mt-1 uppercase relative z-10">
                  Production Ready
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
