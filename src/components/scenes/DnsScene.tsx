'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const NODES = [
  { label: 'Browser', sublabel: 'memory cache', x: -4 },
  { label: 'OS Resolver', sublabel: '/etc/hosts', x: -2 },
  { label: 'Recursive NS', sublabel: '8.8.8.8', x: 0 },
  { label: 'Root + TLD', sublabel: 'root-servers.net', x: 2 },
  { label: 'Auth NS', sublabel: 'A record', x: 4 },
]

function Node({ label, sublabel, x }: { label: string; sublabel: string; x: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 0.85, 0.12)), [])
  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.scale.setScalar(0.95 + Math.sin(clock.getElapsedTime() * 1.2 + x) * 0.04)
  })
  return (
    <group position={[x, 0, 0]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 0.85, 0.12]} />
        <meshStandardMaterial color="#0D0D1A" emissive="#00D4FF" emissiveIntensity={0.12} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#00D4FF" transparent opacity={0.4} />
      </lineSegments>
      <Text position={[0, 0.14, 0.07]} fontSize={0.15} color="#00D4FF" anchorX="center" anchorY="middle">{label}</Text>
      <Text position={[0, -0.1, 0.07]} fontSize={0.1} color="#4A4A6A" anchorX="center" anchorY="middle">{sublabel}</Text>
    </group>
  )
}

function Packet({ isMiss }: { isMiss: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const color = isMiss ? '#FF4D6D' : '#00E5A0'
  const yOff = isMiss ? 0.65 : -0.65
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = ((clock.getElapsedTime() * 0.45) + (isMiss ? 0 : 0.5)) % 1
    const fromX = isMiss ? -4.5 : 4.5
    const toX = isMiss ? 4.5 : -4.5
    ref.current.position.x = THREE.MathUtils.lerp(fromX, toX, t)
    ref.current.position.y = yOff
    ref.current.scale.setScalar(0.8 + Math.sin(clock.getElapsedTime() * 4) * 0.15)
  })
  return (
    <mesh ref={ref} position={[-4.5, yOff, 0]}>
      <sphereGeometry args={[0.1, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
    </mesh>
  )
}

function Connectors() {
  const geo = useMemo(() => {
    const pts: number[] = []
    for (let i = 0; i < NODES.length - 1; i++) {
      pts.push(NODES[i].x + 0.75, 0, 0, NODES[i + 1].x - 0.75, 0, 0)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#1A1A40" />
    </lineSegments>
  )
}

export default function DnsScene() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={1.5} color="#00D4FF" />
      {NODES.map(n => <Node key={n.label} {...n} />)}
      <Connectors />
      <Packet isMiss={true} />
      <Packet isMiss={false} />
      <Text position={[0, 1.1, 0]} fontSize={0.12} color="#FF4D6D" anchorX="center" anchorY="middle">cache miss →</Text>
      <Text position={[0, -1.1, 0]} fontSize={0.12} color="#00E5A0" anchorX="center" anchorY="middle">← cache hit</Text>
    </Canvas>
  )
}
