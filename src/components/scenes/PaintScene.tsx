'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const COMMANDS = ['drawRect()', 'fillText()', 'drawImage()', 'setClip()', 'strokeRect()']
const TILES = [
  { x: 3.5, y: 1.0 }, { x: 4.2, y: 1.0 }, { x: 4.9, y: 1.0 },
  { x: 3.5, y: 0.2 }, { x: 4.2, y: 0.2 }, { x: 4.9, y: 0.2 },
  { x: 3.5, y: -0.6 }, { x: 4.2, y: -0.6 }, { x: 4.9, y: -0.6 },
]

function RenderNode() {
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.3, 1.8, 0.1)), [])
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.15 + Math.sin(clock.getElapsedTime() * 1.5) * 0.05
    }
  })
  return (
    <group position={[-4, 0, 0]}>
      <mesh ref={ref}>
        <boxGeometry args={[1.3, 1.8, 0.1]} />
        <meshStandardMaterial color="#0D0D1A" emissive="#67E8F9" emissiveIntensity={0.15} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#67E8F9" transparent opacity={0.5} />
      </lineSegments>
      <Text position={[0, 0.3, 0.06]} fontSize={0.14} color="#67E8F9" anchorX="center" anchorY="middle">Render</Text>
      <Text position={[0, 0.0, 0.06]} fontSize={0.14} color="#67E8F9" anchorX="center" anchorY="middle">Tree</Text>
      <Text position={[0, -0.3, 0.06]} fontSize={0.11} color="#4A4A6A" anchorX="center" anchorY="middle">Node</Text>
    </group>
  )
}

function DisplayList() {
  const commandRefs = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    COMMANDS.forEach((_, i) => {
      const g = commandRefs.current[i]
      if (!g) return
      const phase = (t * 0.6 + i * 0.2) % 1
      g.visible = phase < 0.85
      const child = g.children[0] as THREE.Mesh
      if (child && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = 0.2 + Math.sin(t * 3 + i) * 0.1
      }
    })
  })
  return (
    <group position={[0, 0, 0]}>
      <Text position={[0, 1.6, 0]} fontSize={0.15} color="#67E8F9" anchorX="center" anchorY="middle">Display List</Text>
      {COMMANDS.map((cmd, i) => (
        <group key={i} ref={el => { commandRefs.current[i] = el }} position={[0, 0.8 - i * 0.5, 0]}>
          <mesh>
            <boxGeometry args={[1.8, 0.35, 0.08]} />
            <meshStandardMaterial color="#0D0D1A" emissive="#67E8F9" emissiveIntensity={0.2} transparent opacity={0.8} />
          </mesh>
          <Text position={[0, 0, 0.05]} fontSize={0.12} color="#67E8F9" anchorX="center" anchorY="middle">{cmd}</Text>
        </group>
      ))}
    </group>
  )
}

function GpuTile({ x, y, index }: { x: number; y: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const phase = (t * 0.4 + index * 0.11) % 1
    const mat = ref.current.material as THREE.MeshStandardMaterial
    const rasterized = phase > 0.3
    mat.color.set(rasterized ? '#67E8F9' : '#0D0D1A')
    mat.emissive.set(rasterized ? '#67E8F9' : '#111')
    mat.emissiveIntensity = rasterized ? 0.3 + Math.sin(t * 2 + index) * 0.1 : 0.05
    mat.opacity = rasterized ? 0.7 : 0.3
  })
  return (
    <mesh ref={ref} position={[x, y, 0]}>
      <boxGeometry args={[0.55, 0.55, 0.06]} />
      <meshStandardMaterial color="#0D0D1A" transparent opacity={0.3} />
    </mesh>
  )
}

function Arrows() {
  const geo1 = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute([-3.35, 0, 0, -1.0, 0, 0], 3))
    return g
  }, [])
  const geo2 = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute([1.0, 0, 0, 2.8, 0, 0], 3))
    return g
  }, [])
  return (
    <>
      <line geometry={geo1}><lineBasicMaterial color="#67E8F9" transparent opacity={0.4} /></line>
      <line geometry={geo2}><lineBasicMaterial color="#67E8F9" transparent opacity={0.4} /></line>
    </>
  )
}

export default function PaintScene() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#67E8F9" />
      <RenderNode />
      <DisplayList />
      <Arrows />
      {TILES.map((t, i) => <GpuTile key={i} {...t} index={i} />)}
      <Text position={[4.2, 1.7, 0]} fontSize={0.14} color="#67E8F9" anchorX="center" anchorY="middle">GPU Tiles</Text>
    </Canvas>
  )
}
