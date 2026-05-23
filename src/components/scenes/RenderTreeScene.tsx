'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const DOM_NODES = [
  { label: 'html', x: -4.5, y: 1.2 },
  { label: 'body', x: -4.5, y: 0.3 },
  { label: 'div', x: -5, y: -0.6 },
  { label: 'p (display:none)', x: -4, y: -0.6, hidden: true },
  { label: 'span', x: -5, y: -1.5 },
]

const CSSOM_NODES = [
  { label: 'html {}', x: -1.5, y: 1.2 },
  { label: 'body {}', x: -1.5, y: 0.3 },
  { label: 'div {}', x: -1.5, y: -0.6 },
]

const RENDER_NODES = [
  { label: 'html', x: 3, y: 1.2 },
  { label: 'body', x: 3, y: 0.3 },
  { label: 'div', x: 3, y: -0.6 },
  { label: 'span', x: 3, y: -1.5 },
]

function TreeNode({ label, x, y, hidden = false, color }: { label: string; x: number; y: number; hidden?: boolean; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 0.38, 0.08)), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    if (hidden) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.3
      mat.opacity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2
    }
  })
  return (
    <group position={[x, y, 0]}>
      <mesh ref={ref}>
        <boxGeometry args={[1.5, 0.38, 0.08]} />
        <meshStandardMaterial
          color={hidden ? '#FF6B6B' : '#0D0D1A'}
          emissive={hidden ? '#FF6B6B' : color}
          emissiveIntensity={hidden ? 0.5 : 0.15}
          transparent
          opacity={hidden ? 0.7 : 0.9}
        />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={hidden ? '#FF6B6B' : color} transparent opacity={0.4} />
      </lineSegments>
      <Text position={[0, 0, 0.05]} fontSize={0.11} color={hidden ? '#FF6B6B' : color} anchorX="center" anchorY="middle">{label}</Text>
    </group>
  )
}

function MergeArrow() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.x = 0.9 + Math.sin(clock.getElapsedTime() * 2) * 0.1
  })
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1.0, 0, 0, 1.4, 0, 0], 3))
    return g
  }, [])
  return (
    <group position={[0.2, 0, 0]}>
      <line geometry={geo}>
        <lineBasicMaterial color="#67E8F9" />
      </line>
      <Text position={[0, 0.35, 0]} fontSize={0.13} color="#67E8F9" anchorX="center" anchorY="middle">merge</Text>
      <mesh ref={ref} position={[1.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color="#67E8F9" emissive="#67E8F9" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function HiddenLabel() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.visible = Math.sin(clock.getElapsedTime() * 1.5) > 0
  })
  return (
    <group ref={ref} position={[-4, -0.6, 0.2]}>
      <Text position={[0, 0.5, 0]} fontSize={0.11} color="#FF6B6B" anchorX="center" anchorY="middle">omitted!</Text>
    </group>
  )
}

export default function RenderTreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#67E8F9" />
      {DOM_NODES.map(n => <TreeNode key={n.label} {...n} color="#A5F3FC" />)}
      {CSSOM_NODES.map(n => <TreeNode key={n.label} {...n} color="#A5F3FC" />)}
      {RENDER_NODES.map(n => <TreeNode key={n.label} {...n} color="#67E8F9" />)}
      <MergeArrow />
      <HiddenLabel />
      <Text position={[-4.5, 2.0, 0]} fontSize={0.18} color="#A5F3FC" anchorX="center" anchorY="middle">DOM</Text>
      <Text position={[-1.5, 2.0, 0]} fontSize={0.18} color="#A5F3FC" anchorX="center" anchorY="middle">CSSOM</Text>
      <Text position={[3.0, 2.0, 0]} fontSize={0.18} color="#67E8F9" anchorX="center" anchorY="middle">Render Tree</Text>
    </Canvas>
  )
}
