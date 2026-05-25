import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Terminal, X, Brain, Bot, User } from 'lucide-react'
import { soundService } from '../services/sound.service'

interface Message {
  sender: 'bot' | 'user'
  text: string
  timestamp: string
}

const PRESET_PROMPTS = [
  { text: "What is your tech stack?", category: "stack" },
  { text: "Tell me about your projects.", category: "projects" },
  { text: "Are you available for hire?", category: "hire" },
  { text: "How can I contact you?", category: "contact" }
]

export default function InfiAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "System initialized. Greetings, visitor. I am Shivam's Neural Oracle. Ask me about his tech stack, active builds, or availability.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messageEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const getOracleResponse = (query: string): string => {
    const q = query?.toLowerCase()
    if (q.includes('stack') || q.includes('skill') || q.includes('language') || q.includes('tools')) {
      return "Shivam specializes in full-stack architecture. Core stack: Java, Python, TypeScript, React, Node.js, Spring Boot, MySQL, Prisma ORM, and Docker. He specializes in building robust backend APIs and high-fidelity interfaces."
    }
    if (q.includes('project') || q.includes('build') || q.includes('creation') || q.includes('work')) {
      return "Shivam's notable builds: 1) InfiAI Assistant (an AI client interface), 2) DSA Mastery Platform (interactive Java repository with 1200+ solved problems), 3) Cinematic 3D Portfolio CMS. Check the Projects section for details."
    }
    if (q.includes('hire') || q.includes('job') || q.includes('opportunity') || q.includes('available') || q.includes('freelance')) {
      return "Affirmative. Shivam is actively seeking computer engineering / full-stack developer roles. He is also open to contract integrations. Check out the availability status badge in the Contact section."
    }
    if (q.includes('contact') || q.includes('email') || q.includes('message') || q.includes('reach')) {
      return "Excellent. You can dispatch a communication payload directly using the BIOS terminal contact form at the bottom, or send a ping to shivam.singh9798218@gmail.com."
    }
    return `System query processed: '${query}'. Shivam is a Computer Engineering enthusiast focused on high-performance systems and dynamic user interfaces. I recommend downloading his Resume from the navbar to review his complete credentials!`
  }

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return

    soundService.playClick()
    
    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI thinking and typing response
    setTimeout(() => {
      setIsTyping(false)
      const botMsg: Message = {
        sender: 'bot',
        text: getOracleResponse(textToSend),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMsg])
      soundService.playHover() // Alert click sound for bot response
    }, 1000)
  }

  return (
    <>
      {/* Floating Pulse Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          onClick={() => {
            soundService.playClick()
            setIsOpen(!isOpen)
          }}
          onMouseEnter={() => soundService.playHover()}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white cursor-none shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] focus:outline-none group border border-white/20"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Internal orbital particles */}
          <div className="absolute inset-0.5 rounded-full border border-dashed border-white/20 animate-[spin_8s_linear_infinite]" />
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center relative"
              >
                <Brain size={20} />
                {/* Micro notification dot */}
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border border-white/40 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Futuristic Holographic Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 w-[90vw] sm:w-[380px] h-[500px] glass-strong border border-cyan-500/20 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-[100] bg-black/60 cursor-none"
          >
            {/* Window Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-cyan-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
                <span className="font-mono text-[10px] text-cyan-400/90 tracking-widest font-bold uppercase flex items-center gap-1">
                  <Terminal size={12} /> ORACLE_NODE // INFI_AI
                </span>
              </div>
              <span className="font-mono text-[9px] text-white/30 uppercase">v1.1</span>
            </div>

            {/* Scrollable Message History Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20">
              {messages.map((msg, index) => {
                const isBot = msg.sender === 'bot'
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${!isBot ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Sender Avatar */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 text-xs ${
                      isBot 
                        ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400' 
                        : 'border-purple-500/20 bg-purple-500/10 text-purple-400'
                    }`}>
                      {isBot ? <Bot size={14} /> : <User size={14} />}
                    </div>

                    {/* Chat Bubble Bubble */}
                    <div className={`p-4 rounded-2xl max-w-[75%] text-xs font-mono leading-relaxed border ${
                      isBot 
                        ? 'bg-cyan-500/[0.02] border-cyan-500/10 text-white/90 rounded-tl-none' 
                        : 'bg-purple-500/[0.02] border-purple-500/10 text-white/90 rounded-tr-none'
                    }`}>
                      {msg.text}
                      <span className="block text-[8px] text-white/20 mt-2 text-right">
                        {msg.timestamp}
                      </span>
                    </div>
                  </motion.div>
                )
              })}

              {/* Simulated typing status */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-xs shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="p-4 rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.02] rounded-tl-none flex gap-1 items-center py-3">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Preset prompt buttons drawer */}
            {messages.length < 4 && (
              <div className="px-6 pb-2 pt-2 bg-black/40 border-t border-white/5 space-y-1.5">
                <span className="block font-mono text-[8px] text-white/30 uppercase tracking-wider mb-1.5">
                  &gt; Quick Diagnostics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PROMPTS.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSend(p.text)}
                      onMouseEnter={() => soundService.playHover()}
                      className="px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:border-cyan-400 text-[10px] font-mono text-cyan-400/80 hover:text-cyan-400 bg-cyan-400/[0.02] hover:bg-cyan-400/[0.06] transition-all cursor-none"
                    >
                      {p.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom text inputs box */}
            <div className="p-4 bg-black/60 border-t border-cyan-500/10 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onFocus={() => soundService.playHover()}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(inputValue)
                }}
                placeholder="Type query to oracle..."
                className="flex-1 bg-black/40 border border-white/5 focus:border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none font-mono caret-cyan-400"
              />
              <button
                onClick={() => handleSend(inputValue)}
                onMouseEnter={() => soundService.playHover()}
                className="w-10 h-10 shrink-0 rounded-xl border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-center text-cyan-400 hover:text-cyan-300 bg-cyan-400/5 hover:bg-cyan-400/10 transition-all cursor-none"
              >
                <Send size={14} />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
