'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const NODES = [
  { label: 'Request', x: -4.0, y: 0, id: 'req' },
  { label: 'Cache?', x: -1.8, y: 0, id: 'check', diamond: true },
  { label: '304 Not\nModified', x: 0.5, y: 1.5, id: 'hit', color: '#A5F3FC' },
  { label: 'Expired?', x: 0.5, y: 0, id: 'exp', diamond: true },
  { label: 'Revalidate', x: 2.8, y: 1.0, id: 'reval', color: '#A5F3FC' },
  { label: 'Full 200\nFetch', x: 2.8, y: -1.0, id: 'fetch', color: '#FF6B6B' },
]

function FlowNode({ label, x, y, diamond = false, color = '#A5F3FC' }: { label: string; x: number; y: number; diamond?: boolean; color?: string }) {
  const ref = useRef<THREE.Mesh>(null)
  const edgeGeo = useMemo(() => {
    if (diamond) return new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, 1.2, 0.08))
    return new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 0.7, 0.08))
  }, [diamond])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.15 + Math.sin(clock.getElapsedTime() * 1.5 + x) * 0.08
  })

  return (
    <group position={[x, y, 0]} rotation={diamond ? [0, 0, Math.PI / 4] : [0, 0, 0]}>
      <mesh ref={ref}>
        {diamond ? <boxGeometry args={[1.2, 1.2, 0.08]} /> : <boxGeometry args={[1.5, 0.7, 0.08]} />}
        <meshStandardMaterial color="#0D0D1A" emissive={color} emissiveIntensity={0.15} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </lineSegments>
      <group rotation={diamond ? [0, 0, -Math.PI / 4] : [0, 0, 0]}>
        <Text position={[0, 0, 0.05]} fontSize={0.13} color={color} anchorX="center" anchorY="middle">{label}</Text>
      </group>
    </group>
  )
}

function FlowPacket({ path }: { path: 'hit' | 'miss' }) {
  const ref = useRef<THREE.Mesh>(null)
  const color = path === 'hit' ? '#A5F3FC' : '#FF6B6B'

  const waypoints = useMemo(() => {
    if (path === 'hit') {
      return [
        new THREE.Vector3(-4.0, 0, 0),
        new THREE.Vector3(-1.8, 0, 0),
        new THREE.Vector3(0.5, 1.5, 0),
      ]
    }
    return [
      new THREE.Vector3(-4.0, 0, 0),
      new THREE.Vector3(-1.8, 0, 0),
      new THREE.Vector3(0.5, 0, 0),
      new THREE.Vector3(2.8, -1.0, 0),
    ]
  }, [path])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const offset = path === 'hit' ? 0 : 0.5
    const t = ((clock.getElapsedTime() * 0.3) + offset) % 1
    const segCount = waypoints.length - 1
    const seg = Math.min(Math.floor(t * segCount), segCount - 1)
    const segT = (t * segCount) % 1
    const pos = new THREE.Vector3().lerpVectors(waypoints[seg], waypoints[seg + 1], segT)
    ref.current.position.copy(pos)
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={6} />
    </mesh>
  )
}

function FlowEdges() {
  const geo = useMemo(() => {
    const pts: number[] = [
      -4.0, 0, 0, -1.8, 0, 0,
      -1.8, 0, 0, 0.5, 1.5, 0,
      -1.8, 0, 0, 0.5, 0, 0,
      0.5, 0, 0, 2.8, 1.0, 0,
      0.5, 0, 0, 2.8, -1.0, 0,
    ]
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

export default function CacheScene() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#A5F3FC" />
      {NODES.map(n => <FlowNode key={n.id} {...n} color={n.color ?? '#A5F3FC'} />)}
      <FlowEdges />
      <FlowPacket path="hit" />
      <FlowPacket path="miss" />
      <Text position={[0, 2.5, 0]} fontSize={0.22} color="#A5F3FC" anchorX="center" anchorY="middle">Cache Decision Flow</Text>
      <Text position={[-1.0, 0.6, 0]} fontSize={0.11} color="#A5F3FC" anchorX="center" anchorY="middle">yes</Text>
      <Text position={[-0.6, -0.5, 0]} fontSize={0.11} color="#FF6B6B" anchorX="center" anchorY="middle">no</Text>
    </Canvas>
  )
}
