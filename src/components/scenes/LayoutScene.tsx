'use client'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const LAYERS = [
  { label: 'margin', color: '#6B7280', size: [5.5, 3.5], z: -0.04 },
  { label: 'border', color: '#67E8F9', size: [4.5, 2.8], z: -0.02 },
  { label: 'padding', color: '#A5F3FC', size: [3.5, 2.1], z: 0.0 },
  { label: 'content', color: '#A5F3FC', size: [2.2, 1.2], z: 0.02 },
]

function BoxLayer({ label, color, size, z, index }: { label: string; color: string; size: number[]; z: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const currentScale = useRef(0)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const target = 1
    const delay = index * 0.4
    const elapsed = Math.max(0, clock.getElapsedTime() - delay)
    currentScale.current = Math.min(1, elapsed * 0.8)
    ref.current.scale.setScalar(currentScale.current)
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.15 + Math.sin(clock.getElapsedTime() * 1.2 + index) * 0.05
  })
  return (
    <group position={[0, 0, z]}>
      <mesh ref={ref}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} transparent opacity={0.18} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(size[0], size[1])]} />
        <lineBasicMaterial color={color} transparent opacity={0.7} />
      </lineSegments>
      <Text
        position={[-size[0] / 2 + 0.1, size[1] / 2 - 0.12, 0.01]}
        fontSize={0.14}
        color={color}
        anchorX="left"
        anchorY="top"
      >
        {label}
      </Text>
    </group>
  )
}

function BoxModelArrows() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.02
  })
  return (
    <group ref={ref}>
      {/* dimension labels */}
      <Text position={[0, -2.1, 0.1]} fontSize={0.13} color="#6B7280" anchorX="center" anchorY="middle">margin: 24px</Text>
      <Text position={[0, -1.7, 0.1]} fontSize={0.13} color="#67E8F9" anchorX="center" anchorY="middle">border: 2px</Text>
      <Text position={[0, -1.3, 0.1]} fontSize={0.13} color="#A5F3FC" anchorX="center" anchorY="middle">padding: 16px</Text>
    </group>
  )
}

export default function LayoutScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#67E8F9" />
      {LAYERS.map((l, i) => <BoxLayer key={l.label} {...l} index={i} />)}
      <BoxModelArrows />
      <Text position={[0, 2.3, 0.1]} fontSize={0.22} color="#67E8F9" anchorX="center" anchorY="middle">CSS Box Model</Text>
    </Canvas>
  )
}
