'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const SEGMENTS = [
  { label: 'Macrotask', color: '#FF4D6D', startAngle: 0 },
  { label: 'Microtask\ndrain', color: '#FFB340', startAngle: Math.PI / 2 },
  { label: 'rAF', color: '#4D9FFF', startAngle: Math.PI },
  { label: 'Render', color: '#00E5A0', startAngle: (3 * Math.PI) / 2 },
]

const RING_RADIUS = 2.2
const RING_SEGMENTS = 64

function RingSegment({ startAngle, color, index }: { startAngle: number; color: string; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => {
    const geo = new THREE.RingGeometry(RING_RADIUS - 0.28, RING_RADIUS, RING_SEGMENTS, 1, startAngle, Math.PI / 2 - 0.08)
    return geo
  }, [startAngle])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.MeshStandardMaterial
    const t = clock.getElapsedTime()
    const tokenAngle = ((t * 0.8) % (Math.PI * 2))
    const segStart = startAngle
    const segEnd = startAngle + Math.PI / 2
    const active = tokenAngle >= segStart && tokenAngle < segEnd
    mat.emissiveIntensity = active ? 0.6 : 0.12
  })

  return (
    <mesh ref={ref} geometry={geo}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Token() {
  const ref = useRef<THREE.Mesh>(null)
  const trailRefs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const angle = (t * 0.8) % (Math.PI * 2)
    // slow down at microtask segment (PI/2 to PI)
    const inMicrotask = angle > Math.PI / 2 && angle < Math.PI
    const slowFactor = inMicrotask ? 0.4 : 1.0
    const adjustedAngle = angle
    ref.current.position.x = Math.cos(adjustedAngle) * RING_RADIUS
    ref.current.position.y = Math.sin(adjustedAngle) * RING_RADIUS
    ref.current.scale.setScalar(inMicrotask ? 1.3 : 1.0)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#FF4D6D" emissive="#FF4D6D" emissiveIntensity={6} />
    </mesh>
  )
}

function MicroTokens() {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const baseAngle = (t * 0.8) % (Math.PI * 2)
    const inMicrotask = baseAngle > Math.PI / 2 && baseAngle < Math.PI
    refs.current.forEach((ref, i) => {
      if (!ref) return
      ref.visible = inMicrotask
      if (inMicrotask) {
        const a = baseAngle + i * 0.25
        ref.position.x = Math.cos(a) * RING_RADIUS
        ref.position.y = Math.sin(a) * RING_RADIUS
      }
    })
  })
  return (
    <>
      {[0, 1, 2].map(i => (
        <mesh key={i} ref={el => { refs.current[i] = el }}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#FFB340" emissive="#FFB340" emissiveIntensity={5} transparent opacity={0.7} />
        </mesh>
      ))}
    </>
  )
}

function FrameBudget() {
  const geo = useMemo(() => new THREE.RingGeometry(RING_RADIUS + 0.45, RING_RADIUS + 0.55, 64, 1, 0, Math.PI * 2), [])
  return (
    <>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#4A4A6A" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, RING_RADIUS + 0.85, 0]} fontSize={0.13} color="#4A4A6A" anchorX="center" anchorY="middle">16ms frame budget</Text>
    </>
  )
}

function SegmentLabels() {
  return (
    <>
      {SEGMENTS.map(s => {
        const midAngle = s.startAngle + Math.PI / 4
        const r = RING_RADIUS - 0.65
        const x = Math.cos(midAngle) * r
        const y = Math.sin(midAngle) * r
        return (
          <Text key={s.label} position={[x, y, 0.01]} fontSize={0.13} color={s.color} anchorX="center" anchorY="middle">
            {s.label}
          </Text>
        )
      })}
    </>
  )
}

export default function EventLoopScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#FF4D6D" />
      {SEGMENTS.map((s, i) => <RingSegment key={s.label} {...s} index={i} />)}
      <FrameBudget />
      <SegmentLabels />
      <Token />
      <MicroTokens />
      <Text position={[0, 0, 0]} fontSize={0.18} color="#FF4D6D" anchorX="center" anchorY="middle">Event Loop</Text>
    </Canvas>
  )
}
