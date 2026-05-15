'use client'
import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const SEGMENTS = [
  { label: 'https', color: '#00D4FF', spreadX: -3.2, sublabel: 'scheme' },
  { label: '://api.github.com', color: '#4D9FFF', spreadX: -1.0, sublabel: 'host' },
  { label: '/users/torvalds', color: '#F0F0FF', spreadX: 1.2, sublabel: 'path' },
  { label: '?tab=repos', color: '#FFB340', spreadX: 3.0, sublabel: 'query' },
  { label: '#about', color: '#6B7280', spreadX: 4.4, sublabel: 'fragment' },
]

function Segment({ label, color, targetX, index, sublabel }: { label: string; color: string; targetX: number; index: number; sublabel: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const posX = useRef(0)
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    posX.current = THREE.MathUtils.lerp(posX.current, targetX, 0.025)
    groupRef.current.position.x = posX.current
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.7 + index * 1.2) * 0.12
  })
  const w = Math.max(label.length * 0.11, 0.8)
  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[w, 0.44, 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
      <Text position={[0, 0, 0.08]} fontSize={0.13} color="#000000" anchorX="center" anchorY="middle">
        {label}
      </Text>
      <Text position={[0, -0.45, 0]} fontSize={0.1} color={color} anchorX="center" anchorY="middle">
        {sublabel}
      </Text>
    </group>
  )
}

function SceneContent() {
  const [spread, setSpread] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSpread(true), 1200)
    return () => clearTimeout(t)
  }, [])
  return (
    <>
      {SEGMENTS.map((s, i) => (
        <Segment key={i} label={s.label} color={s.color} targetX={spread ? s.spreadX - 0.6 : 0} index={i} sublabel={s.sublabel} />
      ))}
    </>
  )
}

export default function UrlScene() {
  return (
    <Canvas camera={{ position: [0, 0.5, 7], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#00D4FF" />
      <SceneContent />
    </Canvas>
  )
}
