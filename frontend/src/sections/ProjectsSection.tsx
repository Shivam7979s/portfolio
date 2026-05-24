import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { ExternalLink, X, Layers, Terminal } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { projectService, type Project } from '../services/project.service'
import { soundService } from '../services/sound.service'
import { use3DTilt } from '../hooks/use3DTilt'

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'InfiAI Assistant',
    description: 'An advanced AI assistant platform with voice and chat interaction, designed to provide intelligent responses with a modern holographic UI.',
    image: '',
    githubUrl: 'https://github.com/ShivamSingh',
    liveUrl: '',
    techStack: JSON.stringify(['Python', 'Machine Learning', 'React', 'Node.js', 'WebSockets']),
    createdAt: '',
    featured: true, category: 'AI', order: 0,
  },
  {
    id: 2,
    title: 'DSA Mastery Platform',
    description: 'A comprehensive educational platform featuring 200+ Java Data Structures and Algorithms problems with interactive logic building exercises.',
    image: '',
    githubUrl: 'https://github.com/ShivamSingh',
    liveUrl: '',
    techStack: JSON.stringify(['Java', 'Algorithms', 'System Design', 'Spring Boot']),
    createdAt: '',
    featured: true, category: 'App', order: 1,
  },
  {
    id: 3,
    title: 'Cinematic 3D Portfolio',
    description: 'A highly immersive, full-stack personal portfolio featuring 3D rendering, complex animations, and a custom backend CMS.',
    image: '',
    githubUrl: 'https://github.com/ShivamSingh',
    liveUrl: '',
    techStack: JSON.stringify(['React', 'Three.js', 'Framer Motion', 'Tailwind CSS', 'Prisma']),
    createdAt: '',
    featured: true, category: 'Web', order: 2,
  },
]

const CARD_COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6']

interface ProjectCardProps {
  project: Project
  index: number
  onOpen: (p: Project) => void
}

