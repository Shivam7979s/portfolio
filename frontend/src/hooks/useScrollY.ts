import { useEffect, useState } from 'react'

export const useScrollY = () => {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handle = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])
  return scrollY
}
