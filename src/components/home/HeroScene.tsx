'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PHASE_COLORS_HEX = ['#00D4FF', '#4D9FFF', '#FFB340', '#FF4D6D', '#00E5A0']
const NODE_COUNT = 16
const ORBIT_RADII = [1.8, 2.8, 3.6, 4.2, 4.8]

function PipelineNode({ index, total }: { index: number; total: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringIndex = Math.floor(index / (total / 5))
  const color = PHASE_COLORS_HEX[Math.min(ringIndex, 4)]
  const angle = (index / total) * Math.PI * 2
  const radius = ORBIT_RADII[Math.min(ringIndex, 4)]
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  const speed = 0.12 + index * 0.003

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime() * speed
    const a = angle + t
    meshRef.current.position.x = Math.cos(a) * radius
    meshRef.current.position.z = Math.sin(a) * radius
    meshRef.current.position.y = Math.sin(t * 2) * 0.15
    const pulse = 0.8 + Math.sin(t * 3) * 0.2
    meshRef.current.scale.setScalar(pulse)
  })

  return (
    <mesh ref={meshRef} position={[x, 0, z]}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
    </mesh>
  )
}

function ConnectionLines() {
  const lineRef = useRef<THREE.LineSegments>(null)
  const positions = useMemo(() => {
    const pts: number[] = []
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle1 = (i / NODE_COUNT) * Math.PI * 2
      const r1 = ORBIT_RADII[Math.min(Math.floor(i / (NODE_COUNT / 5)), 4)]
      const angle2 = ((i + 1) / NODE_COUNT) * Math.PI * 2
      const r2 = ORBIT_RADII[Math.min(Math.floor((i + 1) / (NODE_COUNT / 5)), 4)]
      pts.push(Math.cos(angle1) * r1, 0, Math.sin(angle1) * r1)
      pts.push(Math.cos(angle2) * r2, 0, Math.sin(angle2) * r2)
    }
    return new Float32Array(pts)
  }, [])

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#1A1A40" transparent opacity={0.5} />
    </lineSegments>
  )
}

function Packet() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (clock.getElapsedTime() * 0.4) % 1
    const nodeIdx = Math.floor(t * NODE_COUNT)
    const nextIdx = (nodeIdx + 1) % NODE_COUNT
    const frac = (t * NODE_COUNT) % 1
    const a1 = (nodeIdx / NODE_COUNT) * Math.PI * 2
    const a2 = (nextIdx / NODE_COUNT) * Math.PI * 2
    const r1 = ORBIT_RADII[Math.min(Math.floor(nodeIdx / (NODE_COUNT / 5)), 4)]
    const r2 = ORBIT_RADII[Math.min(Math.floor(nextIdx / (NODE_COUNT / 5)), 4)]
    ref.current.position.x = THREE.MathUtils.lerp(Math.cos(a1) * r1, Math.cos(a2) * r2, frac)
    ref.current.position.z = THREE.MathUtils.lerp(Math.sin(a1) * r1, Math.sin(a2) * r2, frac)
    ref.current.position.y = Math.sin(frac * Math.PI) * 0.3
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.14, 16, 16]} />
      <meshStandardMaterial color="#ffffff" emissive="#00D4FF" emissiveIntensity={5} />
    </mesh>
  )
}

function GridPlane() {
  const ref = useRef<THREE.GridHelper>(null)
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0005
  })
  return <gridHelper ref={ref} args={[20, 20, '#0A0A20', '#0A0A20']} position={[0, -1, 0]} />
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })
  return (
    <group ref={groupRef}>
      <ConnectionLines />
      {Array.from({ length: NODE_COUNT }, (_, i) => (
        <PipelineNode key={i} index={i} total={NODE_COUNT} />
      ))}
      <Packet />
      <GridPlane />
    </group>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 4, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 0]} intensity={1.5} color="#00D4FF" />
      <pointLight position={[3, -2, 3]} intensity={0.8} color="#4D9FFF" />
      <pointLight position={[-3, -2, -3]} intensity={0.8} color="#00E5A0" />
      <Scene />
    </Canvas>
  )
}
