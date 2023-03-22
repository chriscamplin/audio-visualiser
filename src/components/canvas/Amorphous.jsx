import { useEffect, useRef, useState } from 'react'
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { suspend } from 'suspend-react'
import * as THREE from 'three'

import { AnimateTriangleMaterial } from '@/components/canvas/Shader/AnimateTriangleMaterial'

import fragment from './Shader/glsl/video.frag'
import vertex from './Shader/glsl/video.vert'

import createAudio from '@/helpers/createAudio'
// const VideoMaterial = shaderMaterial(
//   {
//     time: 0,
//     audio: 0,
//     color: new THREE.Color(0.05, 0.0, 0.025),
//     map: '',
//     resolution: new THREE.Vector2(),
//   },
//   vertex,
//   fragment
// )

// // This is the 🔑 that HMR will renew if this file is edited
// // It works for THREE.ShaderMaterial as well as for drei/shaderMaterial
// // @ts-ignore
// VideoMaterial.key = THREE.MathUtils.generateUUID()
// // VideoMaterial.defines = { USE_MAP: true }

// extend({ VideoMaterial })
const videoGeometry = new THREE.PlaneGeometry(16, 9, 256, 256).toNonIndexed()

function Amorphous({ texture, url }) {
  const meshRef = useRef(null)
  // const { update } = suspend(() => createAudio(url), [url])
  // console.log(update())

  // const size = 5

  useEffect(() => {
    const length = videoGeometry.attributes.position.count
    const rs = new Float32Array(length * 3)
    const vIds = new Float32Array(length * 3)
    // get faces
    for (let i = 0; i < length; i += 3) {
      const r = Math.random() * 5.0
      rs[i] = r
      rs[i + 1] = r
      rs[i + 2] = r
      vIds[i] = i
      vIds[i + 1] = i + 1
      vIds[i + 2] = i + 2
    }
    // console.log(vIds)
    videoGeometry.setAttribute('aRandom', new THREE.BufferAttribute(rs, 1))
    videoGeometry.setAttribute('vertexId', new THREE.BufferAttribute(vIds, 1))
    videoGeometry.dispose()
  })

  return (
    <>
      <mesh
        ref={meshRef}
        rotation-x={Math.PI * -0.5}
        // onPointerMove={(e) => {}}
        // onPointerOut={() => {}}
        geometry={videoGeometry}
        lights={true}
        castShadow={true}
        receiveShadow={true}
      >
        {/* <planeGeometry args={[16, 9, 128, 128]} /> */}
        {/* <videoMaterial
          map={texture}
          toneMapped={false}
          side={THREE.DoubleSide}
          key={VideoMaterial.key}
          // lights={true}
        /> */}
        <AnimateTriangleMaterial texture={texture} url={url} />
      </mesh>
    </>
  )
}

export default Amorphous
