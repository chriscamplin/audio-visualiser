import * as THREE from 'three'

import { extend, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'

import fragment from './glsl/shader.frag'
import { shaderMaterial } from '@react-three/drei'
import useStore from '@/helpers/store'
import vertex from './glsl/shader.vert'

const ColorShiftMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.05, 0.0, 0.025),
  },
  vertex,
  fragment
)

// This is the 🔑 that HMR will renew if this file is edited
// It works for THREE.ShaderMaterial as well as for drei/shaderMaterial
// @ts-ignore
ColorShiftMaterial.key = THREE.MathUtils.generateUUID()

extend({ ColorShiftMaterial })

const Shader = (props) => {
  const meshRef = useRef(null)
  const [hovered, setHover] = useState(false)
  const router = useStore((state) => state.router)
  const viewAudioViz = useStore((state) => state.viewAudioViz)

  useFrame((state, delta) => {
    if (viewAudioViz) return
    if (meshRef.current) {
      meshRef.current.rotation.x = meshRef.current.rotation.y += 0.01
    }
    if (meshRef.current.material) {
      meshRef.current.material.uniforms.time.value +=
        Math.sin(delta / 2) * Math.cos(delta / 2)
    }
  })

  return !viewAudioViz ? (
    <mesh
      ref={meshRef}
      scale={hovered ? 1.1 : 1}
      onClick={() => {
        console.log({ viewAudioViz })
        useStore.setState({
          viewAudioViz: true,
        })
      }}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}
      {...props}
    >
      <boxGeometry args={[1, 1, 1]} />
      <colorShiftMaterial key={ColorShiftMaterial.key} time={3} />
    </mesh>
  ) : null
}

export default Shader
