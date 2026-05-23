'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const PIPELINE = [
  { label: 'Source', sublabel: 'JS text', x: -4.5, color: '#FF6B6B' },
  { label: 'AST', sublabel: 'parse', x: -1.5, color: '#FF6B6B' },
  { label: 'Ignition', sublabel: 'bytecode', x: 1.5, color: '#FF6B6B' },
  { label: 'TurboFan', sublabel: 'machine code', x: 4.5, color: '#FF6B6B' },
]

function PipelineNode({ label, sublabel, x, color, index }: { label: string; sublabel: string; x: number; color: string; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6, 0.9, 0.1)), [])
  const isHot = index === 3

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const mat = ref.current.material as THREE.MeshStandardMaterial
    if (isHot) {
      mat.emissiveIntensity = 0.3 + Math.sin(t * 3) * 0.2
    } else {
      mat.emissiveIntensity = 0.15 + Math.sin(t * 1.2 + index) * 0.05
    }
  })

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={ref}>
        <boxGeometry args={[1.6, 0.9, 0.1]} />
        <meshStandardMaterial color="#0D0D1A" emissive={color} emissiveIntensity={0.15} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </lineSegments>
      <Text position={[0, 0.14, 0.06]} fontSize={0.15} color={color} anchorX="center" anchorY="middle">{label}</Text>
      <Text position={[0, -0.12, 0.06]} fontSize={0.1} color="#4A4A6A" anchorX="center" anchorY="middle">{sublabel}</Text>
      {isHot && (
        <Text position={[0, 0.7, 0.06]} fontSize={0.14} color="#67E8F9" anchorX="center" anchorY="middle">🔥 hot!</Text>
      )}
    </group>
  )
}

function Packet() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (clock.getElapsedTime() * 0.35) % 1
    ref.current.position.x = THREE.MathUtils.lerp(-5, 5, t)
    ref.current.scale.setScalar(0.9 + Math.sin(clock.getElapsedTime() * 5) * 0.1)
  })
  return (
    <mesh ref={ref} position={[-5, 0.6, 0]}>
      <sphereGeometry args={[0.1, 12, 12]} />
      <meshStandardMaterial color="#FF6B6B" emissive="#FF6B6B" emissiveIntensity={5} />
    </mesh>
  )
}

function DeoptPath() {
  const ref = useRef<THREE.Group>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute([4.5, -0.45, 0, 1.5, -0.45, 0], 3))
    return g
  }, [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const show = Math.sin(t * 0.5) > 0.5
    ref.current.visible = show
  })
  return (
    <group ref={ref}>
      <line geometry={geo}>
        <lineBasicMaterial color="#FF6B6B" transparent opacity={0.6} />
      </line>
      <mesh position={[3, -0.9, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial color="#FF6B6B" emissive="#FF6B6B" emissiveIntensity={4} />
      </mesh>
      <Text position={[3, -1.2, 0]} fontSize={0.12} color="#FF6B6B" anchorX="center" anchorY="middle">deopt</Text>
    </group>
  )
}

function Connectors() {
  const geo = useMemo(() => {
    const pts: number[] = []
    for (let i = 0; i < PIPELINE.length - 1; i++) {
      pts.push(PIPELINE[i].x + 0.8, 0, 0, PIPELINE[i + 1].x - 0.8, 0, 0)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  return <lineSegments geometry={geo}><lineBasicMaterial color="#1A0A10" /></lineSegments>
}

export default function V8Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#FF6B6B" />
      {PIPELINE.map((p, i) => <PipelineNode key={p.label} {...p} index={i} />)}
      <Connectors />
      <Packet />
      <DeoptPath />
      <Text position={[0, 2.0, 0]} fontSize={0.22} color="#FF6B6B" anchorX="center" anchorY="middle">V8 Compilation Pipeline</Text>
    </Canvas>
  )
}
