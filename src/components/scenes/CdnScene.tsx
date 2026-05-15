'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const POPS = [
  { label: 'Europe', sublabel: 'PoP · Amsterdam', x: -3.5, y: 0.5 },
  { label: 'US-West', sublabel: 'PoP · San Jose', x: 0, y: 0.5 },
  { label: 'Asia', sublabel: 'PoP · Singapore', x: 3.5, y: 0.5 },
]

const ORIGIN = { label: 'Origin', sublabel: 'us-east-1', x: 0, y: 2.8 }
const USER = { label: 'User', sublabel: 'browser', x: 0, y: -2.2 }
const NEAREST_POP = 1 // US-West

function ServerNode({ label, sublabel, x, y, color, isOrigin = false }: { label: string; sublabel: string; x: number; y: number; color: string; isOrigin?: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(isOrigin ? 1.6 : 1.3, 0.65, 0.1)), [isOrigin])
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.15 + Math.sin(clock.getElapsedTime() * 1.2 + x) * 0.05
    }
  })
  return (
    <group position={[x, y, 0]}>
      <mesh ref={ref}>
        <boxGeometry args={[isOrigin ? 1.6 : 1.3, 0.65, 0.1]} />
        <meshStandardMaterial color="#0D0D1A" emissive={color} emissiveIntensity={0.15} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </lineSegments>
      <Text position={[0, 0.1, 0.06]} fontSize={0.14} color={color} anchorX="center" anchorY="middle">{label}</Text>
      <Text position={[0, -0.14, 0.06]} fontSize={0.1} color="#4A4A6A" anchorX="center" anchorY="middle">{sublabel}</Text>
    </group>
  )
}

function UserNode() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(0.95 + Math.sin(clock.getElapsedTime() * 2) * 0.05)
  })
  return (
    <group position={[USER.x, USER.y, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#0D0D1A" emissive="#00E5A0" emissiveIntensity={0.4} />
      </mesh>
      <Text position={[0, 0.55, 0]} fontSize={0.14} color="#00E5A0" anchorX="center" anchorY="middle">User</Text>
    </group>
  )
}

function ConnectionLines() {
  const solidGeo = useMemo(() => {
    // User → nearest PoP (US-West)
    const pts: number[] = [
      USER.x, USER.y, 0,
      POPS[NEAREST_POP].x, POPS[NEAREST_POP].y, 0,
    ]
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])

  const dashedPts = useMemo(() => {
    // Origin → all PoPs (dashed feel via low opacity)
    const pts: number[] = []
    POPS.forEach(pop => {
      pts.push(ORIGIN.x, ORIGIN.y, 0, pop.x, pop.y, 0)
    })
    return pts
  }, [])

  const dashedGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(dashedPts, 3))
    return g
  }, [dashedPts])

  const faintGeo = useMemo(() => {
    // User → non-nearest PoPs (faint)
    const pts: number[] = []
    POPS.forEach((pop, i) => {
      if (i !== NEAREST_POP) pts.push(USER.x, USER.y, 0, pop.x, pop.y, 0)
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])

  return (
    <>
      <line geometry={solidGeo}>
        <lineBasicMaterial color="#00E5A0" transparent opacity={0.8} />
      </line>
      <lineSegments geometry={dashedGeo}>
        <lineBasicMaterial color="#4A4A6A" transparent opacity={0.35} />
      </lineSegments>
      <lineSegments geometry={faintGeo}>
        <lineBasicMaterial color="#1A1A40" transparent opacity={0.2} />
      </lineSegments>
    </>
  )
}

function Packet() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (clock.getElapsedTime() * 0.5) % 1
    const from = new THREE.Vector3(USER.x, USER.y, 0)
    const to = new THREE.Vector3(POPS[NEAREST_POP].x, POPS[NEAREST_POP].y, 0)
    ref.current.position.lerpVectors(from, to, t)
    ref.current.scale.setScalar(0.9 + Math.sin(clock.getElapsedTime() * 4) * 0.1)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 12, 12]} />
      <meshStandardMaterial color="#00E5A0" emissive="#00E5A0" emissiveIntensity={6} />
    </mesh>
  )
}

export default function CdnScene() {
  return (
    <Canvas camera={{ position: [0, 0.5, 9], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#00E5A0" />
      <ServerNode label={ORIGIN.label} sublabel={ORIGIN.sublabel} x={ORIGIN.x} y={ORIGIN.y} color="#4D9FFF" isOrigin />
      {POPS.map((p, i) => (
        <ServerNode key={p.label} {...p} color={i === NEAREST_POP ? '#00E5A0' : '#4A4A6A'} />
      ))}
      <UserNode />
      <ConnectionLines />
      <Packet />
      <Text position={[POPS[NEAREST_POP].x + 1.6, POPS[NEAREST_POP].y, 0]} fontSize={0.11} color="#00E5A0" anchorX="left" anchorY="middle">nearest</Text>
      <Text position={[0, 3.4, 0]} fontSize={0.22} color="#00E5A0" anchorX="center" anchorY="middle">CDN Architecture</Text>
    </Canvas>
  )
}
