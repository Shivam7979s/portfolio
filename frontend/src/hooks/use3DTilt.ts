import { useEffect, useRef, useState } from 'react'

export interface TiltOptions {
  maxRotation?: number // max tilt degrees (default: 12)
  scale?: number // scale on hover (default: 1.02)
  perspective?: number // perspective value (default: 1000)
}

export function use3DTilt(options: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const { maxRotation = 12, scale = 1.02, perspective = 1000 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Initialize styles
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    el.style.transformStyle = 'preserve-3d'
    el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease'
    el.style.willChange = 'transform'

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left // x position within element
      const y = e.clientY - rect.top  // y position within element
      
      const px = x / rect.width  // 0 to 1
      const py = y / rect.height // 0 to 1

      // Calculate rotation based on center of card
      const rotX = -((py - 0.5) * 2) * maxRotation
      const rotY = ((px - 0.5) * 2) * maxRotation

      // Direct DOM updates for maximum performance (60fps)
      el.style.transform = `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${scale}, ${scale}, ${scale})`
      el.style.setProperty('--glare-x', `${px * 100}%`)
      el.style.setProperty('--glare-y', `${py * 100}%`)
    }

    const onMouseEnter = () => {
      setIsHovered(true)
      // Faster response transition during mousemove interaction
      el.style.transition = 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease'
    }

    const onMouseLeave = () => {
      setIsHovered(false)
      // Smooth return transition when leaving card
      el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease'
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
      el.style.setProperty('--glare-x', '50%')
      el.style.setProperty('--glare-y', '50%')
    }

    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseenter', onMouseEnter)
    el.addEventListener('mouseleave', onMouseLeave)

    return () => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseenter', onMouseEnter)
      el.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [maxRotation, scale, perspective])

  return { ref, isHovered }
}
