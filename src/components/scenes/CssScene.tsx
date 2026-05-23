'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const RULES = [
  { selector: 'p', specificity: 0.1, color: '#4A4A6A', label: 'element', score: '001' },
  { selector: '.card p', specificity: 0.55, color: '#A5F3FC', label: 'class+element', score: '011' },
  { selector: '#hero .card p', specificity: 1.0, color: '#7DD3FC', label: 'id+class+el', score: '111' },
]

function Rule({ selector, specificity, color, label, score, y }: { selector: string; specificity: number; color: string; label: string; score: string; y: number }) {
  const barRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const currentW = useRef(0)
  const maxW = 3.5
  const isWinner = specificity === 1.0

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const targetW = specificity * maxW
    currentW.current = THREE.MathUtils.lerp(currentW.current, targetW, 0.03)
    if (barRef.current) {
      barRef.current.scale.x = currentW.current / maxW
      barRef.current.position.x = -maxW / 2 + currentW.current / 2
      const mat = barRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = isWinner ? 0.5 + Math.sin(t * 2) * 0.3 : 0.2
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(isWinner ? 1.02 + Math.sin(t * 2) * 0.02 : 1)
    }
  })

  return (
    <group position={[0, y, 0]}>
      {/* background track */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[maxW, 0.22, 0.05]} />
        <meshStandardMaterial color="#0D0D1A" transparent opacity={0.6} />
      </mesh>
      {/* specificity bar */}
      <mesh ref={barRef} position={[-maxW / 2, 0, 0.03]}>
        <boxGeometry args={[maxW, 0.22, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* labels */}
      <Text position={[-maxW / 2 - 1.8, 0, 0]} fontSize={0.13} color={color} anchorX="center" anchorY="middle">{selector}</Text>
      <Text position={[maxW / 2 + 0.5, 0, 0]} fontSize={0.13} color={color} anchorX="center" anchorY="middle">{score}</Text>
      <Text position={[0, -0.28, 0]} fontSize={0.1} color="#4A4A6A" anchorX="center" anchorY="middle">{label}</Text>
      {isWinner && (
        <Text position={[maxW / 2 + 1.2, 0.25, 0]} fontSize={0.13} color="#A5F3FC" anchorX="center" anchorY="middle">WINS</Text>
      )}
    </group>
  )
}

export default function CssScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#A5F3FC" />
      <Text position={[0, 2.0, 0]} fontSize={0.22} color="#A5F3FC" anchorX="center" anchorY="middle">CSS Specificity Cascade</Text>
      {RULES.map((r, i) => <Rule key={r.selector} {...r} y={0.7 - i * 0.9} />)}
      <Text position={[-1.75, -1.6, 0]} fontSize={0.12} color="#4A4A6A" anchorX="center" anchorY="middle">selector</Text>
      <Text position={[2.25, -1.6, 0]} fontSize={0.12} color="#4A4A6A" anchorX="center" anchorY="middle">score</Text>
    </Canvas>
  )
}
