'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const PACKETS = [
  { label: 'ClientHello', color: '#FFB340', fromX: -2.5, toX: 2.5, yBase: 1.3, offset: 0 },
  { label: 'ServerHello+Cert', color: '#4D9FFF', fromX: 2.5, toX: -2.5, yBase: 0, offset: 0.33 },
  { label: 'Finished', color: '#00E5A0', fromX: -2.5, toX: 2.5, yBase: -1.3, offset: 0.66 },
]

function Column({ x, label }: { x: number; label: string }) {
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.3, 0.6, 0.12)), [])
  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.3, 0.6, 0.12]} />
        <meshStandardMaterial color="#0D0D1A" emissive="#FFB340" emissiveIntensity={0.2} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#FFB340" transparent opacity={0.5} />
      </lineSegments>
      <Text position={[0, 0, 0.07]} fontSize={0.16} color="#FFB340" anchorX="center" anchorY="middle">{label}</Text>
      <mesh position={[0, -1.8, 0]}>
        <boxGeometry args={[0.04, 3.0, 0.01]} />
        <meshStandardMaterial color="#FFB340" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

function Packet({ label, color, fromX, toX, yBase, offset }: { label: string; color: string; fromX: number; toX: number; yBase: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const labelRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.28 + offset) % 1
    const x = THREE.MathUtils.lerp(fromX, toX, t)
    const y = yBase + (toX > fromX ? -t * 0.7 : t * 0.7)
    if (ref.current) { ref.current.position.x = x; ref.current.position.y = y }
    if (labelRef.current) { labelRef.current.position.x = x; labelRef.current.position.y = y + 0.22 }
  })
  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
      </mesh>
      <group ref={labelRef}>
        <Text fontSize={0.12} color={color} anchorX="center" anchorY="middle">{label}</Text>
      </group>
    </>
  )
}

function LockIcon() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const phase = (t * 0.28 + 0.66) % 1
    ref.current.visible = phase > 0.7
    ref.current.scale.setScalar(0.8 + Math.sin(t * 2) * 0.1)
  })
  return (
    <group ref={ref} position={[0, -1.3, 0]}>
      <Text fontSize={0.4} color="#00E5A0" anchorX="center" anchorY="middle">🔒</Text>
      <Text position={[0, -0.4, 0]} fontSize={0.13} color="#00E5A0" anchorX="center" anchorY="middle">Encrypted</Text>
    </group>
  )
}

export default function TlsScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#FFB340" />
      <Column x={-2.5} label="Client" />
      <Column x={2.5} label="Server" />
      {PACKETS.map(p => <Packet key={p.label} {...p} />)}
      <LockIcon />
      <Text position={[0, 2.2, 0]} fontSize={0.2} color="#FFB340" anchorX="center" anchorY="middle">TLS Handshake</Text>
    </Canvas>
  )
}
