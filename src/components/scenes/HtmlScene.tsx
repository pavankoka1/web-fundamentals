'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const CHARS = ['<', 'h', 't', 'm', 'l', '>', '<', 'd', 'i', 'v', '>', '<', 'p', '>']
const TREE_NODES = [
  { label: 'html', x: 0, y: 1.2 },
  { label: 'head', x: -1, y: 0.4 },
  { label: 'body', x: 1, y: 0.4 },
  { label: 'div', x: 0.5, y: -0.4 },
  { label: 'p', x: 1.5, y: -0.4 },
]

function CharStream() {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    CHARS.forEach((_, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      const t = ((clock.getElapsedTime() * 0.5 + i * 0.07) % 1)
      mesh.position.x = THREE.MathUtils.lerp(-5.5, -2.2, t)
      mesh.position.y = Math.sin(clock.getElapsedTime() * 2 + i) * 0.1
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = t < 0.9 ? 1 : 1 - (t - 0.9) / 0.1
    })
  })
  return (
    <>
      {CHARS.map((ch, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el }} position={[-5.5, 0, 0]}>
          <planeGeometry args={[0.22, 0.28]} />
          <meshStandardMaterial color="#4D9FFF" emissive="#4D9FFF" emissiveIntensity={0.5} transparent />
        </mesh>
      ))}
      {CHARS.map((ch, i) => (
        <Text key={`t${i}`} position={[-5.5, 0, 0.01]} fontSize={0.16} color="#000000" anchorX="center" anchorY="middle">
          {ch}
        </Text>
      ))}
    </>
  )
}

function Tokenizer() {
  const ref = useRef<THREE.Mesh>(null)
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.4, 1.0, 0.12)), [])
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.2 + Math.sin(clock.getElapsedTime() * 3) * 0.15
    }
  })
  return (
    <group position={[-1.5, 0, 0]}>
      <mesh ref={ref}>
        <boxGeometry args={[1.4, 1.0, 0.12]} />
        <meshStandardMaterial color="#0D0D1A" emissive="#FFB340" emissiveIntensity={0.2} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#FFB340" transparent opacity={0.5} />
      </lineSegments>
      <Text position={[0, 0.15, 0.07]} fontSize={0.15} color="#FFB340" anchorX="center" anchorY="middle">Tokenizer</Text>
      <Text position={[0, -0.12, 0.07]} fontSize={0.11} color="#4A4A6A" anchorX="center" anchorY="middle">parse tokens</Text>
    </group>
  )
}

function TreeNode({ label, x, y, index }: { label: string; x: number; y: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.8, 0.4, 0.1)), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const appear = Math.min(1, Math.max(0, t - index * 0.6))
    ref.current.scale.setScalar(appear)
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.2 + Math.sin(t * 1.5 + index) * 0.05
  })
  return (
    <group position={[x + 2, y, 0]}>
      <mesh ref={ref}>
        <boxGeometry args={[0.8, 0.4, 0.1]} />
        <meshStandardMaterial color="#0D0D1A" emissive="#4D9FFF" emissiveIntensity={0.2} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#4D9FFF" transparent opacity={0.4} />
      </lineSegments>
      <Text position={[0, 0, 0.06]} fontSize={0.14} color="#4D9FFF" anchorX="center" anchorY="middle">{label}</Text>
    </group>
  )
}

function TreeConnectors() {
  const geo = useMemo(() => {
    const pts: number[] = [
      2, 1.2, 0, 1, 0.4, 0,
      2, 1.2, 0, 3, 0.4, 0,
      3, 0.4, 0, 2.5, -0.4, 0,
      3, 0.4, 0, 3.5, -0.4, 0,
    ]
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#4D9FFF" transparent opacity={0.2} />
    </lineSegments>
  )
}

export default function HtmlScene() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#4D9FFF" />
      <CharStream />
      <Tokenizer />
      <TreeConnectors />
      {TREE_NODES.map((n, i) => <TreeNode key={n.label} {...n} index={i} />)}
      <Text position={[-1.5, -1.5, 0]} fontSize={0.13} color="#FFB340" anchorX="center" anchorY="middle">HTML Parser</Text>
      <Text position={[3.5, 1.8, 0]} fontSize={0.13} color="#4D9FFF" anchorX="center" anchorY="middle">DOM Tree</Text>
    </Canvas>
  )
}
