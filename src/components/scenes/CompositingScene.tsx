'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const LAYERS = [
  { label: 'Layer 1 — background', sublabel: 'repaint on change', z: 0, color: '#FFB340', canRepaint: true },
  { label: 'Layer 2 — animated div', sublabel: 'GPU composite only', z: 0.6, color: '#00E5A0', canRepaint: false },
  { label: 'Layer 3 — overlay', sublabel: 'GPU composite only', z: 1.2, color: '#4D9FFF', canRepaint: false },
]

function GpuLayer({ label, sublabel, z, color, canRepaint, index }: { label: string; sublabel: string; z: number; color: string; canRepaint: boolean; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(4.5, 1.4, 0.08)), [])
  const repaintFlash = useRef(false)
  const slideX = useRef(0)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const mat = ref.current.material as THREE.MeshStandardMaterial

    if (index === 1) {
      // Layer 2 slides via transform
      slideX.current = Math.sin(t * 0.8) * 0.8
      ref.current.position.x = slideX.current
    }

    if (canRepaint) {
      // Layer 1 flashes red periodically
      const flash = Math.sin(t * 0.7) > 0.7
      mat.color.set(flash ? '#FF4D6D' : '#0D0D1A')
      mat.emissive.set(flash ? '#FF4D6D' : color)
      mat.emissiveIntensity = flash ? 0.6 : 0.15
    } else {
      mat.emissiveIntensity = 0.15 + Math.sin(t * 1.5 + index) * 0.05
    }
  })

  return (
    <group position={[0, (index - 1) * 1.8, z]}>
      <mesh ref={ref}>
        <boxGeometry args={[4.5, 1.4, 0.08]} />
        <meshStandardMaterial color="#0D0D1A" emissive={color} emissiveIntensity={0.15} transparent opacity={0.75} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </lineSegments>
      <Text position={[0, 0.2, 0.05]} fontSize={0.15} color={color} anchorX="center" anchorY="middle">{label}</Text>
      <Text position={[0, -0.18, 0.05]} fontSize={0.11} color="#4A4A6A" anchorX="center" anchorY="middle">{sublabel}</Text>
      {canRepaint && (
        <Text position={[2.8, 0.2, 0.05]} fontSize={0.11} color="#FF4D6D" anchorX="center" anchorY="middle">flash!</Text>
      )}
    </group>
  )
}

export default function CompositingScene() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#FFB340" />
      {LAYERS.map((l, i) => <GpuLayer key={l.label} {...l} index={i} />)}
      <Text position={[0, 2.5, 1.2]} fontSize={0.22} color="#FFB340" anchorX="center" anchorY="middle">GPU Compositing</Text>
    </Canvas>
  )
}
