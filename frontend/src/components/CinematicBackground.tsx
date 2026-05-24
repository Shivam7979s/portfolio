import { useEffect, useRef } from 'react'
import { usePerformanceTier } from '../hooks/usePerformanceTier'

export function CyberpunkGrid() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden perspective-1000 transform-gpu">
      <div className="absolute bottom-0 left-0 right-0 h-[80vh] origin-bottom transform-gpu" style={{ transform: 'rotateX(75deg)' }}>
        {/* Animated grid that moves forward continuously */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(6,182,212,0.3)_100%),linear-gradient(90deg,transparent_95%,rgba(139,92,246,0.3)_100%)] bg-[length:60px_60px] animate-grid-flow opacity-60" />
        {/* Horizon fade */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#020208] via-[#020208]/90 to-transparent z-10" />
      </div>
    </div>
  )
}

export function AuroraGradient() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen opacity-40 transform-gpu">
      <div className="absolute -inset-[100%] opacity-60">
        <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] bg-cyan-500 rounded-full mix-blend-screen filter blur-[150px] animate-blob transform-gpu" />
        <div className="absolute top-[40%] right-[20%] w-[60vw] h-[60vw] bg-purple-600 rounded-full mix-blend-screen filter blur-[180px] animate-blob animation-delay-2000 transform-gpu" />
        <div className="absolute bottom-[20%] left-[40%] w-[55vw] h-[55vw] bg-pink-500 rounded-full mix-blend-screen filter blur-[160px] animate-blob animation-delay-4000 transform-gpu" />
      </div>
    </div>
  )
}

export function GlobalParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { perf } = usePerformanceTier()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    
    // Set canvas resolution
    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    resize()
    window.addEventListener('resize', resize)

    // Particle config based on performance tier
    const particleCount = perf.tier === 'low' ? 30
      : perf.tier === 'medium' ? 60
      : perf.tier === 'high' ? 90
      : 120 // ultra

    const particles: { x: number; y: number; z: number; vx: number; vy: number; radius: number; color: string }[] = []
    const colors = ['#8b5cf6', '#06b6d4', '#ec4899']

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 0.1, // depth for parallax
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.15, // slow upward drift
        radius: Math.random() * (perf.tier === 'low' ? 1.5 : 2.5) + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]!,
      })
    }

    let mouse = { x: -1000, y: -1000 }
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      
      // Update and draw particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i]!
        
        // Move particle
        p.x += p.vx * p.z
        p.y += p.vy * p.z
        
        // Mouse repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        const repelRadius = 160
        if (dist < repelRadius && mouse.x > 0) {
          const force = (repelRadius - dist) / repelRadius
          const angle = Math.atan2(dy, dx)
          // Drifts away from mouse, stronger if closer or at higher depth (z)
          const pushAmount = force * 2.5 * p.z
          p.x += Math.cos(angle) * pushAmount
          p.y += Math.sin(angle) * pushAmount
        }

        // Wrap around boundaries
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = (p.z / 2.5) * 0.7
        
        // Only do shadow glow on high/ultra tiers for performance
        if (perf.tier === 'high' || perf.tier === 'ultra') {
          ctx.shadowBlur = p.radius * 2.5
          ctx.shadowColor = p.color
        }
        ctx.fill()
        ctx.shadowBlur = 0 // reset for next
      }

      // Constellation lines (only on high/ultra tiers)
      if (perf.tier === 'high' || perf.tier === 'ultra') {
        const lineDistLimit = 75
        for (let i = 0; i < particleCount; i++) {
          const p1 = particles[i]!
          for (let j = i + 1; j < particleCount; j++) {
            const p2 = particles[j]!
            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const dist = Math.hypot(dx, dy)
            if (dist < lineDistLimit) {
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              // Alpha fades out based on distance
              const alpha = (1 - dist / lineDistLimit) * 0.12 * ((p1.z + p2.z) / 4)
              ctx.strokeStyle = p1.color
              ctx.globalAlpha = alpha
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        }
      }
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(animationId)
    }
  }, [perf])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-50 transform-gpu"
    />
  )
}

export function NoiseOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.04] mix-blend-overlay transform-gpu">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  )
}
