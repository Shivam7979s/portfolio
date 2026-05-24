import { useEffect, useState } from 'react'

export type QualityTier = 'low' | 'medium' | 'high' | 'ultra'

interface PerformanceTier {
  tier: QualityTier
  dpr: [number, number]
  particleCount: number
  orbSegments: number        // sphere geometry subdivisions
  ringSegments: number       // torus segments
  floatingShapes: number     // number of floating wireframe objects
  enableFloat: boolean       // @react-three/drei Float (slightly expensive)
  enableCamera: boolean      // camera rig mouse parallax
  frameSkip: number          // render every N frames (0 = no skip)
  antialias: boolean
}

const TIERS: Record<QualityTier, PerformanceTier> = {
  low: {
    tier: 'low',
    dpr: [0.75, 1],
    particleCount: 400,
    orbSegments: 24,
    ringSegments: 48,
    floatingShapes: 4,
    enableFloat: false,
    enableCamera: false,
    frameSkip: 2,             // render every 3rd frame
    antialias: false,
  },
  medium: {
    tier: 'medium',
    dpr: [1, 1.5],
    particleCount: 900,
    orbSegments: 40,
    ringSegments: 64,
    floatingShapes: 7,
    enableFloat: true,
    enableCamera: true,
    frameSkip: 1,             // render every 2nd frame
    antialias: false,
  },
  high: {
    tier: 'high',
    dpr: [1, 2],
    particleCount: 1800,
    orbSegments: 56,
    ringSegments: 80,
    floatingShapes: 10,
    enableFloat: true,
    enableCamera: true,
    frameSkip: 0,
    antialias: true,
  },
  ultra: {
    tier: 'ultra',
    dpr: [1, 2.5],
    particleCount: 3000,
    orbSegments: 72,
    ringSegments: 100,
    floatingShapes: 14,
    enableFloat: true,
    enableCamera: true,
    frameSkip: 0,
    antialias: true,
  },
}

/**
 * Auto-detects device performance tier by:
 * 1. Checking navigator.hardwareConcurrency (CPU cores)
 * 2. Checking devicePixelRatio
 * 3. Running a micro GPU benchmark (rAF timing over 10 frames)
 * 4. Allowing manual override via localStorage
 */
export function usePerformanceTier(): {
  perf: PerformanceTier
  override: (tier: QualityTier) => void
  isDetecting: boolean
} {
  const storedOverride = typeof window !== 'undefined'
    ? (localStorage.getItem('portfolio_quality') as QualityTier | null)
    : null

  const [tier, setTier] = useState<QualityTier>(storedOverride ?? 'high')
  const [isDetecting, setIsDetecting] = useState(!storedOverride)

  useEffect(() => {
    if (storedOverride) return // user manually chose, respect it

    // Fast heuristic detection
    const cores = navigator.hardwareConcurrency || 4
    const dpr = window.devicePixelRatio || 1
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

    // Start with a base score
    let score = 0
    if (cores >= 8) score += 2
    else if (cores >= 4) score += 1
    if (dpr <= 1) score += 1
    if (!isMobile) score += 1

    // GPU benchmark: measure average rAF interval over 10 frames
    let frameCount = 0
    const frameTimes: number[] = []
    let lastTime = performance.now()

    const benchmark = (now: number) => {
      frameTimes.push(now - lastTime)
      lastTime = now
      frameCount++

      if (frameCount < 10) {
        requestAnimationFrame(benchmark)
      } else {
        const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
        // avg < 10ms → very fast GPU, avg > 20ms → slow
        if (avg < 10) score += 2
        else if (avg < 16) score += 1
        else if (avg > 25) score -= 1

        // Map score to tier
        let detected: QualityTier = 'medium'
        if (score >= 5) detected = 'ultra'
        else if (score >= 3) detected = 'high'
        else if (score >= 1) detected = 'medium'
        else detected = 'low'

        setTier(detected)
        setIsDetecting(false)
      }
    }

    requestAnimationFrame(benchmark)
  }, [])

  const override = (newTier: QualityTier) => {
    localStorage.setItem('portfolio_quality', newTier)
    setTier(newTier)
  }

  return { perf: TIERS[tier], override, isDetecting }
}

/**
 * Hook: mounts a heavy component only once it enters the viewport.
 * Prevents off-screen canvas components from consuming GPU/CPU.
 */
export function useCanvasInView(ref: React.RefObject<Element>, rootMargin = '200px'): boolean {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect() // mount once, keep mounted
        }
      },
      { rootMargin, threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return isInView
}

export { TIERS }
