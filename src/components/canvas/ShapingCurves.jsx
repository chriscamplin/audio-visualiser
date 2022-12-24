import * as THREE from 'three'

import { extend, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'

import createTubeGeometry from '@/components/canvas/createTubeGeometry'
import fragment from '@/components/canvas/Shader/glsl/tube.frag'
import { randomFloat } from '@/lib/random'
// import { shaderMaterial } from '@react-three/drei'
// import useStore from '@/helpers/store'
import vertex from '@/components/canvas/Shader/glsl/tube.vert'

const totalMeshes = 50
const numSides = 8
const subdivisions = 300
const isSquare = false

const mat = {
  side: THREE.DoubleSide,
  defines: {
    lengthSegments: subdivisions.toFixed(1),
    ROBUST: false,
    ROBUST_NORMALS: true, // can be disabled for a slight optimization
    FLAT_SHADED: isSquare,
  },
  glslVersion: THREE.GLSL3,
}

const CurveMesh = ({ material, tubeData }) => {
  const meshRef = useRef()
  const { posArray, angleArray, uvArray } = tubeData
  useFrame((state, delta, xrFrame) => {
    delta = delta / 10
    if (meshRef?.current) {
      meshRef.current.material.uniforms.time.value += delta
    }
  })
  return (
    <mesh
      ref={meshRef}
      // geometry={geometry}
      material={material}
      frustumCulled={false}
    >
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
      {/* <tubeMaterial key={TubeMaterial.key} time={3} /> */}
      {/* <rawShaderMaterial attach="material" {...data} /> */}
    </mesh>
  )
}
const tubeData = createTubeGeometry(numSides, subdivisions)

const ShapingCurves = () => {
  const meshRef = useRef()
  useThree((state) => console.log(state))

  const data = useMemo(
    () => ({
      uniforms: {
        Ka: { value: new THREE.Vector3(1, 1, 1) },
        Kd: { value: new THREE.Vector3(1, 1, 1) },
        Ks: { value: new THREE.Vector3(1, 1, 1) },
        LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
        LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
        Shininess: { value: 200.0 },
        time: { value: 0 },
        thickness: { value: 0 },
        color: { value: new THREE.Color('#43e0ff') },
        animateRadius: { value: 0 },
        animateStrength: { value: 0 },
        index: { value: 0 },
        totalMeshes: { value: totalMeshes },
        radialSegments: { value: numSides },
      },
      ...mat,
      fragmentShader: fragment,
      vertexShader: vertex,
    }),
    []
  )

  const material = useMemo(() => {
    const m = new THREE.RawShaderMaterial()
    m.side = data.side
    m.defines = data.defines
    m.glslVersion = data.glslVersion
    m.fragmentShader = data.fragmentShader
    m.vertexShader = data.vertexShader
    m.key = THREE.MathUtils.generateUUID()
    m.uniformsNeedUpdate = true
    return m
  }, [])
  console.log({ meshRef })
  return (
    <group ref={meshRef}>
      {[...Array(totalMeshes).keys()].map((_, i) => {
        const t = totalMeshes <= 1 ? 0 : i / (totalMeshes - 1)
        const m = material.clone()
        m.uniforms = THREE.UniformsUtils.clone(data.uniforms)
        m.uniforms.index.value = t
        m.uniforms.thickness.value = randomFloat(0.005, 0.0075)
        return <CurveMesh key={i} material={m} tubeData={tubeData} />
      })}
    </group>
  )
}

export default ShapingCurves
