import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'
import { settingsService } from '../services/settings.service'
import { usePerformanceTier, type QualityTier } from '../hooks/usePerformanceTier'

// ─── GLSL Shaders ──────────────────────────────────────────────────────────
// Full-quality vertex shader (used on high/ultra)
const orbVertexShaderHQ = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uHoverIntensity;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normal;
    float noise = snoise(position * 3.0 + uTime * 0.8);
    float distortion = 0.15 + (uHoverIntensity * 0.15);
    vec3 newPosition = position + normal * noise * distortion;
    vPosition = newPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

// Simplified low-quality vertex shader — no snoise, cheaper sin-based distortion
const orbVertexShaderLQ = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uHoverIntensity;

  void main() {
    vUv = uv;
    vNormal = normal;
    float distortion = sin(position.x * 4.0 + uTime) * 0.08 + (uHoverIntensity * 0.1);
    vec3 newPosition = position + normal * distortion;
    vPosition = newPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

const orbFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uHoverIntensity;
  uniform float uGlowIntensity;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDirection, normalize(vNormal));
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 3.0);
    float mixValue = (sin(vPosition.y * 5.0 + uTime * 2.0) + 1.0) * 0.5;
    vec3 baseColor = mix(uColorA, uColorB, mixValue);
    float pulse = (sin(uTime * 3.0) + 1.0) * 0.5;
    float glow = fresnel * (2.0 + uHoverIntensity * 3.0 + pulse * 0.5) * uGlowIntensity;
    vec3 finalColor = baseColor + (baseColor * glow);
    gl_FragColor = vec4(finalColor, 0.6 + fresnel * 0.4 + (uHoverIntensity * 0.2));
  }
