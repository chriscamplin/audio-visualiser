import { useEffect, useMemo, useRef, useState } from 'react'
import { Environment } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'

import createTubeGeometry from '@/components/canvas/createTubeGeometry'
import fragment from '@/components/canvas/Shader/glsl/tube.frag'
// import { shaderMaterial } from '@react-three/drei'
// import useStore from '@/helpers/store'
import vertex from '@/components/canvas/Shader/glsl/tube.vert'

// import { randomFloat } from '@/lib/random'

const totalMeshes = 20
const numSides = 8
const subdivisions = 300
const isSquare = false
// some hand-picked colors
const palettes = [
  '#f6a271',
  '#5a2d3a',
  '#3a83d5',
  '#b954d0',
  '#cfff0d',
  '#ff003c',
  '#e6ac27',
  '#d95b43',
  '#a3a948',
  '#838689',
  '#556270',
  '#292c37',
  '#fa6900',
  '#eb7b59',
  '#ff4e50',
  '#9d9d93',
  '#00a8c6',
  '#2b4e72',
  '#e4844a',
  '#9cc4e4',
  '#515151',
]
const paletteIndex = 0

class CurveMaterial extends THREE.RawShaderMaterial {
  constructor() {
    super({
      side: THREE.DoubleSide,
      defines: {
        lengthSegments: subdivisions.toFixed(1),
        ROBUST: false,
        ROBUST_NORMALS: true, // can be disabled for a slight optimization
        FLAT_SHADED: isSquare,
      },
      glslVersion: THREE.GLSL3,
      uniforms: {
        Ka: { value: new THREE.Vector3(1, 1, 1) },
        Kd: { value: new THREE.Vector3(1, 1, 1) },
        Ks: { value: new THREE.Vector3(1, 1, 1) },
        LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
        LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
        Shininess: { value: 200.0 },
        time: { value: 0 },
        thickness: { value: 1 },
        color: { value: new THREE.Color('#e6e6e6') },
        animateRadius: { value: 0 },
        animateStrength: { value: 0 },
        index: { value: 0 },
        totalMeshes: { value: totalMeshes },
        radialSegments: { value: numSides },
        uOffset: { value: 0 },
        uXOffset: { value: 0 },
        uYOffset: { value: 0 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    })
  }
}

extend({ CurveMaterial })

const CurveMesh = ({ tubeData, index, material, color }) => {
  const meshRef = useRef()
  const {
    radialSegments,
    animateRadius,
    thickness,
    uOffset,
    uXOffset,
    uYOffset,
  } = useControls({
    radialSegments: numSides,
    animateRadius: 0,
    thickness: {
      value: 0.005,
      min: 0,
      max: 0.01,
      step: 0.001,
    },
    uOffset: {
      value: 2.0,
      min: 0,
      max: 8,
      step: 0.01,
    },
    uXOffset: {
      value: 1,
      min: 0,
      max: 8,
      step: 0.1,
    },
    uYOffset: {
      value: 1,
      min: 0,
      max: 8,
      step: 0.1,
    },
  })

  const { posArray, angleArray, uvArray } = tubeData
  const t = totalMeshes <= 1 ? 0 : index / (totalMeshes - 1)

  useFrame((state, delta) => {
    if (material.uniforms) {
      material.uniforms.time.value += delta
      material.uniforms.animateRadius.value = animateRadius
    }
  })

  useEffect(() => {
    material.uniforms.index.value = t
    material.uniforms.thickness.value = thickness
    material.uniforms.radialSegments.value = radialSegments
    meshRef.current.material.uniforms.animateRadius.value = animateRadius
    meshRef.current.material.uniforms.uOffset.value = uOffset
    meshRef.current.material.uniforms.uXOffset.value = uXOffset
    meshRef.current.material.uniforms.uYOffset.value = uYOffset
    meshRef.current.material.uniforms.color.value = new THREE.Color(color)
  })
  return (
    <mesh ref={meshRef} frustumCulled={false} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position' // <- new attributes attach
          array={posArray}
          itemSize={1}
          count={posArray.length}
        />
        <bufferAttribute
          attach='attributes-angle' // <- new attributes attach
          array={angleArray}
          itemSize={1}
          count={angleArray.length}
        />
        <bufferAttribute
          attach='attributes-uv' // <- new attributes attach
          array={uvArray}
          itemSize={2}
          count={uvArray.length}
        />
      </bufferGeometry>
    </mesh>
  )
}
const tubeData = createTubeGeometry(numSides, subdivisions)

const ShapingCurves = () => {
  const meshRef = useRef()
  const matRef = useRef()
  const [material, setMaterial] = useState()
  const [paletteIdx, setPaletteIdx] = useState(paletteIndex)
  const materials = useMemo(
    () =>
      material && [...Array(totalMeshes).keys()].map(() => material.clone()),
    [material]
  )

  useEffect(() => setMaterial(matRef.current), [setMaterial])
  const baubleMaterial = new THREE.MeshPhysicalMaterial({
    color: palettes[paletteIdx],
    roughness: 0,
    thickness: 0.25,
    transmission: 1,
    envMapIntensity: 0.2,
    emissive: '#370037',
    side: THREE.BackSide,
  })

  const { gl } = useThree()

  console.log({ meshRef })
  return (
    <>
      <group ref={meshRef}>
        <curveMaterial
          ref={matRef}
          transparent
          depthWrite={false}
          depthTest={false}
        />

        {material &&
          [...Array(totalMeshes).keys()].map((_, i) => (
            <CurveMesh
              key={i}
              tubeData={tubeData}
              index={i}
              material={materials[i]}
              color={palettes[paletteIdx]}
            />
          ))}
      </group>
      <mesh
        lights={true}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.025, 0]}
        // scale={[4, 4, 4]}
        // visible={false}
        onClick={() => {
          console.log({ drawCalls: gl.info.render })
          setPaletteIdx(Math.round(Math.random() * palettes.length))
        }}
        material={baubleMaterial}
      >
        <sphereGeometry />
        <Environment files='/adamsbridge.hdr' />

        {/* <shadowMaterial transparent opacity={0.15} /> */}
        {/* <meshBasicMaterial /> */}
      </mesh>
      <mesh
        lights={true}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.025, 0]}
        scale={[1.5, 1.5, 1.5]}
        // visible={false}
        onClick={() => {
          console.log({ drawCalls: gl.info.render })
          setPaletteIdx(Math.round(Math.random() * palettes.length))
        }}
        material={baubleMaterial}
      >
        <sphereGeometry />
        <Environment files='/adamsbridge.hdr' />

        {/* <shadowMaterial transparent opacity={0.15} /> */}
        {/* <meshBasicMaterial /> */}
      </mesh>
    </>
  )
}

export default ShapingCurves
