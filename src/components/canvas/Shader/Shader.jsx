import { useEffect, useRef, useState } from 'react'
import { shaderMaterial, useTexture } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import fragment from './glsl/shader.frag'
import vertex from './glsl/shader.vert'

import useStore from '@/helpers/store'

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
ColorShiftMaterial.key = THREE.MathUtils.generateUUID()

extend({ ColorShiftMaterial })

const Shader = (props) => {
  const meshRef = useRef(null)
  const [hovered, setHover] = useState(false)
  // const router = useStore((state) => state.router)
  const viewAudioViz = useStore((state) => state.viewAudioViz)
  const normalMap = useTexture('/txt/normalMap.jpg')
  const matCap = useTexture('/matCaps/Bronze.png')

  useFrame((state, delta) => {
    if (viewAudioViz) return
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
    }
    // if (meshRef.current.material) {
    //   meshRef.current.material.uniforms.time.value +=
    //     Math.sin(delta / 2) * Math.cos(delta / 2)
    // }
  })

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 'pointer'
    } else {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

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
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      {...props}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshMatcapMaterial normalMap={normalMap} matcap={matCap} />
      {/* <colorShiftMaterial key={ColorShiftMaterial.key} time={3} /> */}
    </mesh>
  ) : null
}

export default Shader
