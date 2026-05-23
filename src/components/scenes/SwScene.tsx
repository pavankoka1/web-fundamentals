'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const STATES = [
  { label: 'register', x: -4.0 },
  { label: 'installing', x: -2.0 },
  { label: 'waiting', x: 0.0 },
  { label: 'activating', x: 2.0 },
  { label: 'active', x: 4.0 },
]

function StateNode({ label, x, index }: { label: string; x: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 0.6, 0.1)), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const tokenPos = (t * 0.4) % (STATES.length - 1 + 0.5)
    const active = Math.abs(tokenPos - index) < 0.6
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = active ? 0.5 + Math.sin(t * 3) * 0.2 : 0.12
    mat.color.set(active ? '#0D1A1A' : '#0D0D1A')
  })
  return (
    <group position={[x, 0, 0]}>
      <mesh ref={ref}>
        <boxGeometry args={[1.5, 0.6, 0.1]} />
        <meshStandardMaterial color="#0D0D1A" emissive="#A5F3FC" emissiveIntensity={0.12} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#A5F3FC" transparent opacity={0.4} />
      </lineSegments>
      <Text position={[0, 0, 0.06]} fontSize={0.14} color="#A5F3FC" anchorX="center" anchorY="middle">{label}</Text>
    </group>
  )
}

function Token() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const pos = (t * 0.4) % (STATES.length - 1 + 0.5)
    const i = Math.min(Math.floor(pos), STATES.length - 2)
    const frac = pos - i
    const fromX = STATES[i].x
    const toX = STATES[i + 1]?.x ?? STATES[i].x
    ref.current.position.x = THREE.MathUtils.lerp(fromX, toX, Math.min(frac, 1))
    ref.current.position.y = 0.5 + Math.sin(t * 3) * 0.08
    ref.current.scale.setScalar(0.9 + Math.sin(t * 5) * 0.1)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.12, 12, 12]} />
      <meshStandardMaterial color="#A5F3FC" emissive="#A5F3FC" emissiveIntensity={6} />
    </mesh>
  )
}

function Connectors() {
  const geo = useMemo(() => {
    const pts: number[] = []
    for (let i = 0; i < STATES.length - 1; i++) {
      pts.push(STATES[i].x + 0.75, 0, 0, STATES[i + 1].x - 0.75, 0, 0)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  return <lineSegments geometry={geo}><lineBasicMaterial color="#1A2A1A" /></lineSegments>
}

function FetchIntercept() {
  const ref = useRef<THREE.Mesh>(null)
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute([4.0, -0.3, 0, 4.0, -1.5, 0, 2.5, -1.5, 0], 3))
    return g
  }, [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.x = THREE.MathUtils.lerp(4.0, 2.5, ((clock.getElapsedTime() * 0.5) % 1))
    ref.current.position.y = -1.5
    ref.current.scale.setScalar(0.9 + Math.sin(clock.getElapsedTime() * 4) * 0.1)
  })
  return (
    <>
      <line geometry={lineGeo}><lineBasicMaterial color="#A5F3FC" transparent opacity={0.4} /></line>
      <mesh ref={ref}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#A5F3FC" emissive="#A5F3FC" emissiveIntensity={5} />
      </mesh>
      <Text position={[3.5, -1.9, 0]} fontSize={0.12} color="#A5F3FC" anchorX="center" anchorY="middle">intercept fetch</Text>
      <Text position={[3.5, -2.2, 0]} fontSize={0.11} color="#4A4A6A" anchorX="center" anchorY="middle">cache / network</Text>
    </>
  )
}

export default function SwScene() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#A5F3FC" />
      {STATES.map((s, i) => <StateNode key={s.label} {...s} index={i} />)}
      <Connectors />
      <Token />
      <FetchIntercept />
      <Text position={[0, 1.5, 0]} fontSize={0.22} color="#A5F3FC" anchorX="center" anchorY="middle">Service Worker Lifecycle</Text>
    </Canvas>
  )
}