`

// ─── Frame Throttle Hook ───────────────────────────────────────────────────
function useFrameThrottle(skip: number) {
  const frameRef = useRef(0)
  return useCallback(() => {
    frameRef.current = (frameRef.current + 1) % (skip + 1)
    return frameRef.current === 0
  }, [skip])
}

// ─── Ambient Particles ─────────────────────────────────────────────────────
function AmbientParticles({ count, enabled, frameSkip }: { count: number; enabled: boolean; frameSkip: number }) {
  if (!enabled) return null
  const ref = useRef<THREE.Points>(null!)
  const shouldRender = useFrameThrottle(frameSkip)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!shouldRender() || !ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.02
    ref.current.rotation.y = state.clock.elapsedTime * 0.03
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent color="#06b6d4" size={0.03}
        sizeAttenuation depthWrite={false}
        opacity={0.6} blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

// ─── Holographic AI Orb ────────────────────────────────────────────────────
interface OrbTheme { primary: string; secondary: string; glowIntensity: number }

function HolographicOrb({
  theme, segments, isHQ, enableFloat, frameSkip
}: {
  theme: OrbTheme; segments: number; isHQ: boolean; enableFloat: boolean; frameSkip: number
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const targetHover = useRef(0)
  const shouldRender = useFrameThrottle(frameSkip)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(theme.primary) },
    uColorB: { value: new THREE.Color(theme.secondary) },
    uHoverIntensity: { value: 0 },
    uGlowIntensity: { value: theme.glowIntensity }
  }), [])

  useEffect(() => {
    if (uniforms) {
      uniforms.uColorA.value.set(theme.primary)
      uniforms.uColorB.value.set(theme.secondary)
      uniforms.uGlowIntensity.value = theme.glowIntensity
    }
  }, [theme, uniforms])

  useFrame((state) => {
    if (!shouldRender()) return
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      targetHover.current = THREE.MathUtils.lerp(targetHover.current, hovered ? 1 : 0, 0.1)
      materialRef.current.uniforms.uHoverIntensity.value = targetHover.current
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.z += 0.002
    }
  })

  const orbMesh = (
    <mesh
      ref={meshRef}
      position={[4, 0, -2]}
      scale={1.8}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Adaptive geometry: more segments = smoother but more GPU cost */}
      <sphereGeometry args={[1, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={isHQ ? orbVertexShaderHQ : orbVertexShaderLQ}
        fragmentShader={orbFragmentShader}
        uniforms={uniforms}
        transparent blending={THREE.AdditiveBlending} side={THREE.DoubleSide}
      />
    </mesh>
  )

  // Core solid inner glow — skip on low quality
  const coreGlow = segments > 24 ? (
    <mesh position={[4, 0, -2]} scale={1.2}>
      <sphereGeometry args={[1, Math.floor(segments / 2), Math.floor(segments / 2)]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
    </mesh>
  ) : null

  if (enableFloat) {
    return (
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        {orbMesh}
        {coreGlow}
      </Float>
    )
  }

  return <>{orbMesh}{coreGlow}</>
}

// ─── Orbiting Data Rings ───────────────────────────────────────────────────
function DataRings({
  theme, segments, frameSkip
}: { theme: { primary: string; secondary: string }; segments: number; frameSkip: number }) {
  const ref = useRef<THREE.Group>(null!)
  const shouldRender = useFrameThrottle(frameSkip)

  useFrame((state) => {
    if (!shouldRender() || !ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.15
    ref.current.rotation.y = state.clock.elapsedTime * 0.25
    ref.current.rotation.z = state.clock.elapsedTime * 0.10
  })

  return (
    <group ref={ref} position={[4, 0, -2]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.01, 12, segments]} />
        <meshBasicMaterial color={theme.primary} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[0, Math.PI / 3, 0]}>
        <torusGeometry args={[3.0, 0.005, 10, Math.floor(segments * 0.75)]} />
        <meshBasicMaterial color={theme.secondary} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Third ring only on medium+ */}
      {segments >= 64 && (
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[2.6, 0.015, 10, Math.floor(segments * 0.6)]} />
          <meshBasicMaterial color="#ec4899" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
    </group>
  )
}

// ─── Floating Tech Objects ─────────────────────────────────────────────────
function FloatingShape({ type, scale, position, speed, rotSpeed, color, frameSkip }: any) {
  const ref = useRef<THREE.Mesh>(null!)
  const shouldRender = useFrameThrottle(frameSkip)

  useFrame((state) => {
    if (!shouldRender() || !ref.current) return
    ref.current.rotation.x += rotSpeed[0]
    ref.current.rotation.y += rotSpeed[1]
    ref.current.rotation.z += rotSpeed[2]
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.25
  })

  return (
    <mesh ref={ref} position={position} scale={scale}>
      {type === 0 ? <boxGeometry args={[1, 1, 1]} />
       : type === 1 ? <dodecahedronGeometry args={[0.8]} />
       : <tetrahedronGeometry args={[0.8]} />}
      <meshBasicMaterial color={color} wireframe transparent opacity={0.12} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function FloatingTechObjects({
  theme, count, frameSkip
}: { theme: { primary: string; secondary: string }; count: number; frameSkip: number }) {
  const shapes = useMemo(() => (
    Array.from({ length: count }, (_, i) => ({
      id: i,
      type: Math.floor(Math.random() * 3),
      scale: 0.2 + Math.random() * 0.3,
      position: [
        (Math.random() - 0.5) * 16 + (Math.random() > 0.5 ? 3 : -3),
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8 - 4
      ] as [number, number, number],
      speed: 0.2 + Math.random() * 0.4,
      rotSpeed: [
        Math.random() * 0.005 + 0.002,
        Math.random() * 0.005 + 0.002,
        Math.random() * 0.005 + 0.002,
      ] as [number, number, number],
      color: i % 3 === 0 ? theme.primary : i % 3 === 1 ? theme.secondary : '#ec4899',
    }))
  ), [theme, count])

  return (
    <group>
      {shapes.map(s => <FloatingShape key={s.id} {...s} frameSkip={frameSkip} />)}
    </group>
  )
}

// ─── Camera Rig ────────────────────────────────────────────────────────────
function CameraRig({ enabled }: { enabled: boolean }) {
  const { camera, mouse } = useThree()
  const startY = useRef(camera.position.y)
  const startX = useRef(camera.position.x)

  useFrame((state) => {
    if (enabled) {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, startX.current + mouse.x * 2.0, 0.03)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, startY.current + (-mouse.y * 1.5), 0.03)
    }
    if (state.clock.elapsedTime < 5) {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8, 0.02)
    }
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ─── Quality Overlay UI ────────────────────────────────────────────────────
const TIER_LABELS: Record<QualityTier, { label: string; color: string }> = {
  low:    { label: 'LOW',    color: '#f97316' },
  medium: { label: 'MED',    color: '#eab308' },
  high:   { label: 'HIGH',   color: '#06b6d4' },
  ultra:  { label: 'ULTRA',  color: '#8b5cf6' },
}

function QualityIndicator({
  tier, onCycle, isDetecting
}: { tier: QualityTier; onCycle: () => void; isDetecting: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isDetecting) setVisible(true)
  }, [isDetecting])

  const { label, color } = TIER_LABELS[tier]

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <button
        onClick={onCycle}
        title="Click to cycle rendering quality"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-mono tracking-widest uppercase transition-all cursor-none hover:scale-105 backdrop-blur-sm"
        style={{
          borderColor: `${color}30`,
          background: `${color}08`,
          color: `${color}cc`,
          boxShadow: `0 0 12px ${color}15`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: color }}
        />
        {isDetecting ? 'DETECTING...' : `GPU: ${label}`}
      </button>
    </div>
  )
}

// ─── Main Scene Export ────────────────────────────────────────────────────
export default function ThreeScene() {
  const { perf, override, isDetecting } = usePerformanceTier()
  const [dbTheme, setDbTheme] = useState({
    primary: '#06b6d4',
    secondary: '#8b5cf6',
    glowIntensity: 1.0,
    particleEffects: true,
  })

  // Load theme from DB (particle effects toggle, colors, glow)
  useEffect(() => {
    settingsService.get()
      .then(res => {
        if (res.data.success && res.data.data) {
          const s = res.data.data
          let parsedTheme: any = {}
          try { parsedTheme = JSON.parse(s.themeColors) } catch { /* ignore */ }
          setDbTheme(prev => ({
            ...prev,
            ...parsedTheme,
            particleEffects: s.particleEffects,
          }))
        }
      })
      .catch(() => {})
  }, [])

  // Cycle quality tiers on button click
  const tierOrder: QualityTier[] = ['low', 'medium', 'high', 'ultra']
  const cycleTier = () => {
    const idx = tierOrder.indexOf(perf.tier)
    override(tierOrder[(idx + 1) % tierOrder.length])
  }

  const isHQ = perf.tier === 'high' || perf.tier === 'ultra'
  const particleCount = Math.min(perf.particleCount, dbTheme.particleEffects ? perf.particleCount : 0)

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{
          antialias: perf.antialias,
          alpha: true,
          powerPreference: 'high-performance',
          // Disable stencil/depth buffers when not needed (saves VRAM)
          stencil: false,
          depth: true,
        }}
        dpr={perf.dpr}
        frameloop={perf.frameSkip > 1 ? 'demand' : 'always'}
        style={{ position: 'absolute', inset: 0 }}
        performance={{ min: 0.5 }} // Auto-downscale DPR if FPS drops below threshold
      >
        <CameraRig enabled={perf.enableCamera} />
        <AmbientParticles
          count={particleCount}
          enabled={dbTheme.particleEffects}
          frameSkip={perf.frameSkip}
        />
        <HolographicOrb
          theme={dbTheme}
          segments={perf.orbSegments}
          isHQ={isHQ}
          enableFloat={perf.enableFloat}
          frameSkip={perf.frameSkip}
        />
        <DataRings
          theme={dbTheme}
          segments={perf.ringSegments}
          frameSkip={perf.frameSkip}
        />
        <FloatingTechObjects
          theme={dbTheme}
          count={perf.floatingShapes}
          frameSkip={perf.frameSkip}
        />
      </Canvas>

      {/* GPU Quality Overlay */}
      <QualityIndicator tier={perf.tier} onCycle={cycleTier} isDetecting={isDetecting} />
    </>
  )
}
