import { useEffect, useRef } from 'react'

export const useCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const follower = followerRef.current
    if (!cursor || !follower) return

    let mouseX = 0, mouseY = 0
    let followerX = 0, followerY = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      cursor.style.left = `${mouseX - 6}px`
      cursor.style.top = `${mouseY - 6}px`
    }

    const animate = () => {
      // Smoother interpolation for cinematic feel
      followerX += (mouseX - followerX - 18) * 0.15
      followerY += (mouseY - followerY - 18) * 0.15
      follower.style.left = `${followerX}px`
      follower.style.top = `${followerY}px`
      requestAnimationFrame(animate)
    }

    const onEnter = () => {
      cursor.style.transform = 'scale(2.5)'
      cursor.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.8)'
    }
    const onLeave = () => {
      cursor.style.transform = 'scale(1)'
      cursor.style.boxShadow = 'none'
    }

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    animate()
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  return { cursorRef, followerRef }
}