function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sentinelRef, { once: true, margin: '-100px' })
  const { scrollYProgress } = useScroll({ target: sentinelRef, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])
  
  // High-performance 3D tilt hook
  const { ref: tiltRef } = use3DTilt({ maxRotation: 10, scale: 1.02 })
  const color = CARD_COLORS[index % CARD_COLORS.length]!

  let techArr: string[] = []
  try { techArr = JSON.parse(project.techStack) } catch { techArr = project.techStack.split(',') }

  return (
    <motion.div
      ref={sentinelRef}
      initial={{ opacity: 0, y: 80 }}
      animate={inView ? { opacity: 1, y: [0, -10, 0] } : {}}
      transition={{ 
        opacity: { duration: 0.8, delay: (index % 2) * 0.15 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: (index % 2) * 0.15 }
      }}
      className="cursor-none"
    >
      <div
        ref={tiltRef}
        onClick={() => {
          soundService.playClick()
          onOpen(project)
        }}
        onMouseEnter={() => soundService.playHover()}
        className="group glass-premium rounded-[2rem] overflow-hidden relative flex flex-col h-full cursor-none transform-gpu transition-all duration-300"
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
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
           style={{ background: `radial-gradient(circle at top right, ${color}20, transparent 70%)` }} />

      {/* Image / Visual Area with Parallax */}
      <div className="relative h-64 md:h-72 overflow-hidden bg-[#05050e] z-10 border-b border-white/5">
        <motion.div style={{ y }} className="absolute -inset-8 flex items-center justify-center">
          {project.image ? (
            <img 
              src={project.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${project.image}` : project.image} 
              alt={project.title} 
              className="w-full h-full object-cover opacity-50 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
            />
          ) : (
            <div className="text-[12rem] font-black font-grotesk opacity-5 tracking-tighter leading-none transition-transform duration-700 group-hover:scale-110"
                 style={{ color }}>
              {project.title.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 opacity-15 mix-blend-overlay grid-bg" />
        </motion.div>

        {/* Inner shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

        {/* Tag */}
        <div className="absolute top-5 left-5 font-mono text-[10px] tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/10 bg-black/40 text-white/50 group-hover:text-white/90 group-hover:border-white/30 transition-all backdrop-blur-md">
          PROJ_0{index + 1}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col z-10 relative">
        <h3 className="text-2xl font-black font-grotesk text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
            style={{ backgroundImage: `linear-gradient(90deg, #fff, ${color})` }}>
          {project.title}
        </h3>
        
        <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1 font-light line-clamp-3">
          {project.description}
        </p>

        {/* Tech badges */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {techArr.slice(0, 4).map(tech => (
            <span key={tech} className="text-[9px] font-mono px-2.5 py-1 rounded bg-white/5 text-white/60 border border-white/5">
              {tech.trim()}
            </span>
          ))}
          {techArr.length > 4 && (
            <span className="text-[9px] font-mono px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/10">
              +{techArr.length - 4} MORE
            </span>
          )}
        </div>

        {/* Action Link indicator */}
        <div className="flex items-center gap-2 mt-auto font-mono text-[10px] tracking-widest text-cyan-400 group-hover:text-white transition-colors duration-300">
          <Terminal size={12} /> INITIALIZE EXPANSION &gt;
        </div>
      </div>
      </div>
    </motion.div>
  )
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    projectService.getAll()
      .then(res => { if (res.data.data.length > 0) setProjects(res.data.data) })
      .catch(() => {/* use defaults */})
  }, [])

  return (
    <section id="projects" className="relative py-32 px-6 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong mb-6 border border-white/5">
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              <p className="font-mono text-pink-400 text-xs tracking-[0.2em] uppercase">03. Exhibitions</p>
            </div>
            <h2 className="text-5xl md:text-7xl font-black font-grotesk tracking-tight">
              Featured <span className="text-gradient">Creations</span>
            </h2>
          </div>
          <p className="text-white/40 text-base md:text-right max-w-md leading-relaxed font-light">
            A curated selection of my most ambitious engineering builds. Focused on robust logic and cinematic presentation.
          </p>
        </motion.div>

        {/* 2-column layout for majestic cinematic display */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} onOpen={setActiveProject} />
          ))}
        </div>
      </div>

      {/* Futuristic Fullscreen Detail Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020208]/90 backdrop-blur-2xl overflow-y-auto cursor-none"
            onClick={() => {
              soundService.playClick()
              setActiveProject(null)
            }}
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl glass-strong border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.8)] h-[85vh] max-h-[720px]"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  soundService.playClick()
                  setActiveProject(null)
                }}
                onMouseEnter={() => soundService.playHover()}
                className="absolute top-6 right-6 z-30 p-3 rounded-full bg-black/60 border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-all cursor-none"
              >
                <X size={18} />
              </button>

              {/* Left Column: Media / Image */}
              <div className="w-full md:w-1/2 relative bg-[#05050e] h-[250px] md:h-auto overflow-hidden border-r border-white/5 shrink-0">
                {activeProject.image ? (
                  <img
                    src={activeProject.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${activeProject.image}` : activeProject.image}
                    alt={activeProject.title}
                    className="w-full h-full object-cover opacity-75"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10rem] font-black font-grotesk opacity-5 text-purple-400">
                    {activeProject.title.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020208] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#020208]/80 pointer-events-none" />
                <div className="absolute inset-0 opacity-10 mix-blend-overlay grid-bg pointer-events-none" />
              </div>

              {/* Right Column: Dynamic Data HUD */}
              <div className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col justify-between bg-black/40">
                <div className="space-y-6">
                  {/* Category Tag */}
                  <div className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-purple-400 border border-purple-500/20 bg-purple-500/[0.03] px-3 py-1.5 rounded-lg">
                    <Layers size={10} /> SYSTEM PROJECT ARCHIVE
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl md:text-4xl font-black font-grotesk text-white">
                    {activeProject.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 text-sm leading-relaxed font-light">
                    {activeProject.description}
                  </p>

                  {/* Tech stack */}
                  <div className="space-y-3">
                    <h4 className="font-mono text-[10px] tracking-widest text-white/30 uppercase flex items-center gap-2">
                      <Terminal size={10} /> Stack Verification
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        let stack: string[] = []
                        try { stack = JSON.parse(activeProject.techStack) } catch { stack = activeProject.techStack.split(',') }
                        return stack.map(t => (
                          <span key={t} className="text-xs font-mono px-3.5 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-white/80">
                            {t.trim()}
                          </span>
                        ))
                      })()}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Drawer */}
                <div className="flex items-center gap-4 border-t border-white/5 pt-8 mt-8">
                  {activeProject.githubUrl && (
                    <a
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => soundService.playHover()}
                      onClick={() => soundService.playClick()}
                      className="flex items-center justify-center gap-2 flex-1 py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-none font-semibold text-xs border border-white/5"
                    >
                      <FaGithub size={16} /> Codebase Source
                    </a>
                  )}
                  {activeProject.liveUrl && (
                    <a
                      href={activeProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => soundService.playHover()}
                      onClick={() => soundService.playClick()}
                      className="flex items-center justify-center gap-2 flex-1 py-3.5 px-6 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 transition-all cursor-none font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                    >
                      <ExternalLink size={16} /> Live Simulation
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
