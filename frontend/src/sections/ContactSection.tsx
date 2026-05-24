import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, Mail, Phone, MapPin, Terminal, Cpu, ShieldAlert } from 'lucide-react'
import { messageService } from '../services/message.service'
import { settingsService, type SettingsData } from '../services/settings.service'
import { soundService } from '../services/sound.service'
import { use3DTilt } from '../hooks/use3DTilt'

type ToastType = 'success' | 'error' | null

const DEFAULT_SETTINGS: Partial<SettingsData> = {
  contactEmail: 'shivam.singh9798218@gmail.com',
  contactPhone: '+91-XXXXXXXXXX',
  contactLocation: 'Delhi, India',
  contactCTA: "Let's build something epic together!"
}

interface ContactInfoCardProps {
  item: {
    icon: React.ReactNode
    label: string
    value: string
    href?: string
  }
  idx: number
  inView: boolean
}

function ContactInfoCard({ item, idx, inView }: ContactInfoCardProps) {
  const { ref: tiltRef } = use3DTilt({ maxRotation: 12, scale: 1.02 })

  return (
    <motion.div 
      animate={inView ? { y: [0, -6, 0] } : {}}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }}
      className="cursor-none h-full"
    >
      <div
        ref={tiltRef}
        className="glass-premium p-6 rounded-2xl border border-white/5 flex gap-4 items-center group h-full relative overflow-hidden"
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
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors relative z-10">
          {item.icon}
        </div>
        <div className="min-w-0 relative z-10">
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">{item.label}</span>
          {item.href ? (
            <a 
              href={item.href} 
              onClick={() => soundService.playClick()}
              className="text-sm font-semibold text-white hover:text-purple-400 transition-colors truncate block"
            >
              {item.value}
            </a>
          ) : (
            <span className="text-sm font-semibold text-white truncate block">{item.value}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ContactSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: ToastType; msg: string }>({ type: null, msg: '' })
  const [contact, setContact] = useState<Partial<SettingsData>>(DEFAULT_SETTINGS)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])

  // Large form card and availability card 3D tilt hooks
  const availabilityTilt = use3DTilt({ maxRotation: 10, scale: 1.02 })
  const formTilt = use3DTilt({ maxRotation: 6, scale: 1.005 })

  useEffect(() => {
    settingsService.get()
      .then(res => {
        if (res.data.success && res.data.data) {
          setContact(res.data.data)
        }
      })
      .catch(() => {/* use defaults */})
  }, [])

  const showToast = (type: ToastType, msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast({ type: null, msg: '' }), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      soundService.playClick() // Error beep
      showToast('error', 'All terminal vectors must be populated before dispatch.')
      return
    }

    soundService.playClick()
    setLoading(true)
    setTerminalLogs([
      "⏳ INITIATING PAYLOAD ENCRYPTION MATRIX...",
      "⏳ STAGING COMMS CHANNEL DISPATCH HANDSHAKE...",
    ])

    try {
      await messageService.send(form)
      
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev,
          "✔️ COMMS CHANNEL VERIFIED. GATEWAY OPEN.",
          "✔️ ENCRYPTED COMMS PAYLOAD DISPATCHED SUCCESSFULLY.",
          "✔️ DISPATCH RESPONSE STATUS: 200 SECURE_OK.",
        ])
        soundService.playClick()
        showToast('success', 'Transmission successful. Connection established. 🚀')
        setForm({ name: '', email: '', message: '' })
      }, 800)

    } catch {
      soundService.playClick() // Error beep
      setTerminalLogs(prev => [
        ...prev,
        "❌ ROUTING FAILED. GATEWAY REFUSED PORT 5000.",
        "❌ TRANSMISSION FAULT DETECTED.",
      ])
      showToast('error', 'Gateway timeout. Please check console log protocols.')
    } finally {
      setTimeout(() => setLoading(false), 1000)
    }
  }

  return (
    <section id="contact" className="relative py-40 px-6 overflow-hidden bg-transparent">
      {/* Massive immersive background neon glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5 blur-[150px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong mb-6 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <p className="font-mono text-purple-400 text-xs tracking-[0.2em] uppercase">05. Establish Connection</p>
          </div>
          <h2 className="text-5xl md:text-7xl font-black font-grotesk tracking-tight mb-6">
            Initiate <span className="text-gradient">Contact</span>
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            {contact.contactCTA || DEFAULT_SETTINGS.contactCTA}
          </p>
        </motion.div>

        {/* Main Grid: Info + Terminal Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Contact Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-4 space-y-4"
          >
            {[
              {
                icon: <Mail size={20} className="text-purple-400" />,
                label: 'Email Protocol',
                value: contact.contactEmail || DEFAULT_SETTINGS.contactEmail!,
                href: `mailto:${contact.contactEmail || DEFAULT_SETTINGS.contactEmail}`
              },
              {
                icon: <Phone size={20} className="text-cyan-400" />,
                label: 'Phone Protocol',
                value: contact.contactPhone || DEFAULT_SETTINGS.contactPhone!,
                href: `tel:${contact.contactPhone || DEFAULT_SETTINGS.contactPhone}`
              },
              {
                icon: <MapPin size={20} className="text-pink-400" />,
                label: 'Geo Coordinates',
                value: contact.contactLocation || DEFAULT_SETTINGS.contactLocation!,
                href: undefined
              }
            ].map((item, idx) => (
              <ContactInfoCard 
                key={idx} 
                item={item} 
                idx={idx} 
                inView={inView} 
              />
            ))}

            {/* Availability status badge */}
            <div 
              ref={availabilityTilt.ref}
              className="glass-premium p-6 rounded-2xl border border-green-500/20 bg-green-500/[0.02] cursor-none relative overflow-hidden group"
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
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse" />
                <span className="text-green-400 font-mono text-xs tracking-wider uppercase font-semibold">ONLINE // LINK_AVAILABLE</span>
              </div>
              <p className="text-white/40 text-xs mt-2 leading-relaxed font-light relative z-10">
                Ready for full-stack integrations, scalable systems, and core algorithm developments.
              </p>
            </div>
          </motion.div>

          {/* Right Column: BIOS Terminal Form */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            onSubmit={handleSubmit}
            className="lg:col-span-8 w-full cursor-none"
          >
            <div
              ref={formTilt.ref}
              className="glass rounded-[2.5rem] border border-cyan-500/20 bg-black/40 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.05)] h-full relative group"
            >
              {/* Dynamic Glare Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
                style={{
                  background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(6, 182, 212, 0.08) 0%, transparent 65%)',
                  mixBlendMode: 'overlay',
                }}
              />
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/10 px-6 py-4 bg-black/60 font-mono text-[10px] text-cyan-400/60 tracking-widest uppercase relative z-10">
                <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-cyan-400" />
                  <span>COMMS_PORT // SHIVAM_SHELL</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Cpu size={10} /> BUSY: 4%</span>
                  <span className="text-green-400">STATUS_SECURE</span>
                </div>
              </div>

              {/* Main Terminal Shell Body */}
              <div className="p-8 md:p-10 space-y-8 font-mono relative z-10">
                
                {/* Toast Messages inside shell */}
                <AnimatePresence>
                  {toast.type && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 rounded-xl text-xs font-mono border"
                      style={{
                        background: toast.type === 'success' ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                        borderColor: toast.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: toast.type === 'success' ? '#34d399' : '#f87171',
                      }}
                    >
                      {toast.type === 'success' ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                      <span>[SYS] {toast.msg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shell line prompts */}
                <div className="space-y-6 text-xs md:text-sm">
                  
                  {/* 1. Name Vector */}
                  <div className="space-y-2">
                    <div className="text-cyan-400/80 font-bold">
                      Guest@ShivamPortfolio:~$: <span className="text-white/60">enter identity_name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400/80 font-bold">&gt;</span>
                      <input
                        type="text"
                        value={form.name}
                        onFocus={() => soundService.playHover()}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Input name..."
                        className="bg-transparent border-b border-white/10 focus:border-cyan-400 text-white/90 focus:outline-none w-full py-1 text-xs md:text-sm placeholder-white/20 caret-cyan-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* 2. Email Vector */}
                  <div className="space-y-2">
                    <div className="text-cyan-400/80 font-bold">
                      Guest@ShivamPortfolio:~$: <span className="text-white/60">enter comms_email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400/80 font-bold">&gt;</span>
                      <input
                        type="email"
                        value={form.email}
                        onFocus={() => soundService.playHover()}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="Input email..."
                        className="bg-transparent border-b border-white/10 focus:border-cyan-400 text-white/90 focus:outline-none w-full py-1 text-xs md:text-sm placeholder-white/20 caret-cyan-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* 3. Message Vector */}
                  <div className="space-y-2">
                    <div className="text-cyan-400/80 font-bold">
                      Guest@ShivamPortfolio:~$: <span className="text-white/60">enter data_payload</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400/80 font-bold mt-1">&gt;</span>
                      <textarea
                        rows={4}
                        value={form.message}
                        onFocus={() => soundService.playHover()}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Input transmission details..."
                        className="bg-transparent border-b border-white/10 focus:border-cyan-400 text-white/90 focus:outline-none w-full py-1 text-xs md:text-sm placeholder-white/20 caret-cyan-400 resize-none transition-colors"
                      />
                    </div>
                  </div>

                </div>

                {/* Diagnostic Log screen (Only prints logs when submitting or fails) */}
                {terminalLogs.length > 0 && (
                  <div className="p-4 rounded-xl border border-cyan-500/10 bg-black/60 space-y-1.5 text-[10px] text-cyan-400/70 font-mono">
                    <div className="border-b border-cyan-500/10 pb-1.5 mb-1.5 text-white/30 uppercase tracking-widest text-[9px] flex items-center justify-between">
                      <span>[ TRANSMISSION DIAGNOSTIC BUFFER ]</span>
                      <span className="animate-pulse">PROCESS</span>
                    </div>
                    {terminalLogs.map((log, lIdx) => (
                      <div key={lIdx} className="leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Transmit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => soundService.playHover()}
                  className="w-full flex items-center justify-center gap-3 border border-cyan-500/30 hover:border-cyan-400 bg-cyan-400/5 hover:bg-cyan-400/10 text-cyan-400 py-4 rounded-xl text-xs md:text-sm tracking-widest uppercase font-bold transition-all relative overflow-hidden cursor-none shadow-[0_0_15px_rgba(6,182,212,0.02)] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full" 
                    />
                  ) : (
                    <>
                      <Send size={14} className="animate-pulse" />
                      <span>EXECUTE TRANSMISSION // SECURE_SEND</span>
                    </>
                  )}
                </motion.button>

              </div>
            </div>
          </motion.form>

        </div>
      </div>
    </section>
  )
}
