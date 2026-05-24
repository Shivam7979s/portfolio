import { useEffect, useState, useRef } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [follower, setFollower] = useState({ x: -100, y: -100, w: 20, h: 20, radius: '50%', opacity: 1 })
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null)
  const mouseRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    // 1. Mouse move tracker
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      setPosition({ x: e.clientX, y: e.clientY })
    }

    // 2. Interactive hover listeners
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactive = target.closest('a, button, [role="button"], input, textarea, .magnetic-target') as HTMLElement
      
      if (interactive) {
        setHoveredEl(interactive)
      } else {
        setHoveredEl(null)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)

    // 3. Animation loop for custom physics interpolation
    let frameId: number
    const updateFollower = () => {
      setFollower(prev => {
        const mouse = mouseRef.current
        let targetX = mouse.x
        let targetY = mouse.y
        let targetW = 32
        let targetH = 32
        let targetRadius = '50%'
        let targetOpacity = 0.6

        if (hoveredEl) {
          const rect = hoveredEl.getBoundingClientRect()
          // Docking target coordinates at center of element
          targetX = rect.left + rect.width / 2
          targetY = rect.top + rect.height / 2
          // Stretch to cover element bounds with slight padding
          targetW = rect.width + 12
          targetH = rect.height + 12
          
          // Match border-radius of the hovered element
          const computedStyle = window.getComputedStyle(hoveredEl)
          targetRadius = computedStyle.borderRadius || '8px'
          targetOpacity = 0.25
        }

        // Interpolation physics (LERP)
        const ease = hoveredEl ? 0.2 : 0.12 // Snap faster when docking
        const dx = targetX - prev.x
        const dy = targetY - prev.y
        const dw = targetW - prev.w
        const dh = targetH - prev.h

        return {
          x: prev.x + dx * ease,
          y: prev.y + dy * ease,
          w: prev.w + dw * ease,
          h: prev.h + dh * ease,
          radius: targetRadius,
          opacity: targetOpacity
        }
      })

      frameId = requestAnimationFrame(updateFollower)
    }

    frameId = requestAnimationFrame(updateFollower)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      cancelAnimationFrame(frameId)
    }
  }, [hoveredEl])

  // Hide custom cursor on touch screens / mobile devices
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null
  }

  return (
    <>
      {/* Inner Dot Cursor */}
      <div
        className="fixed pointer-events-none z-[99999] w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-transform duration-300"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: hoveredEl ? 'translate(-50%, -50%) scale(1.8)' : 'translate(-50%, -50%) scale(1)',
          boxShadow: hoveredEl ? '0 0 10px rgba(255,255,255,0.8)' : 'none'
        }}
      />

      {/* Outer Follower Morphing Halo */}
      <div
        className="fixed pointer-events-none z-[99998] border border-cyan-400/50 bg-cyan-400/[0.03] shadow-[0_0_20px_rgba(6,182,212,0.15)] -translate-x-1/2 -translate-y-1/2 mix-blend-screen transition-colors duration-300"
        style={{
          left: `${follower.x}px`,
          top: `${follower.y}px`,
          width: `${follower.w}px`,
          height: `${follower.h}px`,
          borderRadius: follower.radius,
          opacity: follower.opacity,
          borderColor: hoveredEl ? 'rgba(139, 92, 246, 0.7)' : 'rgba(6, 182, 212, 0.5)',
          background: hoveredEl ? 'rgba(139, 92, 246, 0.05)' : 'rgba(6, 182, 212, 0.03)',
          boxShadow: hoveredEl ? '0 0 25px rgba(139, 92, 246, 0.25)' : '0 0 15px rgba(6, 182, 212, 0.15)',
        }}
      />
    </>
  )
}
