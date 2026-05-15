'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const PACKETS = [
  { label: 'SYN', color: '#00D4FF', fromX: -2.5, toX: 2.5, yBase: 1.4, offset: 0 },
  { label: 'SYN-ACK', color: '#4D9FFF', fromX: 2.5, toX: -2.5, yBase: 0, offset: 0.33 },
  { label: 'ACK', color: '#00E5A0', fromX: -2.5, toX: 2.5, yBase: -1.4, offset: 0.66 },
]

function Column({ x, label }: { x: number; label: string }) {
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, 0.6, 0.12)), [])
  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.6, 0.12]} />
        <meshStandardMaterial color="#0D0D1A" emissive="#00D4FF" emissiveIntensity={0.2} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#00D4FF" transparent opacity={0.5} />
      </lineSegments>
      <Text position={[0, 0, 0.07]} fontSize={0.18} color="#00D4FF" anchorX="center" anchorY="middle">{label}</Text>
      <mesh position={[0, -1.8, 0]}>
        <boxGeometry args={[0.04, 3.0, 0.01]} />
        <meshStandardMaterial color="#00D4FF" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

function Packet({ label, color, fromX, toX, yBase, offset }: { label: string; color: string; fromX: number; toX: number; yBase: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const labelRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.3 + offset) % 1
    const x = THREE.MathUtils.lerp(fromX, toX, t)
    const y = yBase + (toX > fromX ? -t * 0.8 : t * 0.8)
    if (ref.current) {
      ref.current.position.x = x
      ref.current.position.y = y
    }
    if (labelRef.current) {
      labelRef.current.position.x = x
      labelRef.current.position.y = y + 0.22
    }
  })
  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
      </mesh>
      <group ref={labelRef}>
        <Text fontSize={0.13} color={color} anchorX="center" anchorY="middle">{label}</Text>
      </group>
    </>
  )
}

export default function TcpScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#00D4FF" />
      <Column x={-2.5} label="Client" />
      <Column x={2.5} label="Server" />
      {PACKETS.map(p => <Packet key={p.label} {...p} />)}
      <Text position={[0, 2.2, 0]} fontSize={0.2} color="#00D4FF" anchorX="center" anchorY="middle">TCP 3-Way Handshake</Text>
    </Canvas>
  )
}
