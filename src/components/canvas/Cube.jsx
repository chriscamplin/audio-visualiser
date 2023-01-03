import * as THREE from 'three'

import { useEffect, useRef } from 'react'

import { Environment } from '@react-three/drei'
import createAudio from '@/helpers/createAudio'
import { suspend } from 'suspend-react'
import { useFrame } from '@react-three/fiber'

function Cube({
  url,
  y = 2500,
  space = 1.8,
  width = 0.045,
  height = 0.045,
  obj = new THREE.Object3D(),
  ...props
}) {
  const ref = useRef()
  const numBlocks = 80
  // suspend-react is the library that r3f uses internally for useLoader. It caches promises and
  // integrates them with React suspense. You can use it as-is with or without r3f.
  const { update } = suspend(() => createAudio(url), [url])
  const data = [...Array(numBlocks).keys()]
  console.log(data)
  useFrame((state) => {
    let avg = update()
    // Distribute the instanced cubes according to the frequency daza
    //position.z = (i % 200) - 50
    // console.log(state.clock, state.clock.elapsedTime)

    for (let i = 0; i < data.length; i++) {
      const x = (i % 10) - 4.5
      const y = Math.floor(i / 10) - 4.5
      const z = 1.5
      obj.position.set(x * 0.1, y * 0.1, z)
      // console.log('ROT')
      obj.rotation.set(
        state.clock.elapsedTime * 0.125 * Math.PI,
        state.clock.elapsedTime * 0.125 * Math.PI,
        0
      )
      obj.updateMatrix()
      ref.current.setMatrixAt(i, obj.matrix)
    }
    // Set the hue according to the frequency average
    // ref.current.material.color.setHSL(avg / 50, 0.75, 0.75)
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh
      lights
      castShadow
      receiveShadow
      ref={ref}
      args={[null, null, data.length]}
      {...props}
    >
      <boxGeometry args={[width, height, width]} />
      {/* <meshBasicMaterial lights={true} /> */}
      <Environment files='/adamsbridge.hdr' />

      <meshPhysicalMaterial
        // color={'white'}
        lights={true}
        roughness={0}
        transmission={0.5} // Add transparency
        thickness={0.05} // Add refraction!
        envMapIntensity={0.2}
        // emissive={'#ff0000'}
        // side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}

export default Cube
