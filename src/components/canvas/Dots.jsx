import React, { useMemo, useRef } from 'react'
import { useSphere } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { suspend } from 'suspend-react'
import * as THREE from 'three'

import createAudio from '@/helpers/createAudio'

const roundedSquareWave = (t, delta, a, f) =>
  ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)

function Dots({ url, numDots = 20000, size = 0.2 }) {
  const [ref, { at }] = useSphere(
    () => ({
      args: [size],
      mass: 1,
      position: [
        Math.random() * 33.333 - 10,
        Math.random() * 33.333 - 10,
        Math.random() * 33.333 - 10,
      ],
    }),
    useRef()
  )

  // const ref = useRef()
  const { update } = suspend(() => createAudio(url), [url])

  const { vec, transform, positions, distances } = useMemo(() => {
    const vec = new THREE.Vector3()
    const transform = new THREE.Matrix4()

    // Precompute randomized initial positions
    const positions = [...Array(numDots)].map((_, i) => {
      const position = new THREE.Vector3()
      // Place in a grid
      position.x = (i % 200) - 50
      position.y = Math.floor(i / 200) - 50
      // position.z = (i % 200) - 50

      // Offset every other column (hexagonal pattern)
      position.y += (i % 2) * 0.5

      // Add some noise
      position.x += Math.random() * 0.3
      position.y += Math.random() * 0.3
      // position.z += Math.random() * 0.3
      return position
    })

    // Precompute initial distances with octagonal offset
    const right = new THREE.Vector3(1, 0, 0)
    const distances = positions.map(
      (pos) => pos.length() + Math.cos(pos.angleTo(right) * 8) * 0.5
    )

    return { vec, transform, positions, distances }
  }, [])
  // useFrame(({ clock }) => {
  //   const avg = update()
  //   // for (let i = 0; i < numDots; ++i) {
  //   //   const dist = distances[i]

  //   //   // Distance affects the wave phase
  //   //   const t = clock.elapsedTime - dist / 15

  //   //   // Oscillates between -0.4 and +0.4
  //   //   const wave = roundedSquareWave(
  //   //     t,
  //   //     10 / avg + (0.2 * dist) / avg,
  //   //     10 / avg,
  //   //     1 / 3.8
  //   //   )
  //   //   //positions[i].z = -(avg / dist) * 2 * 0.125
  //   //   // Scale initial position by our oscillator
  //   //   vec.copy(positions[i]).multiplyScalar(wave + 1.3)

  //   //   // Apply the Vector3 to a Matrix4
  //   //   transform.setPosition(vec)
  //   //   //ref.current.material.color.setHSL(0.25, 1, 1)

  //   //   // Update Matrix4 for this instance
  //   //   ref.current.setMatrixAt(i, transform)
  //   //   //ref.current.setMatrixAt(i, new THREE.Color(1, 0, 0))
  //   // }

  //   //ref.current.instanceMatrix.needsUpdate = true
  //   // at(Math.floor(Math.random() * numDots)).position.set(
  //   //   0,
  //   //   Math.random() * 2,
  //   //   0
  //   // )
  // })
  useFrame(
    () => {}
    // at(Math.floor(Math.random() * numDots)).position.set(
    //   0,
    //   Math.random() * 2,
    //   0
    // )
  )

  return (
    <Physics broadphase='SAP' gravity={[0, -0.3, 0]}>
      <instancedMesh
        receiveShadow
        castShadow
        ref={ref}
        args={[null, null, numDots]}
      >
        <sphereBufferGeometry args={[size, 32]} />
        <meshPhysicalMaterial
          color={'white'}
          lights={true}
          roughness={0}
          transmission={1} // Add transparency
          thickness={0.5} // Add refraction!
        />
      </instancedMesh>
    </Physics>
  )
}

export default Dots
