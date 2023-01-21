import React, { useMemo, useRef } from 'react'
import { Instance, Instances } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
// import { suspend } from 'suspend-react'
import * as THREE from 'three'

// import createAudio from '@/helpers/createAudio'

const roundedSquareWave = (t, delta, a, f) =>
  ((2.0 * a) / Math.PI) * Math.atan(Math.sin(2.0 * Math.PI * t * f) / delta)
// const scale = new THREE.Vector3()
function Dot({ size, numDots }) {
  const ref = useRef()
  // const { update } = suspend(() => createAudio(url), [url])

  const { vec, transform, positions, distances } = useMemo(() => {
    const vec = new THREE.Vector3()
    const transform = new THREE.Matrix4()
    // Precompute randomized initial positions
    const positions = [...Array(numDots)].map((_, i) => {
      const proxy = new THREE.Object3D()

      const scl = 1.0
      // Place in a grid
      const x = ((i % 100) - 50) * scl
      let y = (Math.floor(i / 100) - 50) * scl
      // const z = (Math.floor(i / 100) - 50) * scl
      // Offset every other column (hexagonal pattern)
      y += i % 8

      proxy.position.set(x, y, 0)
      proxy.rotation.set(0, 0, Math.PI * 1.25)

      // Add some noise
      // position.x += Math.random() * 0.13
      // position.y += Math.random() * 0.13
      // position.z += Math.random() * 0.3
      return proxy
    })

    // Precompute initial distances with octagonal offset
    const right = new THREE.Vector3(1, 0, 0)
    console.log({ positions })
    const distances = positions.map(
      ({ position }) =>
        position.length() + Math.cos(position.angleTo(right) * 4) * 0.5
    )

    return { vec, transform, positions, distances }
  }, [numDots])

  console.log({ transform })

  useFrame(({ clock }) => {
    // const avg = update()
    for (let i = 0; i < numDots; i++) {
      const dist = distances[i]
      // const scl = dist * 0.1
      // Distance affects the wave phase
      const t = clock.elapsedTime - dist / 7.5
      const wave = roundedSquareWave(t, 0.15 + (0.2 * dist) / 72, 0.4, 1 / 3.8)

      // const wave = roundedSquareWave(t, 0.15 + (scl * dist) / 72, 0.4, 1 / avg)
      // Oscillates between -0.4 and +0.4
      // s positions[i].z += -wave * dist
      // Scale initial position by our oscillator
      vec.copy(positions[i].position).multiplyScalar(wave - 2.3)
      vec.applyAxisAngle(positions[i].rotation, wave)
      // vec.addScalar(wave)
      // vec.copy(positions[i].position).setScalar(dist)
      // console.log(vec)
      // Apply the Vector3 to a Matrix4
      transform.setPosition(vec)
      // transform.makeScale(scl, scl, scl)
      // transform.setScale(scale.set(dist, dist, dist))
      // ref.current.material.color.setHSL(0.25, 1, 1)
      // Update Matrix4 for this instance
      ref.current.setMatrixAt(i, transform)

      // ref.current.setMatrixAt(i, new THREE.Color(1, 0, 0))
    }
    // ref.current.scale.set(100, 100, 100)
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <Instances
      limit={numDots} // Optional: max amount of items (for calculating buffer size)
      range={numDots} // Optional: draw-range
      receiveShadow
      castShadow
      ref={ref}
      // args={[null, null, numDots]}
    >
      <circleGeometry args={[size, 32]} />
      <meshBasicMaterial
        color={'white'}
        lights={true}
        // roughness={0}
        // transmission={1} // Add transparency
        // thickness={0.5} // Add refraction!
      />
      {[...Array(numDots).keys()].map(() => (
        <Instance
          key={Math.random()}
          color='red'
          // scale={[10, 10, 10]}
          position={[1, 2, 3]}
          rotation={[Math.PI / 3, 0, 0]}
        />
      ))}
    </Instances>
  )
}

function Dots({ url, numDots = 10000, size = 0.25 }) {
  return <Dot url={url} numDots={numDots} size={size} />
}

export default Dots
