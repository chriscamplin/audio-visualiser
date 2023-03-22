import { useRef } from 'react'
import { Environment, useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Model = () => {
  const modelRef = useRef()
  useFrame((gl, delta) => {})

  const model = useGLTF('/models/bust-me.glb', '/draco-gltf')
  console.log(model.nodes)
  return (
    <>
      <Environment
        files='/hdr/winter_evening_4k.hdr'
        background={true} // can be true, false or "only" (which only sets the background) (default: false)
        preset={null}
        // ground={{ height: 2, radius: 90, scale: 15 }}
      />
      <mesh
        // scale={[scale, scale, scale]}
        rotation={[Math.PI * 0.5, -Math.PI * 0.25, -Math.PI * 0.25]}
        ref={modelRef}
        geometry={model.nodes['mesh'].geometry}
      >
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.1}
          roughness={0.5}
          metalness={1}
          // envMap={texture}
          // side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}
export default Model
