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
  Languages: '#8b5cf6',
  Frameworks: '#06b6d4',
  Tools: '#ec4899',
  Databases: '#eab308',
  'AI/ML': '#10b981',
  DevOps: '#f97316',
}

interface SkillCardProps {
  skill: Skill
  index: number
}

function SkillCard({ skill, index }: SkillCardProps) {
  const { ref: tiltRef } = use3DTilt({
    maxRotation: 15,
    scale: 1.05,
  })

  const color =
    CATEGORY_COLORS[skill.category] || '#8b5cf6'

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        scale: 0.9,
        y: 20,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -8, 0],
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        y: 20,
      }}
      transition={{
        opacity: {
          duration: 0.4,
          delay: index * 0.04,
        },
        scale: {
          duration: 0.4,
          delay: index * 0.04,
        },
        y: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.04,
        },
        layout: {
          duration: 0.45,
        },
      }}
      className="cursor-none w-full"
    >
      <div
        ref={tiltRef}
        className="
          glass-premium
          rounded-2xl
          p-4
          sm:p-6
          flex
          flex-col
          items-center
          justify-center
          gap-4
          group
          relative
          overflow-hidden
          h-full
          min-h-[170px]
          border
          border-white/5
        "
        onMouseEnter={() =>
          soundService.playHover()
        }
      >
        {/* Glare */}
        <div
          className="
            absolute
            inset-0
            pointer-events-none
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-300
            z-30
          "
          style={{
            background:
              'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.15) 0%, transparent 60%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Glow */}
        <div
          className="
            absolute
            inset-0
            opacity-0
            group-hover:opacity-15
            transition-opacity
            duration-500
            pointer-events-none
          "
          style={{
            background: `radial-gradient(circle at center, ${color}, transparent 70%)`,
          }}
        />

        {/* Icon */}
        <div
          className="
            text-4xl
            relative
            z-10
            group-hover:scale-110
            transition-transform
            duration-500
            drop-shadow-2xl
          "
        >
          {skill.icon &&
          skill.icon.startsWith('http') ? (
            <img
              src={skill.icon}
              alt=""
              className="
                w-10
                h-10
                object-contain
                mx-auto
              "
            />
          ) : (
            skill.icon || '🔷'
          )}
        </div>

        {/* Content */}
        <div
          className="
            text-center
            relative
            z-10
          "
        >
          <div
            className="
              text-sm
              font-bold
              text-white/80
              group-hover:text-white
              transition-colors
              duration-300
              tracking-wide
            "
          >
            {skill.name}
          </div>

          {/* Meter */}
          <div
            className="
              w-16
              h-1
              bg-white/10
              rounded-full
              mt-3
              mx-auto
              overflow-hidden
              relative
            "
          >
            <div
              className="
                h-full
                rounded-full
                transition-all
                duration-1000
              "
              style={{
                width: `${skill.level}%`,
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          </div>

          <div
            className="
              text-[9px]
              font-mono
              text-white/30
              mt-1
              opacity-0
              group-hover:opacity-100
              transition-opacity
              duration-300
            "
          >
            PRO_LEVEL: {skill.level}%
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function SkillsSection() {
  const [skills, setSkills] =
    useState<Skill[]>(DEFAULT_SKILLS)

  const [activeTab, setActiveTab] =
    useState<string>('All')

  const ref = useRef(null)

  const inView = useInView(ref, {
    once: true,
    margin: '-100px',
  })

  const categories = useMemo(
    () => [
      'All',
      'Languages',
      'Frameworks',
      'Tools',
      'Databases',
      'AI/ML',
      'DevOps',
    ],
    []
  )

  useEffect(() => {
    skillService
      .getAll()
      .then((res) => {
        if (res.data.data.length > 0) {
          setSkills(res.data.data)
        }
      })
      .catch(() => {})
  }, [])

  const filteredSkills =
    activeTab === 'All'
      ? skills
      : skills.filter(
          (s) =>
            s.category.toLowerCase() ===
            activeTab.toLowerCase()
        )

  return (
    <section
      id="skills"
      className="
        relative
        py-32
        px-6
        overflow-hidden
        bg-transparent
      "
    >
      <div
        className="
          absolute
          top-1/2
          left-0
          w-[600px]
          h-[600px]
          rounded-full
          opacity-5
          blur-[120px]
          pointer-events-none
        "
        style={{
          background:
            'radial-gradient(circle, #06b6d4, transparent)',
        }}
      />

      <div
        className="max-w-7xl mx-auto"
        ref={ref}
      >
        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={
            inView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          className="
            text-center
            mb-20
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              glass-strong
              mb-6
              border
              border-white/5
            "
          >
            <div
              className="
                w-2
                h-2
                rounded-full
                bg-purple-400
                animate-pulse
              "
            />

            <p
              className="
                font-mono
                text-purple-400
                text-xs
                tracking-[0.2em]
                uppercase
              "
            >
              02. Tech Stack
            </p>
          </div>

          <h2
            className="
              text-5xl
              md:text-6xl
              font-black
              font-grotesk
              tracking-tight
              mb-6
            "
          >
            My{' '}
            <span className="text-gradient">
              Arsenal
            </span>
          </h2>

          <p
            className="
              text-white/40
              text-base
              max-w-2xl
              mx-auto
              leading-relaxed
            "
          >
            Dynamic profile showing skills
            matrix diagnostics.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={
            inView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            delay: 0.3,
          }}
          className="
            flex
            flex-wrap
            gap-2
            mb-10
            justify-center
          "
        >
          {categories.map((cat) => {
            const isSelected =
              activeTab.toLowerCase() ===
              cat.toLowerCase()

            return (
              <button
                key={cat}
                onClick={() => {
                  soundService.playClick()
                  setActiveTab(cat)
                }}
                onMouseEnter={() =>
                  soundService.playHover()
                }
                className={`
                  px-5
                  py-2
                  rounded-full
                  text-xs
                  font-mono
                  tracking-widest
                  uppercase
                  transition-all
                  cursor-none
                  border
                  ${
                    isSelected
                      ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                      : 'bg-transparent text-white/40 border-transparent hover:text-white/80 hover:bg-white/5'
                  }
                `}
              >
                {cat}
              </button>
            )
          })}
        </motion.div>

        {/* Skill Cards */}
        <motion.div
          layout
          className="
            flex
            flex-wrap
            justify-center
            lg:justify-start
            gap-5
          "
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map(
              (skill, i) => (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="
                    w-[160px]
                    sm:w-[180px]
                    md:w-[200px]
                  "
                >
                  <SkillCard
                    skill={skill}
                    index={i}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}