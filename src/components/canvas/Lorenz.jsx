import { useEffect, useMemo, useRef, useState } from 'react'
import { Environment, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
// import { Bloom, EffectComposer, SSAO } from '@react-three/postprocessing'
import { useControls } from 'leva'
// import { BlurPass, KernelSize, Resizer } from 'postprocessing'
import * as THREE from 'three'

import Mirror from '@/components/canvas/Mirror'
import { AnimateTubeMaterial } from '@/components/canvas/Shader/AnimateTubeMaterial'

import aizawa from '@/helpers/aizawa'
import chaoticSystem from '@/helpers/chaoticSystem'
import dadrasAttractorLayout from '@/helpers/dadras'
import lorenz from '@/helpers/lorenz'
import torus from '@/helpers/torus'
// Array curve holds the positions of points generated from a lorenz equation; lorenz function below generates the points and returns an array of points

// const vertices = new Float32Array(arrayCurve)
// console.log({ vertices })
// geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

// create an empty array to  hold targets for the attribute we want to morph
// morphing positions and normals is supported
// geometry.morphAttributes.position = []
// const morphedPositions = []
// const positionAttribute = geometry.attributes.position
// const direction = new THREE.Vector3(1, 0, 0)
// const vertex = new THREE.Vector3()
// // Varying the points on each frame
// let step = 0

// step += 0.01
// // const count = 0
// const a = 0.9 + Math.random() * 6
// const b = 3.4 + Math.random() * 7
// const f = 9.9 + Math.random() * 8
// const g = 1 + Math.random()
// const t = 0.001
// // use https://threejs.org/examples/?q=morph#webgl_morphtargets
// for (let i = 0; i < geometry.attributes.position.length; i += 3) {
//   const x = positionAttribute.getX(i)
//   const y = positionAttribute.getY(i)
//   const z = positionAttribute.getZ(i)
//   morphedPositions.push(
//     x - t * a * x + t * y * y - t * z * z + t * a * f,
//     y - t * y + t * x * y - t * b * x * z + t * g,
//     z - t * z + t * b * x * y + t * x * z
//   )
//   vertex
//     .applyAxisAngle(direction, (Math.PI * x) / 2)
//     .toArray(morphedPositions, morphedPositions.length)
// }
// geometry.verticesNeedUpdate = true
// // add the spherical positions as the first morph target
// geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
//   morphedPositions,
//   3
// )
const dummy = new THREE.Vector3()
const lookAtPos = new THREE.Vector3()

export default function Lorenz() {
  const { a, b, f, g, nrmlScl, thickness } = {
    a: 2.8,
    b: 17,
    f: 15,
    g: 2.1,
    thickness: 1,
    nrmlScl: [0.25, 0.25],
  }

  const arrayCurve3 = useMemo(() => lorenz(a, b, f, g), [a, b, f, g])
  // const arrayCurve2 = useMemo(() => chaoticSystem(), [])
  const arrayCurve = useMemo(
    () =>
      dadrasAttractorLayout(
        2.9444489320504594,
        2.444966264736588,
        1.5397623439638863,
        1.5606585994239954,
        7.0473581973595385
      ),
    []
  )
  const arrayCurve2 = useMemo(
    () =>
      dadrasAttractorLayout(
        2.9444489320504594,
        2.444966264736588,
        1.5397623439638863,
        1.5606585994239954,
        7.0473581973595385
      ),
    []
  )

  // Generating the geometry
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(arrayCurve),
    [arrayCurve]
  )
  // Generating the geometry
  const curve2 = useMemo(
    () => new THREE.CatmullRomCurve3(arrayCurve2),
    [arrayCurve2]
  )

  // const pts = curve.getPoints(5000)
  // const width = 2
  // pts.forEach((p) => {
  //   p.x += width
  // })
  // const geometry = new THREE.BufferGeometry().setFromPoints(pts)
  const geometry = useMemo(
    () => new THREE.TubeGeometry(curve, 100000, thickness, 8, false),
    [curve, thickness]
  )
  const geometry3 = new THREE.TorusKnotGeometry(10, 3, 100, 16)
  const geometry2 = useMemo(
    () => new THREE.TubeGeometry(curve2, 200000, thickness, 8, false),
    [curve2, thickness]
  )
  useEffect(() => {
    // geometry2.rotateX(Math.PI * 0.5)
    // geometry2.rotateY(Math.PI * 0.5)
    // geometry2.rotateZ(Math.PI * 0.5)

    const vertices = new Float32Array(geometry2.getAttribute('position').array)
    const normals = new Float32Array(geometry2.getAttribute('normal').array)
    const uvs = new Float32Array(geometry2.getAttribute('uv').array)
    geometry.setAttribute('newPosition', new THREE.BufferAttribute(vertices, 3))
    geometry.setAttribute('newNormal', new THREE.BufferAttribute(normals, 3))
    geometry.setAttribute('newUv', new THREE.BufferAttribute(uvs, 2))
  }, [geometry2, geometry])

  const groupRef = useRef()
  const matRef = useRef()
  useEffect(() => {
    if (nrmlScl.length === 0) return
    matRef.current.normalScale = new THREE.Vector2(nrmlScl[0], nrmlScl[1])
  }, [nrmlScl[0], nrmlScl[1]])

  useFrame((state, delta) => {
    // const animationDuration = 10
    // const sineLoop =
    //   Math.sin(
    //     (Math.PI * (state.clock.elapsedTime - 0.75)) / animationDuration
    //   ) /
    //     2.0 +
    //   0.5
    // groupRef.current.rotation.x -= Math.PI * sineLoop * 0.0075
    // groupRef.current.rotation.y += Math.PI * sineLoop * 0.005
    // groupRef.current.rotation.z += Math.PI * sineLoop * 0.005
    // state.camera.fov = THREE.MathUtils.lerp(
    //   state.camera.fov,
    //   zoom ? 38 : 48,
    //   step
    // )
    // state.camera.position.set(0, -120 + 50 * sineLoop, -100 + 50 * sineLoop)
    // console.log(state.camera.rotation)
    // state.camera.rotation.set(
    //   0, // - Math.PI * 0.01 * sineLoop,
    //   0,
    //   0 // - Math.PI * 0.01 * sineLoop
    // )
    // lookAtPos.x = Math.sin(state.clock.getElapsedTime() * 2)
    // state.camera.lookAt(lookAtPos)
    // state.camera.updateProjectionMatrix()
  })
  const normalMap = useTexture('/normalmaps/167_norm.jpg')
  const matCap = useTexture('/matCaps/3B3C3F_DAD9D5_929290_ABACA8-512px.png')

  return (
    <>
      <Environment
        // files='/adamsbridge.hdr'
        files='/hdr/kloppenheim_07_puresky_4k.hdr'
        background={false} // can be true, false or "only" (which only sets the background) (default: false)
        preset={null}
        ground={{ height: 200, radius: 2000, scale: 250 }}
      />
      {/* <EffectComposer smaa>
        <Bloom />
        <SSAO />
      </EffectComposer> */}

      {/* <ambientLight intensity={0.175} />
      <hemisphereLight
        intensity={0.5}
        color='#ffffff'
        skyColor='#ff9900'
        groundColor='#994466'
      />

      <directionalLight
        intensity={0.5}
        position={[-500, -500, -500]}
        color={'#ff9999'}
      /> */}
      {/* <Mirror scale={1000} /> */}
      <group ref={groupRef}>
        <mesh geometry={geometry} frustumCulled={false}>
          <meshMatcapMaterial
            ref={matRef}
            // transparent
            // opacity={0.8}
            normalMap={normalMap}
            // normalMapType={THREE.ObjectSpaceNormalMap}
            matcap={matCap}
            vertexColors={THREE.vertexColors}
            side={THREE.DoubleSide}
          />
          <AnimateTubeMaterial />
          {/* <meshPhysicalMaterial
            emmisive={'red'}
            reflectivity={1}
            iridescence={1}
            metalness={0.5}
            roughness={0}
            thickness={1}
            shininess={1}
            clearcoat={1}
            transmission={1}
            thinFilmThickness={'167mm'}
            thinFilmIor={1.1}
          /> */}
          {/* <pointsMaterial size={0.1} /> */}
        </mesh>
      </group>
    </>
  )
}
