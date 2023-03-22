import { useEffect, useRef, useState } from 'react'
import { Environment, RoundedBox, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'

import { Easings } from '@/lib/easings'

import useStore from '@/helpers/store'
// https://www.opengl.org/sdk/docs/man/html/clamp.xhtml

function clamp(v, minVal, maxVal) {
  return Math.min(maxVal, Math.max(minVal, v))
}
// https://www.opengl.org/sdk/docs/man/html/mix.xhtml

function mix(x, y, a) {
  if (a <= 0) return x
  if (a >= 1) return y
  return x + a * (y - x)
}

const offsets = [
  3.9, // 0
  2.4, // 1
  3.8, // 2
  2.0, // 3
  1.5, // 4
  2.1, // 5
  3.2, // 6
  2.5, // 7
  3.3, // 8
  2.8, // 9
  1, // 10
  2.9, // 11
  0.5, // 12
  0, // 13
  0.5, // 14
  3, // 15
  1, // 16
  3.1, // 17
  3.6, // 18
  2.6, // 19
  3.7, // 20
  2.2, // 21
  1.5, // 22
  2.3, // 23
  3.5, // 24
  3.2, // 25
  3.6, // 26
]

const cubes = []
// const speed = 0.25
const loopDuration = 10
const running = true

let time = 0
let prevTime = performance.now()
const tmp = new THREE.Vector3()
const gridSize = 2

const Shader = (props) => {
  const groupRef = useRef(null)
  const groupPivotRef = useRef(null)
  const geomRef = useRef(null)
  const boxesRef = useRef([])
  const [hovered, setHover] = useState(false)

  // const router = useStore((state) => state.router)
  const viewAudioViz = useStore((state) => state.viewAudioViz)
  const normalMap = useTexture('/txt/normalMap.jpg')
  const matCap = useTexture('/matCaps/GrayGlossy.png')
  const camera = useThree((state) => state.camera)
  useEffect(() => {
    camera.position.set(2, 2, 2)
    camera.lookAt(groupRef.current.position)
  }, [camera])

  useEffect(() => {
    // geomRef.current.center()
    groupRef.current.position.set(0.0, 0, 0)
  }, [])

  const {
    amplitude,
    frequency,
    speed,
    xVal,
    yVal,
    zVal,
    reflectivity,
    iridescence,
    roughness,
    thickness,
    thinFilmIor,
    transmission,
  } = useControls('displacement', {
    amplitude: { value: 0.02, min: 0, max: 0.5, step: 0.01 },
    frequency: { value: 0.25, min: -2, max: 2, step: 0.01 },
    xVal: { value: 0, min: -2, max: 2, step: 0.01 },
    yVal: { value: 0, min: -2, max: 2, step: 0.01 },
    zVal: { value: 0, min: -2, max: 2, step: 0.01 },
    speed: { value: 0.25, min: 0.01, max: 2 },
    reflectivity: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    iridescence: { value: 1, min: 0.1, max: 2, step: 0.1 },
    roughness: { value: 0, min: 0, max: 2, step: 0.1 },
    thickness: { value: 2, min: 0.1, max: 2, step: 0.1 },
    transmission: { value: 1, min: 0.1, max: 2, step: 0.1 },
    thinFilmThickness: { value: '167mm', min: 0.1, max: 2, step: 0.1 },
    thinFilmIor: { value: 1.1, min: 0.1, max: 2, step: 0.1 },
  })

  useFrame(({ scene, camera }, delta) => {
    if (viewAudioViz) return
    // if (groupRef.current) {
    //   groupRef.current.rotation.x += 0.01
    // }

    const t = performance.now()
    const dt = t - prevTime
    prevTime = t

    if (running) {
      time += dt
    }

    const effectTime = ((0.001 * time) % loopDuration) / loopDuration
    const loopTime = Easings.Linear(effectTime)
    console.log({ loopTime })
    const steps = 5
    groupRef.current.children.forEach((c, i) => {
      groupRef.current.children[i].material.thickness = thickness
      groupRef.current.children[i].material.transmission = transmission
      groupRef.current.children[i].material.roughness = roughness
      groupRef.current.children[i].material.iridescence = iridescence
      groupRef.current.children[i].material.iridescence = iridescence
      groupRef.current.children[i].material.thinFilmIor = thinFilmIor

      let f
      const o = cubes[i].offset / steps
      groupRef.current.children[i].visible = true
      if (loopTime < o) {
        f = 0
        // groupRef.current.children[i].visible = false
      } else {
        f = (loopTime - o) / (1 / steps)
      }
      if (cubes[i].offset === 0) f = 1
      f = clamp(0, 1, f)
      groupRef.current.children[i].scale.setScalar(Easings.OutQuint(f))
      tmp.copy(cubes[i].dir).multiplyScalar(5).add(cubes[i].position)
      // tmp.copy(cubes[i].dir).multiplyScalar(5).add(cubes[i].position)
      groupRef.current.children[i].position.copy(cubes[i].position)
      groupRef.current.children[i].position.lerp(tmp, 0.5 - Easings.OutQuint(f))
      // groupRef.current.children[i].position.lerp(tmp, Easings.OutQuint(f))

      // groupRef.current.children[i].lookAt(cubes[i].position)
      groupRef.current.children[i].rotation.set(
        Math.PI * effectTime * speed,
        -Math.PI * 0.5 * effectTime * speed,
        Math.PI * effectTime * 2 * speed
      )
    })

    const zoomTime = Easings.Linear(effectTime)
    const s = mix(1, 1 / 3, zoomTime)
    console.log({ s })
    // groupRef.current.scale.setScalar(s)
    // groupRef.current.rotation.x = (speed * time) / 1000
    // groupRef.current.rotation.y = -(speed * time) / 1000
    // groupRef.current.position.x = 0.5
    // scene.rotation.x = (speed * time) / 1000
    // groupPivotRef.current.rotation.x = (speed * time) / 1000
    // groupPivotRef.current.rotation.y = -(speed * time) / 1100
    // scene.rotation.z = (speed * time) / 1100
    // if (meshRef.current.material) {
    //   meshRef.current.material.uniforms.time.value +=
    //     Math.sin(delta / 2) * Math.cos(delta / 2)
    // }
  })

  useEffect(() => {
    console.log(groupRef.current.children)
  }, [hovered])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 'pointer'
    } else {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])
  let boxIndex = -1

  return !viewAudioViz ? (
    <group ref={groupPivotRef}>
      <Environment
        files='/hdr/winter_evening_4k.hdr'
        background={false} // can be true, false or "only" (which only sets the background) (default: false)
        preset={null}
        ground={{ height: 2, radius: 90, scale: 15 }}
      />
      <group ref={groupRef}>
        {[...new Array(gridSize)].map((_, z) =>
          [...new Array(gridSize)].map((_, y) =>
            [...new Array(gridSize)].map((_, x) => {
              const ptr = (z + 1) * 9 + (y + 1) * 3 + (x + 1)
              cubes.push({
                x,
                y,
                z,
                position: new THREE.Vector3(x + xVal, y - yVal, z + zVal),
                dir: new THREE.Vector3(x, y, z).normalize(),
                offset: clamp(offsets[ptr] - frequency, 0, 10),
              })
              boxIndex += 1
              return (
                <RoundedBox
                  ref={(el) => (boxesRef.current[boxIndex] = el)}
                  radius={0.1}
                  key={Math.random()}
                  position={[x - 1, y - 1, z - 1]}
                  // scale={1.5}
                  onPointerOver={() => setHover(true)}
                  onPointerOut={() => setHover(false)}
                  castShadow={true}
                  receiveShadow={true}
                  {...props}
                >
                  {/* <boxGeometry ref={geomRef} args={[1, 1, 1]} /> */}
                  {/* <meshMatcapMaterial matcap={matCap} /> */}
                  <meshPhysicalMaterial
                    emmisive={new THREE.Color(1, 0, 0)}
                    reflectivity={0.5}
                    iridescence={1}
                    roughness={0}
                    thickness={0.25}
                    shininess={2}
                    transmission={1}
                    thinFilmThickness={'167mm'}
                    thinFilmIor={1.1}
                  />
                </RoundedBox>
              )
            })
          )
        )}
      </group>
    </group>
  ) : null
}

export default Shader
