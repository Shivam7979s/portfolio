import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CursorSparkle() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-hover-target') ||
        target.closest('.cursor-hover-target')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const ringVariants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      scale: 1,
      backgroundColor: 'transparent',
      borderColor: 'rgba(139, 92, 246, 0.4)', // Purple
      borderWidth: '2px',
    },
    hover: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      scale: 1.5,
      backgroundColor: 'rgba(6, 182, 212, 0.1)', // Cyan
      borderColor: 'rgba(6, 182, 212, 0.8)',
      borderWidth: '1px',
    },
    click: {
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
      scale: 0.8,
      backgroundColor: 'rgba(236, 72, 153, 0.2)', // Pink
      borderColor: 'rgba(236, 72, 153, 0.8)',
      borderWidth: '3px',
    }
  }

  const dotVariants = {
    default: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
      scale: 1,
      opacity: 1,
      backgroundColor: 'rgba(6, 182, 212, 1)' // Cyan
    },
    hover: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
      scale: 0,
      opacity: 0,
      backgroundColor: 'rgba(6, 182, 212, 1)'
    },
    click: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
      scale: 2,
      opacity: 1,
      backgroundColor: 'rgba(236, 72, 153, 1)' // Pink
    }
  }

  const state = isClicking ? "click" : isHovering ? "hover" : "default"

  return (
    <>
      {/* Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] backdrop-blur-[2px]"
        variants={ringVariants}
        animate={state}
        transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.5 }}
        style={{ boxShadow: isHovering ? '0 0 15px rgba(6,182,212,0.4)' : '0 0 10px rgba(139,92,246,0.2)' }}
      />
      {/* Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[10000]"
        variants={dotVariants}
        animate={state}
        transition={{ type: 'spring', stiffness: 600, damping: 25, mass: 0.1 }}
        style={{ boxShadow: '0 0 8px rgba(6,182,212,0.8)' }}
      />
    </>
  )
}
