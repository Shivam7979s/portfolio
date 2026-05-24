import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, MapPin, Mail } from 'lucide-react'
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'
import { SiLeetcode, SiCodeforces } from 'react-icons/si'
import { socialService, type SocialLinksData } from '../services/social.service'
import { settingsService } from '../services/settings.service'

const DEFAULT_SOCIALS = {
  github: 'https://github.com/ShivamSingh',
  linkedin: 'https://linkedin.com',
  instagram: 'https://instagram.com',
  twitter: 'https://twitter.com',
}

export default function Footer() {
  const [socials, setSocials] = useState<Partial<SocialLinksData>>(DEFAULT_SOCIALS)
  const [logoText, setLogoText] = useState('Shivam Singh')
  const [contactEmail, setContactEmail] = useState('shivam@example.com')
  const [contactLocation, setContactLocation] = useState('India 🇮🇳')

  useEffect(() => {
    socialService.get()
      .then(res => { if (res.data.success) setSocials(res.data.data) })
      .catch(() => {})

    settingsService.get()
      .then(res => {
        if (res.data.success && res.data.data) {
          if (res.data.data.logoText) setLogoText(res.data.data.logoText)
          if (res.data.data.contactEmail) setContactEmail(res.data.data.contactEmail)
          if (res.data.data.contactLocation) setContactLocation(res.data.data.contactLocation)
        }
      })
      .catch(() => {})
  }, [])

  // Build dynamic social icons list
  const socialIcons = [
    socials.github && { icon: <FaGithub size={18} />, href: socials.github, name: 'GitHub' },
    socials.linkedin && { icon: <FaLinkedin size={18} />, href: socials.linkedin, name: 'LinkedIn' },
    socials.instagram && { icon: <FaInstagram size={18} />, href: socials.instagram, name: 'Instagram' },
    socials.twitter && { icon: <FaTwitter size={18} />, href: socials.twitter, name: 'Twitter' },
    socials.youtube && { icon: <FaYoutube size={18} />, href: socials.youtube, name: 'YouTube' },
    socials.leetcode && { icon: <SiLeetcode size={18} />, href: socials.leetcode, name: 'LeetCode' },
    socials.codeforces && { icon: <SiCodeforces size={18} />, href: socials.codeforces, name: 'Codeforces' },
  ].filter(Boolean) as { icon: any; href: string; name: string }[]

  // Parse first & last name from logoText
  const nameParts = logoText.split(' ')
  const firstName = nameParts.slice(0, -1).join(' ') || logoText
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''

  return (
    <footer className="relative pt-32 pb-12 px-6 border-t border-white/10 overflow-hidden bg-transparent">
      {/* Immersive Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full opacity-5 blur-[150px] pointer-events-none"
           style={{ background: 'radial-gradient(ellipse, #8b5cf6, #06b6d4)' }} />
           
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none grid-bg opacity-30 mix-blend-screen" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-8">
            <motion.div
              className="text-4xl font-black font-grotesk text-white flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              {firstName} <span className="text-gradient">{lastName}</span>
            </motion.div>
            <p className="text-white/40 text-base leading-[1.8] font-light max-w-sm">
              Architecting premium digital experiences and intelligent systems. Bridging the gap between cinematic design and high-performance engineering.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {socialIcons.map(({ icon, href, name }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white/50 hover:text-white transition-all cursor-none group hover:bg-white/10 hover:border-white/20"
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={name}
                >
                  <div className="group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all">
                    {icon}
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
            <div className="space-y-6">
              <h4 className="text-white font-bold font-mono tracking-widest text-xs uppercase">Navigation</h4>
              <ul className="space-y-5">
                {['Home','About','Skills','Projects','Experience'].map(link => (
                  <li key={link}>
                    <button
                      onClick={() => document.querySelector(`#${link.toLowerCase()}`)?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-sm text-white/40 hover:text-cyan-400 transition-colors cursor-none flex items-center gap-3 group font-medium"
                    >
                      <span className="w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-4" />
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-white font-bold font-mono tracking-widest text-xs uppercase">Location & Comms</h4>
              <ul className="space-y-5">
                <li className="flex items-center gap-3 text-sm text-white/40 font-medium">
                  <MapPin size={16} className="text-cyan-400 shrink-0" /> {contactLocation}
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <Mail size={16} className="text-purple-400 shrink-0" />
                  <a href={`mailto:${contactEmail}`} className="text-white/40 hover:text-white transition-colors truncate">{contactEmail}</a>
                </li>
              </ul>
            </div>
            
            <div className="space-y-6 hidden md:block">
              <h4 className="text-white font-bold font-mono tracking-widest text-xs uppercase">System Status</h4>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-white/50 font-medium glass py-2 px-4 rounded-xl border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse" />
                  Available for Work
                </div>
                <div className="flex items-center gap-3 text-sm text-white/50 font-medium glass py-2 px-4 rounded-xl border border-white/5">
                  <Sparkles size={14} className="text-yellow-400" />
                  Building the Future
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thick Divider */}
        <div className="w-full h-px relative mb-10 overflow-hidden">
          <motion.div 
            className="absolute inset-0" 
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(6,182,212,0.8), transparent)' }} 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
          />
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-mono text-white/30">
          <p>
            © {new Date().getFullYear()} {logoText}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            Crafted with <Heart size={14} className="text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> in React & Three.js
          </p>
        </div>
      </div>
    </footer>
  )
}
