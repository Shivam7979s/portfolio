import { useEffect, useState, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import {
  Code2,
  Brain,
  Cpu,
  Zap,
  ArrowRight,
  Activity,
  Award,
} from 'lucide-react'

import {
  aboutService,
  type AboutData,
} from '../services/about.service'

import { soundService } from '../services/sound.service'
import { use3DTilt } from '../hooks/use3DTilt'

interface ParsedStat {
  label: string
  value: string
  icon: string
  color?: string
}

/* ─────────────────────────────────────────────
   Animated Counter
───────────────────────────────────────────── */

function AnimatedCounter({
  targetValue,
  inView,
  color = '#8b5cf6',
}: {
  targetValue: string
  inView: boolean
  color?: string
}) {
  const [display, setDisplay] =
    useState('0')

  const [isComplete, setIsComplete] =
    useState(false)

  const [isScrambling, setIsScrambling] =
    useState(false)

  const hasRun = useRef(false)

  // SAFE VALUE
  const safeTarget =
    targetValue || '0'

  const numeric =
    parseInt(
      safeTarget.replace(/[^\d]/g, ''),
      10
    ) || 0

  const suffix =
    safeTarget.replace(/[\d]/g, '')

  useEffect(() => {
    if (
      !inView ||
      hasRun.current ||
      numeric === 0
    )
      return

    hasRun.current = true

    setIsScrambling(true)

    let scrambleCount = 0

    const scrambleTimer =
      setInterval(() => {
        const rnd = Math.floor(
          Math.random() * numeric
        )

        setDisplay(
          rnd.toLocaleString()
        )

        scrambleCount++

        if (scrambleCount >= 8) {
          clearInterval(scrambleTimer)

          setIsScrambling(false)

          const controls = animate(
            0,
            numeric,
            {
              duration: 1.8,
              ease: [0.16, 1, 0.3, 1],

              onUpdate(v) {
                setDisplay(
                  Math.round(v).toLocaleString()
                )
              },

              onComplete() {
                setDisplay(
                  numeric.toLocaleString()
                )

                setIsComplete(true)

                soundService.playHover()
              },
            }
          )

          return () =>
            controls.stop()
        }
      }, 60)

    return () =>
      clearInterval(scrambleTimer)
  }, [inView, numeric])

  return (
    <span className="relative inline-block tabular-nums">
      <span
        className="transition-all duration-100"
        style={{
          color: isComplete
            ? '#fff'
            : isScrambling
            ? `${color}aa`
            : '#fff',

          textShadow: isComplete
            ? `0 0 30px ${color}`
            : 'none',
        }}
      >
        {display}
      </span>

      <span
        style={{
          color,
        }}
      >
        {suffix}
      </span>
    </span>
  )
}

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */

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
  const color =
    stat.color || '#8b5cf6'

  // SAFE VALUE
  const numeric =
    parseInt(
      (stat?.value || '0').replace(
        /[^\d]/g,
        ''
      ),
      10
    ) || 0

  const [isActive, setIsActive] =
    useState(false)

  const { ref: tiltRef } =
    use3DTilt({
      maxRotation: 15,
      scale: 1.05,
    })

  useEffect(() => {
    if (inView) {
      const t = setTimeout(
        () => setIsActive(true),
        index * 120
      )

      return () => clearTimeout(t)
    }
  }, [inView, index])

  const RADIUS = 38

  const CIRCUMFERENCE =
    2 * Math.PI * RADIUS

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
        scale: 0.95,
      }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
            }
          : {}
      }
      transition={{
        duration: 0.7,
        delay: 0.2 + index * 0.1,
      }}
    >
      <div
        ref={tiltRef}
        className="
          glass-premium
          rounded-[2rem]
          p-8
          relative
          overflow-hidden
          group
          flex
          flex-col
          justify-between
          min-h-[180px]
        "
      >
        <div className="flex items-start justify-between relative z-10">
          <div
            className="
              w-11
              h-11
              rounded-xl
              flex
              items-center
              justify-center
            "
            style={{
              background: `${color}18`,
            }}
          >
            {iconEl}
          </div>

          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg
              width="44"
              height="44"
              className="-rotate-90"
            >
              <circle
                cx="22"
                cy="22"
                r={RADIUS * 0.58}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="2"
              />

              <motion.circle
                cx="22"
                cy="22"
                r={RADIUS * 0.58}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={
                  CIRCUMFERENCE * 0.58
                }
                initial={{
                  strokeDashoffset:
                    CIRCUMFERENCE * 0.58,
                }}
                animate={
                  isActive
                    ? {
                        strokeDashoffset:
                          CIRCUMFERENCE *
                          0.58 *
                          (1 -
                            Math.min(
                              numeric / 100,
                              1
                            )),
                      }
                    : {}
                }
              />
            </svg>
          </div>
        </div>

        <div className="relative z-10 mt-4">
          <div className="text-4xl font-black font-grotesk text-white mb-1">
            <AnimatedCounter
              targetValue={
                stat?.value || '0'
              }
              inView={inView}
              color={color}
            />
          </div>

          <div
            className="
              text-[10px]
              font-mono
              text-white/40
              uppercase
              tracking-[0.2em]
              mt-2
            "
          >
            {stat?.label || 'STAT'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

export default function AboutSection() {
  const ref = useRef(null)

  const inView = useInView(ref, {
    once: true,
    margin: '-80px',
  })

  const highlightCardTilt =
    use3DTilt({
      maxRotation: 8,
      scale: 1.02,
    })

  const bonusCardTilt =
    use3DTilt({
      maxRotation: 15,
      scale: 1.05,
    })

  const [about, setAbout] =
    useState<AboutData>({
      id: 1,

      title: '02. Background',

      description:
        'A passionate full stack developer.',

      statsCards: JSON.stringify([
        {
          label: 'Projects',
          value: '15+',
          icon: 'Code2',
          color: '#8b5cf6',
        },
      ]),

      highlights: JSON.stringify([
        'Full Stack Developer',
      ]),

      personalBio:
        'I build modern web apps.',
    })

  useEffect(() => {
    aboutService
      .get()
      .then((res) => {
        if (
          res?.data?.success &&
          res?.data?.data
        ) {
          setAbout(res.data.data)
        }
      })
      .catch(() => {
        console.warn(
          'Using fallback About data'
        )
      })
  }, [])

  const getIconElement = (
    iconName: string,
    color?: string
  ) => {
    switch (
      (iconName || '').toLowerCase()
    ) {
      case 'code2':
        return (
          <Code2
            size={20}
            style={{ color }}
          />
        )

      case 'brain':
        return (
          <Brain
            size={20}
            style={{ color }}
          />
        )

      case 'activity':
        return (
          <Activity
            size={20}
            style={{ color }}
          />
        )

      case 'award':
        return (
          <Award
            size={20}
            style={{ color }}
          />
        )

      case 'cpu':
        return (
          <Cpu
            size={20}
            style={{ color }}
          />
        )

      default:
        return (
          <Zap
            size={20}
            style={{ color }}
          />
        )
    }
  }

  // SAFE JSON PARSE
  let parsedStats: ParsedStat[] =
    []

  try {
    parsedStats = JSON.parse(
      about?.statsCards || '[]'
    )
  } catch {
    parsedStats = []
  }

  let parsedHighlights: string[] =
    []

  try {
    parsedHighlights = JSON.parse(
      about?.highlights || '[]'
    )
  } catch {
    parsedHighlights = []
  }

  return (
    <section
      id="about"
      className="
        relative
        py-32
        px-6
        overflow-hidden
        bg-transparent
      "
    >
      <div
        className="max-w-7xl mx-auto"
        ref={ref}
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <motion.div
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={
              inView
                ? {
                    opacity: 1,
                    x: 0,
                  }
                : {}
            }
          >
            <h2
              className="
                text-5xl
                md:text-6xl
                font-black
                font-grotesk
                tracking-tight
                mb-8
              "
            >
              About{' '}
              <span className="text-gradient">
                Me
              </span>
            </h2>

            <div className="space-y-6 text-lg text-white/50 leading-[1.8]">
              <p>
                {about?.description ||
                  'Developer'}
              </p>

              <p>
                {about?.personalBio ||
                  'Bio unavailable'}
              </p>
            </div>

            <motion.button
              onClick={() => {
                document
                  .querySelector(
                    '#projects'
                  )
                  ?.scrollIntoView({
                    behavior:
                      'smooth',
                  })
              }}
              className="
                mt-10
                flex
                items-center
                gap-3
                text-white/80
                hover:text-cyan-400
                font-mono
                text-sm
              "
            >
              View Projects

              <ArrowRight size={16} />
            </motion.button>
          </motion.div>

          {/* RIGHT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative">

            {/* Highlight Card */}
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
              className="sm:col-span-2"
            >
              <div
                ref={highlightCardTilt.ref}
                className="
                  glass-premium
                  rounded-[2rem]
                  p-8
                  relative
                  overflow-hidden
                "
              >
                <div className="flex items-center gap-4 mb-4">
                  <Cpu
                    size={24}
                    className="text-purple-400"
                  />

                  <h3 className="text-2xl font-bold text-white">
                    Full Stack Focus
                  </h3>
                </div>

                <ul className="text-white/50 leading-relaxed text-sm space-y-2 list-disc list-inside">
                  {parsedHighlights.map(
                    (hl, idx) => (
                      <li key={idx}>
                        {hl}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </motion.div>

            {/* Stats */}
            {parsedStats.map(
              (stat, i) => (
                <StatCard
                  key={i}
                  stat={stat}
                  index={i}
                  inView={inView}
                  iconEl={getIconElement(
                    stat?.icon || '',
                    stat?.color
                  )}
                />
              )
            )}

            {/* Bonus */}
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
            >
              <div
                ref={bonusCardTilt.ref}
                className="
                  glass-premium
                  rounded-[2rem]
                  p-8
                  flex
                  flex-col
                  justify-center
                  items-center
                  text-center
                  h-full
                  min-h-[180px]
                "
              >
                <Zap
                  size={28}
                  className="text-yellow-400 mb-3"
                />

                <div className="text-sm font-bold text-white">
                  Fast & Scalable
                </div>

                <div className="text-[9px] font-mono text-white/30 tracking-widest mt-1 uppercase">
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