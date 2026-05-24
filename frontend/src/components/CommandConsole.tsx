import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Command, FileText, ArrowRight, ShieldAlert, Volume2, VolumeX, Eye } from 'lucide-react'
import { soundService } from '../services/sound.service'
import { resumeService } from '../services/resume.service'

interface CommandItem {
  id: string
  label: string
  action: () => void
  icon: React.ReactNode
  shortcut?: string
}

export default function CommandConsole() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [resumeUrl, setResumeUrl] = useState("/resume.pdf")
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  // 1. Fetch resume URL
  useEffect(() => {
    resumeService.getActive()
      .then(res => {
        if (res.data.success && res.data.data) {
          const fileUrl = res.data.data.fileUrl
          if (fileUrl.startsWith('/uploads/')) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
            const baseUrl = apiUrl.replace('/api', '')
            setResumeUrl(`${baseUrl}${fileUrl}`)
          } else {
            setResumeUrl(fileUrl)
          }
        }
      })
      .catch(() => {})
  }, [])

  // 2. Commands definition
  const commands: CommandItem[] = [
    {
      id: 'scroll-home',
      label: 'Scroll to Home Section',
      action: () => document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' }),
      icon: <Terminal size={14} className="text-cyan-400" />
    },
    {
      id: 'scroll-about',
      label: 'Scroll to About Section',
      action: () => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }),
      icon: <Terminal size={14} className="text-cyan-400" />
    },
    {
      id: 'scroll-skills',
      label: 'Scroll to Tech Arsenal',
      action: () => document.querySelector('#skills')?.scrollIntoView({ behavior: 'smooth' }),
      icon: <Terminal size={14} className="text-cyan-400" />
    },
    {
      id: 'scroll-projects',
      label: 'Scroll to Projects Exhibition',
      action: () => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }),
      icon: <Terminal size={14} className="text-cyan-400" />
    },
    {
      id: 'scroll-experience',
      label: 'Scroll to Career Evolution',
      action: () => document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' }),
      icon: <Terminal size={14} className="text-cyan-400" />
    },
    {
      id: 'scroll-contact',
      label: 'Scroll to BIOS Contact Form',
      action: () => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }),
      icon: <Terminal size={14} className="text-cyan-400" />
    },
    {
      id: 'open-resume',
      label: 'Download Shivam\'s Resume PDF',
      action: () => window.open(resumeUrl, '_blank', 'noopener,noreferrer'),
      icon: <FileText size={14} className="text-pink-400" />
    },
    {
      id: 'admin-portal',
      label: 'Redirect to Admin BIOS Login',
      action: () => navigate('/admin/login'),
      icon: <ShieldAlert size={14} className="text-purple-400" />
    },
    {
      id: 'toggle-mute',
      label: soundService.isMuted() ? 'System Sounds: UNMUTE' : 'System Sounds: MUTE',
      action: () => {
        soundService.setMuted(!soundService.isMuted())
        // Force refresh console items
        setQuery(q => q + " ")
        setTimeout(() => setQuery(q => q.trim()), 50)
      },
      icon: soundService.isMuted() ? <Volume2 size={14} className="text-green-400" /> : <VolumeX size={14} className="text-red-400" />
    }
  ]

  // Filter commands by text query
  const filtered = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  )

  // 3. Listen to keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Console with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        soundService.playClick()
        setIsOpen(open => !open)
        setQuery("")
        setSelectedIndex(0)
      }

      if (!isOpen) return

      // Keyboard navigation inside console
      if (e.key === 'Escape') {
        e.preventDefault()
        soundService.playClick()
        setIsOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        soundService.playHover()
        setSelectedIndex(prev => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        soundService.playHover()
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          executeCommand(filtered[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, selectedIndex])

  const executeCommand = (cmd: CommandItem) => {
    soundService.playBootBeep()
    cmd.action()
    setIsOpen(false)
  }

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  return (
    <>
      {/* Keyboard Shortcut Banner Indicator (Shows briefly at boot-up or navbar hover) */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:block select-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-black/60 font-mono text-[9px] text-white/30 tracking-widest uppercase">
          <Command size={10} />
          <span>Press [Ctrl+K] to launch Command Shell</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#020208]/85 backdrop-blur-md cursor-none"
            onClick={() => {
              soundService.playClick()
              setIsOpen(false)
            }}
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl glass-strong border border-cyan-500/20 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] bg-black/80 overflow-hidden flex flex-col h-[380px]"
            >
              {/* CLI Input Bar */}
              <div className="flex items-center gap-3 border-b border-cyan-500/10 px-6 py-4">
                <Command size={16} className="text-cyan-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  placeholder="Enter dynamic CLI command..."
                  className="flex-1 bg-transparent border-none text-white focus:outline-none font-mono text-sm caret-cyan-400 placeholder-white/20"
                />
                <span className="font-mono text-[9px] text-white/30 tracking-widest uppercase border border-white/10 px-2 py-0.5 rounded">
                  ESC_CLOSE
                </span>
              </div>

              {/* Console List Commands */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                {filtered.length > 0 ? (
                  filtered.map((cmd, idx) => {
                    const isSelected = idx === selectedIndex
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => {
                          soundService.playHover()
                          setSelectedIndex(idx)
                        }}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-mono text-xs cursor-none border transition-all ${
                          isSelected
                            ? 'bg-cyan-400/5 border-cyan-500/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.06)]'
                            : 'bg-transparent border-transparent text-white/50 hover:text-white/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {cmd.icon}
                          <span>{cmd.label}</span>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-cyan-400 font-bold animate-pulse text-[10px]">
                            EXECUTE <ArrowRight size={10} />
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-white/30 font-mono">
                    <Eye size={20} className="mb-2" />
                    <p className="text-xs">No matching terminal vectors found.</p>
                  </div>
                )}
              </div>

              {/* Info Footer */}
              <div className="border-t border-cyan-500/10 px-6 py-3.5 bg-black/40 flex items-center justify-between font-mono text-[9px] text-white/30 tracking-widest uppercase">
                <span>[ ↑↓ TO NAVIGATE ]</span>
                <span>[ ENTER TO RUN ]</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
