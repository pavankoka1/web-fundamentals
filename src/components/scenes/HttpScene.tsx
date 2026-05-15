'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function RequestBox() {
  const ref = useRef<THREE.Mesh>(null)
  const labelRef = useRef<THREE.Group>(null)
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6, 0.5, 0.1)), [])
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.35) % 1
    const x = THREE.MathUtils.lerp(-4, 4, t)
    if (ref.current) ref.current.position.x = x
    if (labelRef.current) labelRef.current.position.x = x
  })
  return (
    <>
      <mesh ref={ref} position={[-4, 0.6, 0]}>
        <boxGeometry args={[1.6, 0.5, 0.1]} />
        <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.4} transparent opacity={0.8} />
      </mesh>
      <group ref={labelRef} position={[-4, 1.05, 0]}>
        <Text fontSize={0.14} color="#00D4FF" anchorX="center" anchorY="middle">GET /users/torvalds</Text>
      </group>
    </>
  )
}

function ResponseBox() {
  const ref = useRef<THREE.Mesh>(null)
  const labelRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = ((clock.getElapsedTime() * 0.35) + 0.5) % 1
    const x = THREE.MathUtils.lerp(4, -4, t)
    if (ref.current) ref.current.position.x = x
    if (labelRef.current) labelRef.current.position.x = x
  })
  return (
    <>
      <mesh ref={ref} position={[4, -0.6, 0]}>
        <boxGeometry args={[1.4, 0.5, 0.1]} />
        <meshStandardMaterial color="#4D9FFF" emissive="#4D9FFF" emissiveIntensity={0.4} transparent opacity={0.8} />
      </mesh>
      <group ref={labelRef} position={[4, -1.05, 0]}>
        <Text fontSize={0.14} color="#4D9FFF" anchorX="center" anchorY="middle">200 OK</Text>
      </group>
    </>
  )
}

function Arrow({ y, color, dir }: { y: number; color: string; dir: 1 | -1 }) {
  const geo = useMemo(() => {
    const pts: number[] = [-4, y, 0, 4, y, 0]
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [y])
  return (
    <line geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={0.2} />
    </line>
  )
}

function Endpoint({ x, label }: { x: number; label: string }) {
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, 0.7, 0.1)), [])
  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.7, 0.1]} />
        <meshStandardMaterial color="#0D0D1A" emissive="#00D4FF" emissiveIntensity={0.15} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#00D4FF" transparent opacity={0.5} />
      </lineSegments>
      <Text position={[0, 0, 0.06]} fontSize={0.16} color="#00D4FF" anchorX="center" anchorY="middle">{label}</Text>
    </group>
  )
}

export default function HttpScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#00D4FF" />
      <Endpoint x={-4.5} label="Browser" />
      <Endpoint x={4.5} label="Server" />
      <Arrow y={0.6} color="#00D4FF" dir={1} />
      <Arrow y={-0.6} color="#4D9FFF" dir={-1} />
      <RequestBox />
      <ResponseBox />
      <Text position={[0, 2.2, 0]} fontSize={0.2} color="#00D4FF" anchorX="center" anchorY="middle">HTTP Request / Response</Text>
    </Canvas>
  )
}
