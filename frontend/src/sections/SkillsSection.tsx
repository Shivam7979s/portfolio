import { useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { skillService, type Skill } from '../services/skill.service'
import { soundService } from '../services/sound.service'
import { use3DTilt } from '../hooks/use3DTilt'

const DEFAULT_SKILLS: Skill[] = [
  { id: 1, name: 'Java', category: 'Languages', icon: '☕', level: 90, order: 0 },
  { id: 2, name: 'Python', category: 'Languages', icon: '🐍', level: 85, order: 1 },
  { id: 3, name: 'TypeScript', category: 'Languages', icon: '⚡', level: 80, order: 2 },
  { id: 4, name: 'React', category: 'Frameworks', icon: '⚛️', level: 90, order: 3 },
  { id: 5, name: 'Node.js', category: 'Frameworks', icon: '🟢', level: 85, order: 4 },
  { id: 6, name: 'Docker', category: 'DevOps', icon: '🐳', level: 75, order: 5 },
]

const CATEGORY_COLORS: Record<string, string> = {
  Languages: '#8b5cf6',   // Purple
  Frameworks: '#06b6d4',  // Cyan
  Tools: '#ec4899',       // Pink
  Databases: '#eab308',   // Yellow
  'AI/ML': '#10b981',     // Green
  DevOps: '#f97316',      // Orange
}

interface SkillCardProps {
  skill: Skill
  index: number
}

function SkillCard({ skill, index }: SkillCardProps) {
  const { ref: tiltRef } = use3DTilt({ maxRotation: 15, scale: 1.05 })
  const color = CATEGORY_COLORS[skill.category] || '#8b5cf6'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ 
        opacity: { duration: 0.4, delay: index * 0.04 },
        scale: { duration: 0.4, delay: index * 0.04 },
        y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.04 }
      }}
      className="cursor-none"
    >
      <div
        ref={tiltRef}
        className="glass-premium rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-4 group relative overflow-hidden h-full min-h-[150px]"
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

        {/* Dynamic Backglow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none"
             style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }} />
             
        {/* Icon display */}
        <div className="text-4xl relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
          {skill.icon && skill.icon.startsWith('http') ? (
            <img src={skill.icon} alt="" className="w-10 h-10 object-contain mx-auto" />
          ) : (
            skill.icon || '🔷'
          )}
        </div>
        
        <div className="text-center relative z-10">
          <div className="text-sm font-bold text-white/80 group-hover:text-white transition-colors duration-300 tracking-wide">
            {skill.name}
          </div>
          
          {/* Glow fill meter */}
          <div className="w-16 h-1 bg-white/10 rounded-full mt-3 mx-auto overflow-hidden relative">
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ 
                width: `${skill.level}%`, 
                backgroundColor: color, 
                boxShadow: `0 0 8px ${color}`
              }}
            />
          </div>
          <div className="text-[9px] font-mono text-white/30 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            PRO_LEVEL: {skill.level}%
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS)
  const [activeTab, setActiveTab] = useState<string>('All')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const categories = useMemo(() => ['All', 'Languages', 'Frameworks', 'Tools', 'Databases', 'AI/ML', 'DevOps'], [])

  useEffect(() => {
    skillService.getAll()
      .then(res => { if (res.data.data.length > 0) setSkills(res.data.data) })
      .catch(() => {/* use defaults */})
  }, [])

  // Calculate statistics for the Radar chart
  const radarData = useMemo(() => {
    // We ignore the 'All' tab for mapping vertices
    const mapCategories = ['Languages', 'Frameworks', 'Tools', 'Databases', 'AI/ML', 'DevOps']
    const center = 150
    const maxVal = 100
    const rMax = 100

    return mapCategories.map((cat, idx) => {
      const angle = (idx * 2 * Math.PI) / mapCategories.length - Math.PI / 2
      const catSkills = skills.filter(s => s.category.toLowerCase() === cat.toLowerCase())
      const avgLevel = catSkills.length > 0 
        ? Math.round(catSkills.reduce((sum, s) => sum + s.level, 0) / catSkills.length)
        : 40 // Fallback base value

      const r = (avgLevel / maxVal) * rMax
      return {
        category: cat,
        avg: avgLevel,
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        // Coordinates at max 100% boundary
        boundaryX: center + rMax * Math.cos(angle),
        boundaryY: center + rMax * Math.sin(angle),
        // Coordinate for level indicators (60%)
        midX: center + (rMax * 0.6) * Math.cos(angle),
        midY: center + (rMax * 0.6) * Math.sin(angle),
      }
    })
  }, [skills])

  // Polygon path coordinates string for SVG
  const radarPolygonPath = useMemo(() => {
    return radarData.map(d => `${d.x},${d.y}`).join(' ')
  }, [radarData])

  const filteredSkills = activeTab === 'All' 
    ? skills 
    : skills.filter(s => s.category.toLowerCase() === activeTab.toLowerCase())

  return (
    <section id="skills" className="relative py-32 px-6 overflow-hidden bg-transparent">
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] rounded-full opacity-5 blur-[120px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

      <div className="max-w-7xl mx-auto" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong mb-6 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <p className="font-mono text-purple-400 text-xs tracking-[0.2em] uppercase">02. Tech Stack</p>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black font-grotesk tracking-tight mb-6">
            My <span className="text-gradient">Arsenal</span>
          </h2>
          <p className="text-white/40 text-base max-w-2xl mx-auto leading-relaxed">
            Dynamic profile showing skills matrix diagnostics. Hover or click radar vertices to filter stack components.
          </p>
        </motion.div>

        {/* Dynamic HUD Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Column 1: Interactive SVG Radar Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center items-center relative py-6"
          >
            <div className="glass rounded-[2.5rem] p-8 border border-white/5 relative bg-black/20 flex flex-col items-center">
              {/* Radar Title */}
              <div className="w-full flex items-center justify-between font-mono text-[9px] text-white/30 tracking-widest uppercase mb-4">
                <span>[ MATRIX // NEURAL_GRID ]</span>
                <span className="text-cyan-400 animate-pulse">DIAGNOSTIC_ACTIVE</span>
              </div>

              {/* Chart SVG */}
              <svg width="340" height="320" viewBox="0 0 340 320" className="relative z-10 select-none">
                {/* 1. Concentric background hexagon grids */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, lIdx) => {
                  const points = radarData.map((_, i) => {
                    const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2
                    const r = level * 100
                    return `${170 + r * Math.cos(angle)},${160 + r * Math.sin(angle)}`
                  }).join(' ')
                  return (
                    <polygon
                      key={lIdx}
                      points={points}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                    />
                  )
                })}

                {/* 2. Axis lines */}
                {radarData.map((d, idx) => (
                  <line
                    key={idx}
                    x1="170"
                    y1="160"
                    x2={d.boundaryX + 20}
                    y2={d.boundaryY + 10}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                ))}

                {/* 3. Dynamic Filled Area Polygon */}
                <polygon
                  points={radarPolygonPath.replace(/150/g, '170').replace(/150/g, '160')} // Adjust coordinates to center (170, 160)
                  fill="rgba(6, 182, 212, 0.08)"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  className="transition-all duration-700"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.4))'
                  }}
                />

                {/* 4. Interactive vertices nodes */}
                {radarData.map((d, idx) => {
                  const isCatActive = activeTab.toLowerCase() === d.category.toLowerCase()
                  const color = CATEGORY_COLORS[d.category] || '#8b5cf6'
                  
                  // Adjust calculations to map (170, 160) center
                  const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2
                  const nodeX = 170 + (d.avg / 100) * 100 * Math.cos(angle)
                  const nodeY = 160 + (d.avg / 100) * 100 * Math.sin(angle)
                  const labelX = 170 + 124 * Math.cos(angle)
                  const labelY = 160 + 124 * Math.sin(angle)

                  return (
                    <g 
                      key={idx} 
                      className="cursor-none group"
                      onMouseEnter={() => {
                        soundService.playHover()
                        setActiveTab(d.category)
                      }}
                      onClick={() => {
                        soundService.playClick()
                        setActiveTab(d.category)
                      }}
                    >
                      {/* Node point marker */}
                      <circle
                        cx={nodeX}
                        cy={nodeY}
                        r={isCatActive ? 6 : 4}
                        fill={color}
                        stroke="#fff"
                        strokeWidth="1.5"
                        className="transition-all duration-300"
                        style={{
                          filter: `drop-shadow(0 0 6px ${color})`
                        }}
                      />

                      {/* Vertex label texts */}
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill={isCatActive ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                        fontSize="9"
                        fontWeight={isCatActive ? 'bold' : 'normal'}
                        className="font-mono transition-colors duration-300"
                        letterSpacing="0.1em"
                      >
                        {d.category.toUpperCase()} ({d.avg}%)
                      </text>
                    </g>
                  )
                })}
              </svg>

              {/* Reset to 'All' Button */}
              <button
                onClick={() => {
                  soundService.playClick()
                  setActiveTab('All')
                }}
                className={`mt-4 px-4 py-2 font-mono text-[9px] tracking-widest rounded-lg border uppercase transition-all cursor-none ${
                  activeTab === 'All' 
                    ? 'border-white/20 text-white bg-white/5' 
                    : 'border-white/5 text-white/40 hover:text-white/80 hover:border-white/20'
                }`}
              >
                RESET FILTERS (SHOW ALL)
              </button>
            </div>
          </motion.div>

          {/* Column 2: Tab buttons + Skills cards Display Grid */}
          <div className="lg:col-span-7 flex flex-col justify-start h-full">
            {/* Category selection Tabs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 mb-10 justify-center lg:justify-start"
            >
              {categories.map(cat => {
                const isSelected = activeTab.toLowerCase() === cat.toLowerCase()
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      soundService.playClick()
                      setActiveTab(cat)
                    }}
                    onMouseEnter={() => soundService.playHover()}
                    className={`px-5 py-2 rounded-full text-xs font-mono tracking-widest uppercase transition-all cursor-none border ${
                      isSelected
                        ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.08)]' 
                        : 'bg-transparent text-white/40 border-transparent hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </motion.div>

            {/* Dynamic filtered cards */}
            <motion.div 
              layout 
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              <AnimatePresence mode='popLayout'>
                {filteredSkills.map((skill, i) => (
                  <SkillCard key={skill.id} skill={skill} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
